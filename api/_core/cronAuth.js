import crypto from 'crypto';

/**
 * Validates incoming Cron requests against CRON_SECRET using timingSafeEqual
 * to eliminate timing-attack vulnerabilities.
 * 
 * Works identically for GitHub Actions runner triggers and Vercel native CRON triggers.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {{ authorized: boolean, statusCode?: number, error?: string }}
 */
export function verifyCronAuth(req) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return {
      authorized: false,
      statusCode: 500,
      error: 'CRON_SECRET is not configured in server environment variables.'
    };
  }

  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      statusCode: 401,
      error: 'Missing or malformed Authorization header. Expected format: Bearer <CRON_SECRET>'
    };
  }

  const providedToken = authHeader.slice(7).trim();
  const tokenBuf = Buffer.from(providedToken, 'utf8');
  const secretBuf = Buffer.from(cronSecret, 'utf8');

  if (tokenBuf.length !== secretBuf.length || !crypto.timingSafeEqual(tokenBuf, secretBuf)) {
    return {
      authorized: false,
      statusCode: 401,
      error: 'Unauthorized: Invalid cron execution token.'
    };
  }

  return { authorized: true };
}
