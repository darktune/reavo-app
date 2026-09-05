import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid and not default placeholders
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawAnonKey &&
  !rawUrl.includes('your-project-id') &&
  (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))
);

function createSafePlaceholderClient() {
  console.warn(
    '⚠️ [REAVO] Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are unconfigured in Vercel. Running with safe fallback client to keep storefront interactive.'
  );

  // Safe recursive query builder proxy that resolves with safe empty structures
  const createQueryProxy = () => {
    const proxy = new Proxy(() => {}, {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve) => resolve({ data: [], error: null, count: 0 });
        }
        if (prop === 'single' || prop === 'maybeSingle') {
          return () => Promise.resolve({ data: null, error: null });
        }
        return () => proxy;
      },
      apply() {
        return proxy;
      }
    });
    return proxy;
  };

  return {
    from: () => createQueryProxy(),
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }),
      signInWithPassword: () => Promise.resolve({
        data: null,
        error: new Error('Supabase credentials not configured in Vercel. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      }),
      signInWithOAuth: () => Promise.resolve({
        data: null,
        error: new Error('Supabase credentials not configured in Vercel.')
      }),
      signUp: () => Promise.resolve({
        data: null,
        error: new Error('Supabase credentials not configured in Vercel.')
      }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({
        data: null,
        error: new Error('Supabase credentials not configured in Vercel.')
      }),
      updateUser: () => Promise.resolve({
        data: null,
        error: new Error('Supabase credentials not configured in Vercel.')
      })
    },
    channel: () => ({
      on: function() { return this; },
      subscribe: function() { return this; }
    }),
    removeChannel: () => {}
  };
}

let client;
if (isSupabaseConfigured) {
  try {
    client = createClient(rawUrl, rawAnonKey);
  } catch (err) {
    console.error('❌ [REAVO] Failed to initialize live Supabase client:', err);
    client = createSafePlaceholderClient();
  }
} else {
  client = createSafePlaceholderClient();
}

export const supabase = client;

