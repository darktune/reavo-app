import { createClient } from '@supabase/supabase-js';
import { verifyCronAuth } from '../core/cronAuth.js';
import { sendEmail } from '../core/mailer.js';

/**
 * Hourly Stock Check Serverless Function
 * Triggered hourly by GitHub Actions workflow (.github/workflows/hourly-stock.yml)
 * and/or Vercel Cron.
 * 
 * URL: GET /api/cron/hourly-stock
 * Headers: Authorization: Bearer <CRON_SECRET>
 */

function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export default async function handler(req, res) {
  // 1. Method Guard — only GET is permitted
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Please use GET.`
    });
  }

  // 2. Timing-Safe CRON Secret Verification
  const auth = verifyCronAuth(req);
  if (!auth.authorized) {
    return res.status(auth.statusCode || 401).json({
      success: false,
      error: auth.error
    });
  }

  // 3. Database Client Initialization
  const supabase = getSupabaseClient();
  if (!supabase) {
    return res.status(503).json({
      success: false,
      error: 'Supabase credentials not configured in environment variables.'
    });
  }

  try {
    // 4. Query zero-stock inventory
    const { data: outOfStock, error: queryError } = await supabase
      .from('products')
      .select('id, name, category, stock_quantity')
      .eq('stock_quantity', 0);

    if (queryError) {
      console.error('[CRON hourly-stock] Database error:', queryError);
      return res.status(500).json({
        success: false,
        error: `Database query failed: ${queryError.message}`
      });
    }

    const count = outOfStock ? outOfStock.length : 0;
    let emailResult = { skipped: true, reason: 'No items currently out of stock' };

    // 5. Dispatch Alert Email if any products hit 0 stock
    if (count > 0) {
      const recipient = process.env.ADMIN_EMAIL || 'admin@reavoglobal.com';
      const itemsList = outOfStock.map(p => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
          <td style="padding: 10px 12px; font-weight: 600; color: #FFFFFF;">${p.name}</td>
          <td style="padding: 10px 12px; color: #C4C7CC;">${p.category || 'General'}</td>
          <td style="padding: 10px 12px; color: #FF6B4A; font-weight: 700;">0 units</td>
        </tr>
      `).join('');

      const emailHtml = `
        <div style="background-color: #0A0A0C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #FFFFFF;">
          <div style="max-width: 580px; margin: 0 auto; background: #161618; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <span style="background: rgba(255, 107, 74, 0.15); color: #FF6B4A; border: 1px solid rgba(255, 107, 74, 0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.08em;">
                Urgent Stock Alert
              </span>
            </div>
            
            <h2 style="font-size: 22px; font-weight: 700; margin: 0 0 12px 0; color: #FFFFFF;">
              ${count} Product${count > 1 ? 's' : ''} Hit Zero Inventory
            </h2>
            
            <p style="font-size: 14px; line-height: 1.6; color: #C4C7CC; margin: 0 0 20px 0;">
              The hourly inventory auditor detected that the following item${count > 1 ? 's are' : ' is'} out of stock. Immediate replenishment is advised to avoid order disruptions.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.15); text-align: left;">
                  <th style="padding: 8px 12px; color: #9CA3AF;">Product</th>
                  <th style="padding: 8px 12px; color: #9CA3AF;">Category</th>
                  <th style="padding: 8px 12px; color: #9CA3AF;">Stock</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; font-size: 12px; color: #6B7280; display: flex; justify-content: space-between;">
              <span>REAVO Automated Inventory Guard</span>
              <span>${new Date().toUTCString()}</span>
            </div>
          </div>
        </div>
      `;

      emailResult = await sendEmail({
        to: recipient,
        subject: `⚠️ URGENT: ${count} Product${count > 1 ? 's' : ''} Out of Stock — REAVO Store`,
        html: emailHtml,
      });
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      outOfStockCount: count,
      outOfStockItems: (outOfStock || []).map(p => ({ id: p.id, name: p.name })),
      emailNotification: emailResult
    });
  } catch (error) {
    console.error('[CRON hourly-stock] Unhandled exception:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
}
