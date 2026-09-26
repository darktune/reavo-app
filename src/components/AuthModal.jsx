import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { X, Mail, Lock, User, ArrowLeft, CheckCircle2, Key, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSkip, allowGuestSkip = false, redirectTo }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [accountConflict, setAccountConflict] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, register, resetPassword, signInWithGoogle } = useAuth();
  const { setUserName } = useUser();

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle(redirectTo);
    } catch (err) {
      console.error('Google Sign-In failed:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAccountConflict(false);
    try {
      if (tab === 'login') {
        await login(email, password);
        onClose();
      } else if (tab === 'register') {
        const userSchool = localStorage.getItem('reavo_userSchool') || '';
        await register(name, email, password, userSchool);
        if (name && setUserName) setUserName(name.trim());
        onClose();
      } else if (tab === 'forgot') {
        await resetPassword(email);
        setForgotSent(true);
      }
    } catch (err) {
      if (err?.emailExists) {
        // High visibility duplicate account prompt
        setAccountConflict(true);
        setTab('login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTab('login');
    setForgotSent(false);
    setAccountConflict(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--bg-card)',
        borderRadius: 24,
        padding: 32,
        position: 'relative',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
      }}>
        <button 
          onClick={handleClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 24, right: 24, color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {tab === 'forgot' ? (
          <div>
            <button
              type="button"
              onClick={() => { setTab('login'); setForgotSent(false); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: 13,
                cursor: 'pointer',
                padding: 0,
                marginBottom: 20
              }}
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>

            {forgotSent ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(57, 217, 196, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '1px solid rgba(57, 217, 196, 0.3)'
                }}>
                  <CheckCircle2 size={26} color="#39D9C4" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Recovery Email Sent</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: '0 0 20px 0' }}>
                  We sent a secure password reset link to <strong style={{ color: '#fff' }}>{email}</strong>. Check your inbox and spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => { setTab('login'); setForgotSent(false); }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: 14 }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Reset Password</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5, margin: '0 0 24px 0' }}>
                  Enter your registered email and we'll send you an instant link to recover your account.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        background: 'var(--bg-inner)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 8,
                        padding: '12px 16px 12px 44px',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ width: '100%', marginTop: 8, background: '#F7F7F5', color: '#0A0A0C', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? 'Sending link...' : 'Send Recovery Email'}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Google One-Tap / OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="google-signin-btn"
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: 12,
                background: '#FFFFFF',
                color: '#1F1F1F',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                cursor: googleLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                marginBottom: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              {googleLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" color="#1F1F1F" />
                  <span>Connecting Google...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
              color: 'var(--text-secondary)',
              fontSize: 11,
              letterSpacing: '0.08em',
              fontWeight: 600
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              <span>OR WITH EMAIL</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            </div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 28, borderBottom: '1px solid var(--border-subtle)' }}>
              <button 
                onClick={() => setTab('login')}
                style={{ 
                  paddingBottom: 12, 
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: tab === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderBottom: `2px solid ${tab === 'login' ? 'var(--accent-purple)' : 'transparent'}`
                }}
              >
                Sign In
              </button>
              <button 
                onClick={() => setTab('register')}
                style={{ 
                  paddingBottom: 12, 
                  fontWeight: 600,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: tab === 'register' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderBottom: `2px solid ${tab === 'register' ? 'var(--accent-purple)' : 'transparent'}`
                }}
              >
                Create Account
              </button>
            </div>

            {accountConflict && (
              <div style={{
                background: 'rgba(255, 184, 0, 0.1)',
                border: '1px solid rgba(255, 184, 0, 0.35)',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 16,
                color: '#FFB800',
                fontSize: 13,
                lineHeight: 1.5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
                  <AlertCircle size={16} /> Account already exists
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: 12, marginBottom: 10 }}>
                  An account is already registered for <strong>{email}</strong>. Enter your password to sign in or reset it immediately below.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setForgotSent(false); }}
                    style={{
                      flex: 1,
                      padding: '7px 12px',
                      background: 'var(--accent-teal, #39D9C4)',
                      color: '#0A0A0C',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Key size={13} /> Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountConflict(false)}
                    style={{
                      padding: '7px 12px',
                      background: 'rgba(255,255,255,0.08)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tab === 'register' && (
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: 'var(--bg-inner)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      padding: '12px 16px 12px 44px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: 14,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
              
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: '12px 16px 12px 44px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: '12px 16px 12px 44px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {tab === 'login' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -2 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Can't recall password?</span>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setForgotSent(false); }}
                    style={{
                      background: 'rgba(57, 217, 196, 0.1)',
                      border: '1px solid rgba(57, 217, 196, 0.3)',
                      color: 'var(--accent-teal, #39D9C4)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 10px',
                      borderRadius: 6,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5
                    }}
                  >
                    <Key size={13} /> Forgot password?
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  marginTop: 8, 
                  background: '#F7F7F5', 
                  color: '#0A0A0C', 
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  tab === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>

              {tab === 'login' ? (
                <div style={{ marginTop: 4, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setAccountConflict(false); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-teal, #39D9C4)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    Create Account
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 4, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('login'); setAccountConflict(false); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-teal, #39D9C4)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    Sign In
                  </button>
                  <span style={{ margin: '0 8px', opacity: 0.4 }}>•</span>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setForgotSent(false); setAccountConflict(false); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </form>

            {allowGuestSkip && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (onSkip) onSkip();
                    onClose();
                  }}
                  className="guest-skip-btn"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-teal)';
                    e.currentTarget.style.background = 'rgba(57, 217, 196, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <span>⚡ Skip Authentication • Continue as Guest</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
