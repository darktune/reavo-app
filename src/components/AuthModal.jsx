import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const { login, register, resetPassword } = useAuth();

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
        onClose();
      } else if (tab === 'register') {
        await register(name, email, password);
        onClose();
      } else if (tab === 'forgot') {
        await resetPassword(email);
        setForgotSent(true);
      }
    } catch (err) {
      // Error handled in context with toast
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTab('login');
    setForgotSent(false);
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
                  <button
                    type="button"
                    onClick={() => { setTab('forgot'); setForgotSent(false); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-teal, #39D9C4)',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 8, background: '#F7F7F5', color: '#0A0A0C', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Please wait...' : (tab === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
