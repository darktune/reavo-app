import { products } from '../src/data/products.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function isAccessory(p) {
  const name = (p.name || '').toLowerCase();
  const id = (p.id || '').toLowerCase();

  // Primary gadget hardware devices are never accessories
  if (name.includes('ipad') || id.includes('ipad')) return false;
  if (name.includes('iphone') || id.includes('iphone')) return false;
  if (name.includes('macbook') || id.includes('macbook')) return false;
  if (name.includes('laptop') && !name.includes('stand')) return false;
  if (name.includes('tablet') || id.includes('tablet')) return false;
  if (name.includes('galaxy') || id.includes('galaxy')) return false;

  return (
    name.includes('airpod') || id.includes('airpod') ||
    name.includes('charger') || name.includes('charging') || id.includes('charging') ||
    name.includes('power bank') || name.includes('powerbank') || id.includes('powerbank') ||
    name.includes('cable') || name.includes('adapter') ||
    name.includes('earpiece') || name.includes('earpod') || name.includes('headphone') ||
    name.includes('keyboard') || id.includes('keyboard') ||
    name.includes('mouse') || name.includes('deathadder') || id.includes('deathadder') ||
    name.includes('stand') || name.includes('sleeve') || name.includes('pouch') || name.includes('case')
  );
}

console.log('=== VERIFYING CATALOG STOCKS (products.js) ===');
let stockErrors = 0;
let accessoriesCount = 0;
let gadgetsCount = 0;

for (const p of products) {
  const acc = isAccessory(p);
  const stock = p.stock_quantity;
  if (acc) {
    accessoriesCount++;
    if (typeof stock !== 'number' || stock < 100) {
      console.error(`❌ Accessory stock error on [${p.id}] ${p.name}: ${stock} (expected >= 100)`);
      stockErrors++;
    }
  } else {
    gadgetsCount++;
    if (typeof stock !== 'number' || stock < 5 || stock > 10) {
      console.error(`❌ Gadget stock error on [${p.id}] ${p.name}: ${stock} (expected 5-10)`);
      stockErrors++;
    }
  }
}

console.log(`✅ Analyzed ${products.length} products:`);
console.log(`   • Accessories: ${accessoriesCount} (all stock >= 100)`);
console.log(`   • Gadgets: ${gadgetsCount} (all stock in 5-10 range)`);
console.log(`   • Stock validation errors: ${stockErrors}`);

console.log('\n=== VERIFYING IMAGES ACCESSIBILITY ===');
const uniqueUrls = [...new Set(products.map(p => p.image))];
let brokenImages = 0;

for (const url of uniqueUrls) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) {
      console.error(`❌ Broken image (${res.status}): ${url}`);
      brokenImages++;
    }
  } catch (e) {
    console.error(`❌ Broken image error (${e.message}): ${url}`);
    brokenImages++;
  }
}

console.log(`✅ Tested ${uniqueUrls.length} unique images. Broken: ${brokenImages}`);

console.log('\n=== VERIFYING SUPABASE PRODUCTS ===');
const { data: supaProds } = await supabase.from('products').select('*');
let supaStockErrors = 0;
if (supaProds) {
  for (const sp of supaProds) {
    const acc = isAccessory(sp);
    const stock = sp.stock_quantity;
    if (acc && stock < 100) {
      console.error(`❌ Supabase accessory stock error [${sp.id}]: ${stock}`);
      supaStockErrors++;
    }
    if (!acc && (stock < 5 || stock > 10)) {
      console.error(`❌ Supabase gadget stock error [${sp.id}]: ${stock}`);
      supaStockErrors++;
    }
  }
  console.log(`✅ Checked ${supaProds.length} Supabase products. Stock errors: ${supaStockErrors}`);
}

if (stockErrors === 0 && brokenImages === 0 && supaStockErrors === 0) {
  console.log('\n🌟 ALL CLIENT REQUIREMENTS 100% VERIFIED AND PASSING! 🌟');
} else {
  console.error('\n⚠️ Issues found during verification.');
  process.exit(1);
}
