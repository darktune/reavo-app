import { sendEmail } from '../_core/mailer.js';
import { createClient } from '@supabase/supabase-js';

/**
 * Test Email Dispatch Serverless Function
 * Used by Admin Settings (/admin/settings) to verify SMTP credentials.
 * 
 * URL: POST /api/email/test
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    // Verify admin authentication via Supabase JWT
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
      const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      if (url && key) {
        const supabase = createClient(url, key);
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
          return res.status(401).json({ success: false, error: 'Unauthorized: Invalid administrative session.' });
        }
      }
    }

    const { to } = req.body || {};
    const recipient = to || process.env.ADMIN_EMAIL || 'admin@reavoglobal.com';

    const emailHtml = `
      <div style="background-color: #0A0A0C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #FFFFFF;">
        <div style="max-width: 500px; margin: 0 auto; background: #161618; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 28px;">
          <div style="margin-bottom: 16px;">
            <span style="background: rgba(57, 217, 196, 0.15); color: #39D9C4; border: 1px solid rgba(57, 217, 196, 0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; text-transform: uppercase;">
              SMTP Verification
            </span>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 10px 0; color: #FFFFFF;">
            REAVO Email System Active
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #C4C7CC; margin: 0 0 20px 0;">
            This is a test notification confirming that your SMTP email delivery pipeline on Vercel is connected and functional.
          </p>
          <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px; font-size: 12px; color: #6B7280;">
            Timestamp: ${new Date().toUTCString()}
          </div>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: recipient,
      subject: '🧪 REAVO SMTP Verification Test',
      html: emailHtml,
    });

    if (result.delivered) {
      return res.status(200).json({
        success: true,
        message: `Verification email dispatched successfully to ${recipient}`,
        messageId: result.messageId
      });
    } else if (result.skipped) {
      return res.status(200).json({
        success: false,
        error: `SMTP not configured on Vercel: ${result.reason}. Please add SMTP_HOST, SMTP_USER, SMTP_PASS to Vercel Environment Variables.`
      });
    } else {
      return res.status(500).json({
        success: false,
        error: `SMTP delivery failure: ${result.error}`
      });
    }
  } catch (error) {
    console.error('[API email/test] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
