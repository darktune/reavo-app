import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase URL or SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

async function updateAdminWithRetry(retries = 3) {
  const adminId = 'ed36b3c0-83c9-4aea-b046-a374130da3cb';
  const newPassword = 'ReavoAdmin2026!#';

  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`Attempt ${i} of ${retries} to update admin credentials...`);
      const { data, error } = await supabase.auth.admin.updateUserById(adminId, {
        password: newPassword,
        user_metadata: {
          full_name: 'Abraham Toluwani',
          role: 'OWNER'
        },
        app_metadata: {
          role: 'OWNER'
        }
      });
      if (error) throw error;
      console.log('✅ Admin password updated successfully!');
      console.log('Email: abrahamtoluwani999@gmail.com');
      console.log(`Password: ${newPassword}`);
      return true;
    } catch (err) {
      console.warn(`Attempt ${i} failed:`, err.message);
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function main() {
  console.log('--- 1. Resetting Admin Password for abrahamtoluwani999@gmail.com ---');
  await updateAdminWithRetry();

  console.log('\n--- 2. Purging Mock/Test Orders and Order Items from Supabase ---');
  // First delete order_items
  const { error: itemsErr } = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (itemsErr) console.warn('Order items delete warning:', itemsErr.message);
  else console.log('✅ All test order_items purged.');

  // Then delete orders
  const { error: ordersErr } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (ordersErr) console.warn('Orders delete warning:', ordersErr.message);
  else console.log('✅ All test orders purged.');

  console.log('\n--- 3. Verifying Clean Slate in Database ---');
  const { count: ordCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  console.log(`Orders count: ${ordCount}`);
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
