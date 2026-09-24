import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isDemo = localStorage.getItem('reavo-demo-user');
    if (isDemo) {
      setUser({
        id: 'demo-student-id',
        email: 'student@unilag.edu.ng',
        user_metadata: { full_name: 'David Adeleke', phone: '+2348012345678', whatsapp: '+2348012345678' }
      });
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error('Login failed', { description: error.message });
      throw error;
    }
    toast.success('Welcome back!');
  };

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });
    if (error) {
      toast.error('Registration failed', { description: error.message });
      throw error;
    }
    toast.success('Account created successfully. Please check your email to verify if required.');
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

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error logging out', { description: error.message });
    } else {
      toast('You have been logged out');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
