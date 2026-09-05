import { createClient } from '@supabase/supabase-js';
import { products, categories } from '../src/data/products.js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding categories...");
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'id' });

  if (catError) {
    console.error("Error seeding categories:", catError);
    return;
  }
  console.log("Categories seeded successfully.");

  console.log("Seeding products...");
  // Adapt products to match DB schema (e.g. technicalSpecs -> technical_specs)
  const dbProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    image: p.image,
    description: p.description,
    specs: p.specs,
    technical_specs: p.technicalSpecs,
    price_display: p.priceDisplay || null
  }));

  const { data: prodData, error: prodError } = await supabase
    .from('products')
    .upsert(dbProducts, { onConflict: 'id' });

  if (prodError) {
    console.error("Error seeding products:", prodError);
    return;
  }
  console.log("Products seeded successfully.");
}

seed();
