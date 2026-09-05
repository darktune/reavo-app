import { X } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function CompareDrawer({ isOpen, onClose, products, onRemove }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleCompareClick = () => {
    const ids = products.map(p => p.id).join(',');
    onClose();
    navigate(`/compare?ids=${ids}`);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: isOpen ? 0 : '-100%',
      left: 0,
      right: 0,
      background: 'var(--bg-admin-glass)',
      backdropFilter: 'blur(24px)',
      borderTop: '1px solid var(--border-active)',
      padding: '24px',
      zIndex: 100,
      transition: 'bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div className="container" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ flexShrink: 0 }}>
          <h3 style={{ fontSize: 20, marginBottom: 4, color: 'var(--text-primary)' }}>Compare</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{products.length}/3 selected</p>
        </div>

        <div style={{ display: 'flex', gap: 16, flex: 1, overflowX: 'auto', paddingBottom: 8 }}>
          {products.map(p => (
            <div key={p.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'var(--bg-inner)',
              padding: '8px',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              minWidth: 200
            }}>
              <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{p.name}</div>
                <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>₦{p.price.toLocaleString()}</div>
              </div>
              <button onClick={() => onRemove(p.id)} style={{ padding: 4, color: 'var(--text-secondary)' }}>
                <X size={14} />
              </button>
            </div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 3 - products.length) }).map((_, i) => (
            <div key={`empty-${i}`} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px dashed var(--border-active)',
              padding: '8px',
              borderRadius: 8,
              minWidth: 200,
              color: 'var(--text-secondary)',
              fontSize: 13
            }}>
              Add product
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          <button style={{ padding: '12px 24px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-active)', borderRadius: 100, fontSize: 14, fontWeight: 600 }} onClick={onClose}>Close</button>
          <button 
            onClick={handleCompareClick}
            disabled={products.length < 2}
            style={{ 
              padding: '12px 24px',
              background: 'var(--text-primary)',
              color: 'var(--bg-void)',
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 600,
              opacity: products.length < 2 ? 0.5 : 1,
              cursor: products.length < 2 ? 'not-allowed' : 'pointer',
              border: 'none'
            }}
          >
            Compare Specs
          </button>
        </div>
      </div>
    </div>
  );
}
