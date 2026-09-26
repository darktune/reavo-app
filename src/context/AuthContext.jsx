import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    }).catch(() => {
      // If Supabase is not configured or fails, still render the app
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setLoading(false);
      });
      subscription = data?.subscription;
    } catch {
      // Supabase not configured, ignore
      setLoading(false);
    }

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) {
      toast.error('Login failed', { description: error.message });
      throw error;
    }
    const displayName = data.user?.user_metadata?.full_name || cleanEmail.split('@')[0];

    // Sync institution between session and local storage
    const serverInstitution = data.user?.user_metadata?.institution || data.user?.user_metadata?.school;
    const localSchool = localStorage.getItem('reavo_userSchool');
    if (serverInstitution) {
      localStorage.setItem('reavo_userSchool', serverInstitution);
    } else if (localSchool) {
      // Sync local school up to server in background
      supabase.auth.updateUser({
        data: { institution: localSchool, school: localSchool }
      }).catch(() => {});
      supabase.from('customers').upsert({
        email: cleanEmail,
        name: displayName,
        institution: localSchool,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' }).catch(() => {});
    }

    toast.success(`Welcome back, ${displayName}!`);
    return data;
  };

  const register = async (name, email, password, institution) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanInstitution = (institution || localStorage.getItem('reavo_userSchool') || '').trim();

    try {
      // 1. Call serverless registration endpoint with timeout abort controller to prevent UI hang
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      let res;
      try {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: cleanName, 
            email: cleanEmail, 
            password,
            institution: cleanInstitution
          }),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }

      const result = await res.json();

      if (!res.ok) {
        toast.error('Registration notice', { description: result.error || 'Could not complete registration' });
        const err = new Error(result.error || 'Registration failed');
        err.emailExists = result.emailExists;
        throw err;
      }

      // 2. Automatically log the newly registered user in immediately (Industry Standard)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        toast.success('Account created successfully! Please sign in with your password.');
        return { success: true, autoLogin: false };
      }

      if (cleanInstitution) {
        localStorage.setItem('reavo_userSchool', cleanInstitution);
      }

      toast.success(`Welcome to REAVO, ${cleanName}! Your account is active.`);
      return { success: true, autoLogin: true };
    } catch (err) {
      if (err.emailExists) {
        throw err;
      }
      // Offline / fallback handling if fetch failed or timed out
      if (err.name === 'AbortError' || (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')))) {
        const { data: fallbackData, error: fallbackError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { 
            data: { 
              full_name: cleanName,
              institution: cleanInstitution || undefined,
              school: cleanInstitution || undefined
            } 
          }
        });
        if (fallbackError) {
          toast.error('Registration failed', { description: fallbackError.message });
          throw fallbackError;
        }
        if (fallbackData?.user && fallbackData?.user?.identities && fallbackData.user.identities.length === 0) {
          const dupErr = new Error('An account with this email address already exists.');
          dupErr.emailExists = true;
          toast.error('Account exists', { description: 'An account with this email already exists. Please sign in.' });
          throw dupErr;
        }
        toast.success('Account created successfully!');
        return { success: true, autoLogin: false };
      }
      throw err;
    }
  };

  const resetPassword = async (email) => {
    const siteUrl = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${siteUrl}/reset-password`
    });
    if (error) {
      toast.error('Password reset failed', { description: error.message });
      throw error;
    }
    toast.success('Password recovery link sent! Check your email.');
  };

  const signInWithGoogle = async (redirectTo) => {
    const siteUrl = window.location.origin;
    const targetUrl = redirectTo || siteUrl;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    if (error) {
      toast.error('Google Sign-In failed', { description: error.message });
      throw error;
    }
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error logging out', { description: error.message });
    } else {
      toast('You have been logged out');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout, resetPassword, signInWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
