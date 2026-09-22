import nodemailer from 'nodemailer';

/**
 * Production-ready serverless mailer utility for REAVO API routes.
 * 
 * Configured via environment variables:
 * - SMTP_HOST (e.g., smtp.gmail.com, smtp.sendgrid.net, etc.)
 * - SMTP_PORT (587 or 465)
 * - SMTP_USER (sending email address)
 * - SMTP_PASS (app password or API secret)
 * - ADMIN_EMAIL (default destination for operational alerts)
 */

let cachedTransporter = null;

export function getEmailTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      // 10s connection timeout suitable for serverless functions
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    return cachedTransporter;
  }

  return null;
}

/**
 * Sends an email using configured SMTP transporter.
 * Gracefully reports errors or unconfigured state without crashing serverless executions.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plaintext fallback
 * @returns {Promise<{ delivered: boolean, messageId?: string, error?: string, skipped?: boolean }>}
 */
export async function sendEmail({ to, subject, html, text }) {
  const transporter = getEmailTransporter();

  if (!transporter) {
    console.warn('[REAVO Mailer] SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) not configured. Email skipped.');
    return {
      delivered: false,
      skipped: true,
      reason: 'SMTP credentials not configured in environment variables'
    };
  }

  const fromAddress = process.env.SMTP_USER 
    ? `"REAVO Store" <${process.env.SMTP_USER}>` 
    : '"REAVO Store" <system@reavoglobal.com>';

  const plainFallback = text || (html ? html.replace(/<[^>]*>?/gm, '') : '');

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: plainFallback,
      html,
    });

    console.log(`[REAVO Mailer] Email delivered to ${to}. MessageId: ${info.messageId}`);
    return { delivered: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[REAVO Mailer] Failed to deliver email to ${to}:`, err.message);
    return { delivered: false, error: err.message };
  }
}
