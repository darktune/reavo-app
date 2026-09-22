import hourlyStockHandler from '../api/cron/hourly-stock.js';
import dailyBriefingHandler from '../api/cron/daily-briefing.js';
import { sendEmail } from '../api/core/mailer.js';

// Mock Express/Vercel request and response helpers
function createMockReq(options = {}) {
  return {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body || {},
    ...options
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    }
  };
  return res;
}

async function runTests() {
  console.log('--- TEST 1: Method Guard (hourly-stock) ---');
  const postReq = createMockReq({ method: 'POST' });
  const postRes = createMockRes();
  await hourlyStockHandler(postReq, postRes);
  console.log(`POST response status: ${postRes.statusCode} (Expected: 405)`);
  if (postRes.statusCode !== 405) throw new Error('Failed method guard');

  console.log('\n--- TEST 2: Missing Token Guard (hourly-stock) ---');
  process.env.CRON_SECRET = 'test-secret-1234567890';
  const noAuthReq = createMockReq({ method: 'GET', headers: {} });
  const noAuthRes = createMockRes();
  await hourlyStockHandler(noAuthReq, noAuthRes);
  console.log(`No-auth response status: ${noAuthRes.statusCode} (Expected: 401)`);
  if (noAuthRes.statusCode !== 401) throw new Error('Failed missing token guard');

  console.log('\n--- TEST 3: Invalid Token Guard (hourly-stock) ---');
  const badAuthReq = createMockReq({ 
    method: 'GET', 
    headers: { authorization: 'Bearer wrong-secret' } 
  });
  const badAuthRes = createMockRes();
  await hourlyStockHandler(badAuthReq, badAuthRes);
  console.log(`Bad-auth response status: ${badAuthRes.statusCode} (Expected: 401)`);
  if (badAuthRes.statusCode !== 401) throw new Error('Failed invalid token guard');

  console.log('\n--- TEST 4: Daily Briefing Method Guard ---');
  const dbPostReq = createMockReq({ method: 'POST' });
  const dbPostRes = createMockRes();
  await dailyBriefingHandler(dbPostReq, dbPostRes);
  console.log(`Daily briefing POST status: ${dbPostRes.statusCode} (Expected: 405)`);
  if (dbPostRes.statusCode !== 405) throw new Error('Failed daily briefing method guard');

  console.log('\n--- TEST 5: Mailer Fallback Safety ---');
  // With no SMTP configured, sendEmail must not throw
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
  const mailResult = await sendEmail({
    to: 'test@example.com',
    subject: 'Test Subject',
    html: '<p>Test</p>'
  });
  console.log('Mailer safe unconfigured fallback:', JSON.stringify(mailResult));
  if (!mailResult.skipped) throw new Error('Mailer should skip safely when unconfigured');

  console.log('\n✅ ALL CRON HANDLER GUARDS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
