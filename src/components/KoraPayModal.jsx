import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { CreditCard, ShieldCheck, X } from 'lucide-react';

export default function KoraPayModal({ isOpen, onClose, amount, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Card details, 2: Processing, 3: Success
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const timeoutRefs = useRef([]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) setStep(1);
    
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = (e) => {
    e.preventDefault();
    setStep(2); // Start processing
    
    // Simulate KoraPay network processing
    const t1 = setTimeout(() => {
      setStep(3); // Success
      const t2 = setTimeout(() => {
        onSuccess();
      }, 1500);
      timeoutRefs.current.push(t2);
    }, 2500);
    timeoutRefs.current.push(t1);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      padding: '24px',
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      {/* Background click to close */}
      <div 
        style={{ position: 'absolute', inset: 0 }} 
        onClick={() => step === 1 && onClose()}
      />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        background: 'var(--bg-card)',
        borderRadius: 24,
        padding: '32px 24px',
        boxShadow: '0 -20px 80px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
        border: '1px solid var(--border-active)',
        animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {step === 1 && (
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: 24, right: 24, color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 8 }}>
          <ShieldCheck size={20} color="var(--accent-primary)" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Secured by KoraPay</span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>Total to Pay</div>
          <div className="font-mono" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
            ₦{amount.toLocaleString()}
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'var(--text-secondary)' }}>Card Number</label>
              <div style={{ position: 'relative' }}>
                <CreditCard size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  required
                  placeholder="0000 0000 0000 0000" 
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    padding: '16px 16px 16px 48px',
                    borderRadius: 12,
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'var(--text-secondary)' }}>Expiry</label>
                <input 
                  type="text" 
                  required
                  placeholder="MM/YY" 
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    padding: '16px',
                    borderRadius: 12,
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 14,
                    outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 8, color: 'var(--text-secondary)' }}>CVV</label>
                <input 
                  type="password"
                  required
                  maxLength={3}
                  placeholder="123" 
                  value={cvv}
                  onChange={e => setCvv(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    padding: '16px',
                    borderRadius: 12,
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 14,
                    outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8, padding: '16px', borderRadius: 12 }}>
              Pay ₦{amount.toLocaleString()}
            </button>
          </form>
        )}

        {step === 2 && (
          <div style={{ height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--accent-primary)',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, animation: 'pulse 1.5s ease-in-out infinite' }}>
              Processing payment...
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <ShieldCheck size={32} />
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 600 }}>
              Payment Successful
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
