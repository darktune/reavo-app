import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isDemo = localStorage.getItem('reavo-demo-admin');
    if (isDemo) {
      setAdminUser({
        id: 'demo-admin-id',
        email: 'admin@reavo.ng',
        user_metadata: { name: 'REAVO Admin Executive', role: 'Owner' },
        app_metadata: { role: 'Owner' }
      });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAdminUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setAdminUser(session?.user ?? null);
      });
      subscription = data?.subscription;
    } catch {
      setLoading(false);
    }

    return () => subscription?.unsubscribe();
  }, []);

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signInAsDemoAdmin = () => {
    const demoUser = {
      id: 'demo-admin-id',
      email: 'admin@reavo.ng',
      user_metadata: { name: 'REAVO Admin Executive', role: 'Owner' },
      app_metadata: { role: 'Owner' }
    };
    setAdminUser(demoUser);
    localStorage.setItem('reavo-demo-admin', 'true');
  };

  const signInWithGoogle = async () => {
    const siteUrl = window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/admin`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    localStorage.removeItem('reavo-demo-admin');
    await supabase.auth.signOut();
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, signInWithEmail, signInWithGoogle, signInAsDemoAdmin, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
