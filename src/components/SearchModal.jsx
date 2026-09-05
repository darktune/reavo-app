import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, ArrowRight } from 'lucide-react';
import { products } from '../data/products';
import anime from 'animejs';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isOpen) {
      setQuery('');
      setResults([]);
      timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
      
      anime({
        targets: '.search-modal-content',
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 400,
        easing: 'easeOutExpo'
      });
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 1) {
      const lowerQuery = query.toLowerCase();
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.category.toLowerCase().includes(lowerQuery)
      );
      setResults(filtered.slice(0, 4)); // max 4 results
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  const handleResultClick = (id) => {
    onClose();
    navigate(`/product/${id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      // Wait for route context to push search params
      navigate(`/shop?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '10vh',
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }}>
      <div 
        style={{ position: 'absolute', inset: 0 }} 
        onClick={onClose}
      />

      <div className="search-modal-content glass-panel" style={{
        position: 'relative',
        width: '90%',
        maxWidth: 600,
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
      }}>
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: results.length > 0 ? 24 : 0 }}>
          <Search size={24} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, categories..."
            style={{
              width: '100%',
              background: 'var(--bg-inner)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 100,
              padding: '16px 48px 16px 56px',
              fontSize: 18,
              color: 'var(--text-primary)',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close search"
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </form>

        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 12 }}>Results</h3>
            {results.map(product => (
              <div 
                key={product.id}
                onClick={() => handleResultClick(product.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 12,
                  borderRadius: 16,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-inner)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-card)', overflow: 'hidden' }}>
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{product.name}</div>
                  <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>₦{product.price.toLocaleString()}</div>
                </div>
                <ArrowRight size={18} style={{ color: 'var(--text-secondary)' }} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
