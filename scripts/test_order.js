import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import createOrderHandler from '../api/createOrder.js';

console.log('=== Environment Status ===');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Loaded' : 'MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Loaded' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY in .env:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'NOT SET');

// Simulate test by supplying anon key to test product verification & RLS lockdown response
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
  console.log('\n[TEST MODE] Temporarily supplying VITE_SUPABASE_ANON_KEY to test DB connectivity & RLS boundaries...');
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
}

// Mock request and response
const mockReq = {
  method: 'POST',
  body: {
    items: [
      { id: 'macbook-air-m2', quantity: 1 }
    ],
    customerInfo: {
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test@reavo.store',
      phone: '+2348012345678',
      address: '12 Campus Road',
      city: 'Lagos',
      state: 'Lagos'
    },
    discountCode: 'WELCOME10',
    koraReference: 'KORA_TEST_' + Date.now()
  }
};

let statusCode = 200;
const mockRes = {
  status(code) {
    statusCode = code;
    return this;
  },
  json(payload) {
    console.log(`\nResponse Status: ${statusCode}`);
    console.log('Response Payload:\n', JSON.stringify(payload, null, 2));
    return this;
  }
};

console.log('\n=== Invoking POST /api/checkout/create-order ===');
createOrderHandler(mockReq, mockRes).catch(err => {
  console.error('Unhandled Error in Handler:', err);
});
