import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register } = useAuth();

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err) {
      // Error handled in context with toast
    } finally {
      setLoading(false);
    }
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
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 24, right: 24, color: 'var(--text-secondary)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', gap: 24, marginBottom: 32, borderBottom: '1px solid var(--border-subtle)' }}>
          <button 
            onClick={() => setTab('login')}
            style={{ 
              paddingBottom: 12, 
              fontWeight: 600,
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
                  fontSize: 14
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
                fontSize: 14
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
                fontSize: 14
              }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 8, background: '#F7F7F5', color: '#0A0A0C', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait...' : (tab === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
