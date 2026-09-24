import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Supabase handles recovery access tokens in the URL hash automatically
    const checkRecoverySession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setAuthError('Your password recovery link is invalid or has expired.');
        } else if (session) {
          setSessionReady(true);
        } else {
          // Listen for auth state change from recovery link
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            if (event === 'PASSWORD_RECOVERY' || currentSession) {
              setSessionReady(true);
              setAuthError(null);
            }
          });
          return () => {
            authListener?.subscription?.unsubscribe();
          };
        }
      } catch (err) {
        setAuthError('Unable to verify recovery link.');
      }
    };

    checkRecoverySession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('Your password has been successfully updated!');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update password: ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: 'var(--text-primary)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'var(--bg-card)',
        borderRadius: 24,
        padding: '36px 32px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(57, 217, 196, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(57, 217, 196, 0.3)'
            }}>
              <CheckCircle2 size={28} color="#39D9C4" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Password Updated!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Your account password has been successfully reset. Redirecting you to the store...
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
              style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Continue to Store <ArrowRight size={16} />
            </button>
          </div>
        ) : authError ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255, 107, 74, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(255, 107, 74, 0.3)'
            }}>
              <AlertCircle size={28} color="#FF6B4A" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Link Expired or Invalid</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              {authError}
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 100, background: 'rgba(124, 92, 255, 0.15)', border: '1px solid rgba(124, 92, 255, 0.3)', marginBottom: 12 }}>
                <ShieldCheck size={14} color="#7C5CFF" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#BD93F9' }}>Account Recovery</span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0' }}>Create New Password</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
                Choose a strong new password to protect your account.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      background: 'var(--bg-inner)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '12px 44px 12px 44px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat your new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      background: 'var(--bg-inner)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      padding: '12px 16px 12px 44px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '14px',
                  borderRadius: 12,
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
