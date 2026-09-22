import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { products } from '../src/data/products.js';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log('Syncing stock quantities and images with Supabase...');

// Fetch current products from Supabase
const { data: supaProds, error: fetchErr } = await supabase.from('products').select('*');
if (fetchErr) {
  console.error('Fetch error:', fetchErr);
  process.exit(1);
}

console.log(`Found ${supaProds.length} products currently in Supabase.`);

for (const sp of supaProds) {
  const localMatch = products.find(p => p.id === sp.id);
  if (localMatch) {
    const updatePayload = {
      stock_quantity: localMatch.stock_quantity
    };
    if (sp.id === 'razer-deathadder-v3' || sp.image?.includes('1615751072497')) {
      updatePayload.image = localMatch.image;
    }
    const { error: updateErr } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', sp.id);

    if (updateErr) {
      console.error(`Failed to update ${sp.id}:`, updateErr.message);
    } else {
      console.log(`Updated [${sp.id}]: Stock = ${localMatch.stock_quantity}`);
    }
  } else {
    console.log(`No local match for Supabase product ${sp.id}`);
  }
}

console.log('\nSupabase products successfully synced!');
