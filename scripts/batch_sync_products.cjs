const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf-8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, key);

// Read products.js
const file = fs.readFileSync('src/data/products.js', 'utf-8');
const match = file.match(/export const products = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Could not parse products array from src/data/products.js');
  process.exit(1);
}

const products = eval(match[1]);
console.log(`Loaded ${products.length} products from src/data/products.js`);

async function batchSync() {
  const records = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    image: p.image,
    images: [p.image],
    description: p.description || '',
    specs: p.specs || [],
    technical_specs: p.technicalSpecs || {},
    stock_quantity: p.stock_quantity ?? 10
  }));

  const chunkSize = 25;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    console.log(`Upserting chunk ${Math.floor(i / chunkSize) + 1} (${chunk.length} items)...`);
    
    let retries = 3;
    let success = false;
    while (retries > 0 && !success) {
      try {
        const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
        if (error) {
          console.error('Chunk error:', error.message);
          retries--;
          await new Promise(r => setTimeout(r, 1000));
        } else {
          success = true;
          console.log(`Chunk ${Math.floor(i / chunkSize) + 1} succeeded!`);
        }
      } catch (err) {
        console.error('Fetch caught error:', err.message);
        retries--;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    if (!success) {
      console.error(`Failed chunk ${Math.floor(i / chunkSize) + 1} after 3 retries`);
    }
  }

  console.log('All chunks processed. Verifying database count and sample images...');
  const { data: verifyData, error: verifyErr } = await supabase.from('products').select('id, name, image').limit(5);
  if (verifyErr) {
    console.error('Verify error:', verifyErr);
  } else {
    console.log('Verified sample:', JSON.stringify(verifyData, null, 2));
  }
}

batchSync();
