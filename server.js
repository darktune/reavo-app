import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import chatHandler from './api/chat.js';
import adminChatHandler from './api/adminChat.js';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const app = express();
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.post('/api/chat', async (req, res) => {
  try {
    await chatHandler(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/adminChat', async (req, res) => {
  try {
    await adminChatHandler(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Security: Verify Admin Authorization for Financial & Sensitive Endpoints
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Check staff table for assigned role
    const { data: staffMember } = await supabase
      .from('staff')
      .select('role, is_active')
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .single();

    const role = staffMember?.role || user.app_metadata?.role;
    const isActive = staffMember ? staffMember.is_active : true;

    if (!isActive || !['Owner', 'Admin', 'superadmin'].includes(role)) {
      return res.status(403).json({ error: 'Forbidden: Requires administrative privileges' });
    }

    req.user = user;
    req.role = role;
    next();
  } catch (err) {
    console.error('Auth Verification Error:', err);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

app.get('/api/korapay/balance', verifyAdmin, async (req, res) => {
  try {
    const response = await fetch('https://api.korapay.com/merchant/api/v1/balances', {
      headers: {
        'Authorization': `Bearer ${process.env.KORAPAY_SECRET_KEY}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (error) {
    console.error('Kora Pay Balance Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Kora Pay Disbursement Endpoint (Protected)
app.post('/api/korapay/disburse', verifyAdmin, async (req, res) => {
  const { amount, bank_code, account_number, account_name, reference } = req.body;

  try {
    // 1. Call Kora Pay API
    const response = await fetch('https://api.korapay.com/merchant/api/v1/transactions/disburse', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.KORAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reference: reference,
        destination: {
          type: 'bank_account',
          amount: amount.toString(),
          currency: 'NGN',
          narration: 'Reavo Ambassador Payout',
          bank_account: {
            bank: bank_code,
            account: account_number
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Kora Pay Error:', data);
      return res.status(response.status).json(data);
    }

    // 2. Insert into Supabase payouts table
    const { data: dbData, error: dbError } = await supabase
      .from('payouts')
      .insert([{
        recipient_name: account_name,
        account_number,
        bank_code,
        amount,
        status: data.data?.status || 'pending',
        reference
      }])
      .select();

    if (dbError) {
      console.error('Database Error:', dbError);
      // We still return success if the payout went through, but log DB error
    }

    res.json(data);
  } catch (error) {
    console.error('Kora Pay Disbursement Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// CENTRALIZED EMAIL / NODEMAILER SERVICE
// ==========================================
export async function getEmailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Ethereal mock for staging/development
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
}

export async function sendEmail({ to, subject, html, text }) {
  const transporter = await getEmailTransporter();
  const from = process.env.SMTP_USER ? `"REAVO Store" <${process.env.SMTP_USER}>` : '"REAVO Store" <system@reavo.com>';
  
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: text || html.replace(/<[^>]*>?/gm, ''),
    html,
  });

  if (!process.env.SMTP_HOST) {
    console.log('[Email Simulation] Message sent via Ethereal. Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
}

// Endpoint: Send Test Email (Protected for Admins & Developers)
app.post('/api/email/test', verifyAdmin, async (req, res) => {
  try {
    const { to } = req.body;
    const recipient = to || req.user?.email || process.env.ADMIN_EMAIL || 'admin@reavo.com';
    const info = await sendEmail({
      to: recipient,
      subject: '✅ REAVO SMTP Test Email - Setup Verified',
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #39D9C4; border-radius: 12px; background: #0b0f19; color: #ffffff;">
          <h2 style="color: #39D9C4; margin-top: 0;">SMTP Gateway Active!</h2>
          <p>Congratulations! Your REAVO Nodemailer SMTP configuration is functioning properly.</p>
          <div style="background: rgba(255,255,255,0.05); padding: 14px; border-radius: 8px; margin: 16px 0; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>Host:</strong> ${process.env.SMTP_HOST || 'smtp.ethereal.email (Dev Mock)'}</p>
            <p style="margin: 4px 0;"><strong>Port:</strong> ${process.env.SMTP_PORT || 587}</p>
            <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          <p style="font-size: 12px; color: #888;">This email confirms your server is ready to dispatch order confirmations, courier dispatch alerts, and staff invite links.</p>
        </div>
      `
    });

    res.json({ 
      success: true, 
      message: `Test email dispatched to ${recipient}`, 
      preview: !process.env.SMTP_HOST ? nodemailer.getTestMessageUrl(info) : null 
    });
  } catch (error) {
    console.error('Test email failure:', error);
    res.status(500).json({ error: error.message });
  }
});

// Kora Pay Webhook Endpoint (Resilient HMAC with rawBody support)
app.post('/api/korapay/webhook', async (req, res) => {
  try {
    const secret = process.env.KORAPAY_SECRET_KEY;
    const signature = req.headers['x-korapay-signature'];
    const payload = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    // Verify signature (allowing sandbox mock bypass in local dev if secret is test mode)
    const isSignatureValid = hash === signature || (!signature && process.env.NODE_ENV !== 'production');

    if (isSignatureValid) {
      const event = req.body;
      console.log('Valid Kora Webhook received:', event.event);

      // 1. Customer Checkout Payment Succeeded
      if (event.event === 'charge.success') {
        const reference = event.data?.reference;
        console.log(`[Webhook] Customer charge succeeded for ref: ${reference}`);
        
        await supabase
          .from('orders')
          .update({ status: 'processing', payment_status: 'paid' })
          .or(`kora_reference.eq.${reference},id.eq.${reference}`);

        // Send order receipt email
        if (event.data?.customer?.email) {
          sendEmail({
            to: event.data.customer.email,
            subject: `Order Receipt - Payment Confirmed (#${reference})`,
            html: `
              <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
                <h2 style="color: #39D9C4;">Order Confirmed!</h2>
                <p>Hello ${event.data.customer.name || 'Customer'},</p>
                <p>Your payment of <strong>₦${Number(event.data.amount || 0).toLocaleString()}</strong> was successfully processed by KoraPay.</p>
                <p><strong>Reference:</strong> ${reference}</p>
                <p>Our campus runner team is preparing your package for delivery.</p>
                <div style="background: #f9f9f9; padding: 14px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 13px; color: #666;">View your delivery progress and Handover PIN on your account page at <a href="http://localhost:5173/profile">My Account</a>.</p>
                </div>
              </div>
            `
          }).catch(err => console.error('Error sending order receipt email:', err));
        }

      // 2. Ambassador Payout Disbursed
      } else if (event.event === 'transfer.success') {
        const reference = event.data.reference;
        await supabase
          .from('payouts')
          .update({ status: 'success' })
          .eq('reference', reference);
          
      // 3. Ambassador Payout Failed
      } else if (event.event === 'transfer.failed') {
        const reference = event.data.reference;
        await supabase
          .from('payouts')
          .update({ status: 'failed' })
          .eq('reference', reference);
      }

      res.status(200).send('Webhook received successfully');
    } else {
      console.log('Invalid Kora signature');
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Partnership form submission
app.post('/api/partnerships', async (req, res) => {
  const { name, organisation, email, type, message } = req.body;

  try {
    // 1. Insert into Supabase
    const { data: dbData, error: dbError } = await supabase
      .from('partnership_inquiries')
      .insert([{ name, organisation, email, type, message }])
      .select();

    if (dbError) {
      throw new Error('Database Error: ' + dbError.message);
    }

    // 2. Send Email via Centralized Service
    await sendEmail({
      to: 'partnerships@reavoglobal.com',
      subject: `New Partnership Inquiry: ${organisation} (${type})`,
      text: `You have received a new partnership inquiry.\n\nName: ${name}\nOrganisation: ${organisation}\nEmail: ${email}\nType: ${type}\n\nMessage:\n${message || 'No message provided.'}\n\nView this in the Admin OS to reply or update status.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #6366f1;">New Partnership Inquiry</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Organisation:</strong> ${organisation}</p>
          <p><strong>Interest:</strong> ${type}</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; margin-top: 5px;">${message || '<i>No message provided.</i>'}</p>
          </div>
          <p style="font-size: 12px; color: #888;">Log into the Reavo Admin OS to manage this inquiry.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, inquiry: dbData[0] });

  } catch (error) {
    console.error('Partnerships API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// AI AUTOMATIONS & CRON JOBS
// ==========================================
const verifyCron = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized CRON execution' });
  }
  next();
};

app.get('/api/cron/daily-briefing', verifyCron, async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday.setHours(0,0,0,0)).toISOString();
    const yesterdayEnd = new Date(yesterday.setHours(23,59,59,999)).toISOString();

    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, status')
      .gte('created_at', yesterdayStart)
      .lte('created_at', yesterdayEnd);

    const { data: lowStockProducts } = await supabase
      .from('products')
      .select('name, stock_quantity')
      .lte('stock_quantity', 5);

    const totalRevenue = (orders || []).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const orderCount = (orders || []).length;
    const outOfStockCount = (lowStockProducts || []).filter(p => p.stock_quantity === 0).length;
    const lowStockCount = (lowStockProducts || []).filter(p => p.stock_quantity > 0).length;

    const emailList = process.env.ADMIN_EMAIL || 'admin@reavoglobal.com';
    await sendEmail({
      to: emailList,
      subject: `🌅 REAVO Daily Morning Briefing`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1;">🌅 REAVO Morning Briefing</h2>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Total Revenue (Yesterday):</strong> ₦${totalRevenue.toLocaleString()}</p>
            <p><strong>Total Orders:</strong> ${orderCount}</p>
          </div>
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px;">
            <p style="color: #991b1b; margin: 0;"><strong>Inventory Attention:</strong></p>
            <p style="margin-top: 5px;">Out of Stock SKUs: ${outOfStockCount}</p>
            <p>Low Stock SKUs (<5): ${lowStockCount}</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: 'Briefing sent' });
  } catch (error) {
    console.error('Cron Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cron/hourly-stock', verifyCron, async (req, res) => {
  try {
    const { data: outOfStock } = await supabase
      .from('products')
      .select('name, stock_quantity')
      .eq('stock_quantity', 0);

    if (outOfStock && outOfStock.length > 0) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@reavoglobal.com',
        subject: `⚠️ URGENT: ${outOfStock.length} Items Out of Stock`,
        html: `<p>The following items have hit 0 stock:</p><ul>${outOfStock.map(p => `<li>${p.name}</li>`).join('')}</ul>`
      });
    }
    res.status(200).json({ success: true, outOfStockCount: outOfStock?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SEO Endpoints
app.get('/robots.txt', (req, res) => {
  const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://reavo-app.vercel.app').replace(/\/$/, '');
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /checkout/

Sitemap: ${siteUrl}/sitemap.xml`);
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://reavo-app.vercel.app').replace(/\/$/, '');
    const { data: products, error } = await supabase
      .from('products')
      .select('id, updated_at');

    if (error) throw error;

    const staticRoutes = [
      '',
      '/home',
      '/shop',
      '/story',
      '/about',
      '/compare',
      '/partnerships',
      '/ambassadors'
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static routes
    staticRoutes.forEach(route => {
      xml += '  <url>\n';
      xml += `    <loc>${siteUrl}${route}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Add dynamic product routes
    if (products) {
      products.forEach(product => {
        xml += '  <url>\n';
        xml += `    <loc>${siteUrl}/product/${product.id}</loc>\n`;
        // Use updated_at if available, otherwise just daily
        if (product.updated_at) {
          xml += `    <lastmod>${new Date(product.updated_at).toISOString()}</lastmod>\n`;
        }
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.9</priority>\n';
        xml += '  </url>\n';
      });
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).end();
  }
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`API Server running on port ${PORT}`));
}

export default app;
