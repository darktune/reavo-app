import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.error('Supabase URL and Anon Key are missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the deployment environment.');
}

// Keep the client constructible so the public storefront can render and explain
// the missing deployment configuration instead of failing during module load.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'reavo-missing-supabase-config'
);
