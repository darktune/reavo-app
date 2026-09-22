import { createClient } from '@supabase/supabase-js';
import { verifyCronAuth } from '../core/cronAuth.js';
import { sendEmail } from '../core/mailer.js';

/**
 * Daily Executive Briefing Serverless Function
 * Triggered daily at 08:00 UTC by Vercel Cron (configured in vercel.json).
 * 
 * URL: GET /api/cron/daily-briefing
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
    // 4. Calculate Yesterday's Window (00:00:00 to 23:59:59 UTC)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(new Date(yesterday).setUTCHours(0, 0, 0, 0)).toISOString();
    const yesterdayEnd = new Date(new Date(yesterday).setUTCHours(23, 59, 59, 999)).toISOString();
    const dateLabel = yesterday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // 5. Query Yesterday's Orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, status')
      .gte('created_at', yesterdayStart)
      .lte('created_at', yesterdayEnd);

    if (ordersError) {
      console.error('[CRON daily-briefing] Orders query error:', ordersError);
      return res.status(500).json({
        success: false,
        error: `Database query failed for orders: ${ordersError.message}`
      });
    }

    // 6. Query Low & Out of Stock Inventory
    const { data: stockItems, error: stockError } = await supabase
      .from('products')
      .select('name, stock_quantity')
      .lte('stock_quantity', 5);

    if (stockError) {
      console.error('[CRON daily-briefing] Stock query error:', stockError);
      return res.status(500).json({
        success: false,
        error: `Database query failed for inventory: ${stockError.message}`
      });
    }

    const orderList = orders || [];
    const totalRevenue = orderList.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const orderCount = orderList.length;
    const outOfStockItems = (stockItems || []).filter(p => p.stock_quantity === 0);
    const lowStockItems = (stockItems || []).filter(p => p.stock_quantity > 0);

    // 7. Dispatch Executive Briefing Email
    const recipient = process.env.ADMIN_EMAIL || 'admin@reavoglobal.com';
    const emailHtml = `
      <div style="background-color: #0A0A0C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #FFFFFF;">
        <div style="max-width: 600px; margin: 0 auto; background: #161618; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="margin-bottom: 24px;">
            <span style="background: rgba(57, 217, 196, 0.15); color: #39D9C4; border: 1px solid rgba(57, 217, 196, 0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.08em;">
              Executive Briefing
            </span>
          </div>

          <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 6px 0; color: #FFFFFF;">
            REAVO Daily Briefing
          </h2>
          <p style="font-size: 13px; color: #9CA3AF; margin: 0 0 28px 0;">Summary for ${dateLabel}</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px;">
            <div style="background: #0D0D0F; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 18px;">
              <div style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Total Revenue</div>
              <div style="font-size: 22px; font-weight: 700; color: #39D9C4;">₦${totalRevenue.toLocaleString()}</div>
            </div>
            <div style="background: #0D0D0F; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 18px;">
              <div style="font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">Orders Placed</div>
              <div style="font-size: 22px; font-weight: 700; color: #7C5CFF;">${orderCount}</div>
            </div>
          </div>

          <div style="background: #0D0D0F; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="font-size: 13px; font-weight: 600; color: #FFFFFF; margin-bottom: 12px;">Inventory Health</div>
            <div style="font-size: 13px; color: #C4C7CC; line-height: 1.8;">
              <div>• Out of Stock SKUs: <strong style="color: ${outOfStockItems.length > 0 ? '#FF6B4A' : '#39D9C4'};">${outOfStockItems.length}</strong></div>
              <div>• Low Stock SKUs (&le; 5 units): <strong style="color: ${lowStockItems.length > 0 ? '#FFB800' : '#39D9C4'};">${lowStockItems.length}</strong></div>
            </div>
          </div>

          <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; font-size: 12px; color: #6B7280; display: flex; justify-content: space-between;">
            <span>REAVO Automated Operations</span>
            <span>Generated ${new Date().toUTCString()}</span>
          </div>
        </div>
      </div>
    `;

    const emailResult = await sendEmail({
      to: recipient,
      subject: `📊 Daily REAVO Store Executive Briefing — ${dateLabel}`,
      html: emailHtml,
    });

    return res.status(200).json({
      success: true,
      message: 'Daily briefing processed successfully',
      timestamp: new Date().toISOString(),
      metrics: {
        revenue: totalRevenue,
        orders: orderCount,
        outOfStockCount: outOfStockItems.length,
        lowStockCount: lowStockItems.length,
      },
      emailNotification: emailResult
    });
  } catch (error) {
    console.error('[CRON daily-briefing] Unhandled exception:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
}
