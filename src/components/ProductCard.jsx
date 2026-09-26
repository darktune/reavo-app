import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, Heart, Scale } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { categories, products as fallbackProducts } from '../data/products';

export default function ProductCard({ product, onCompare }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const categoryColor = categories.find(c => c.id === product.category)?.color || 'var(--accent-primary)';
  const isHearted = isInWishlist(product.id);

  return (
    <div 
      className="glass-panel glass-hover" 
      onClick={() => navigate(`/product/${product.id}`)}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? '0 12px 30px rgba(0,0,0,0.15)' : 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onMouseEnter={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ height: 3, background: categoryColor }}></div>
      
      {/* Image Area */}
      <div style={{ 
        height: 'clamp(200px, 42vw, 240px)', 
        background: 'var(--bg-inner)', 
        position: 'relative', 
        overflow: 'hidden', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '16px' 
      }}>
        {/* Top-Left Trust Badge */}
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 9px',
          borderRadius: 100,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border-subtle)',
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--accent-primary)',
          letterSpacing: '0.02em',
          pointerEvents: 'none'
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-primary)', display: 'inline-block' }} />
          <span>Campus Ready</span>
        </div>

        {/* Top-Right Quick Wishlist Button - ALWAYS VISIBLE for Mobile & Touch Accessibility */}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isHearted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          title={isHearted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 4,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: isHearted ? 'rgba(255, 71, 87, 0.16)' : 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${isHearted ? 'rgba(255, 71, 87, 0.45)' : 'var(--border-subtle)'}`,
            color: isHearted ? '#FF4757' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s',
            boxShadow: isHearted ? '0 0 14px rgba(255, 71, 87, 0.35)' : '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.88)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={16} fill={isHearted ? '#FF4757' : 'none'} color={isHearted ? '#FF4757' : 'currentColor'} />
        </button>

        {/* Compare Button (when available) */}
        {onCompare && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompare(product);
            }}
            aria-label="Compare Product"
            title="Compare Product"
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              zIndex: 3,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              opacity: isHovered ? 1 : 0.6,
              transition: 'opacity 0.2s'
            }}
          >
            <Scale size={14} />
          </button>
        )}

        <img 
          src={product.image} 
          alt={`${product.name} • REAVO Campus Gadget${product.category ? ` | ${product.category}` : ''}`}
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.dataset.fallbackTried) return;
            e.currentTarget.dataset.fallbackTried = 'true';
            const fallback = fallbackProducts.find(p => p.id === product.id);
            if (fallback && fallback.image) {
              e.currentTarget.src = fallback.image;
            }
          }}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            objectPosition: 'center',
            transition: 'transform 0.4s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }} 
        />
      </div>

      {/* Content Area */}
      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            lineHeight: 1.35, 
            marginBottom: 8,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.name}
          </h3>

          {/* Micro-Spec Pills (Concise 1-2 key specs) */}
          {product.specs && product.specs.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
              {product.specs.slice(0, 2).map((spec, sIdx) => (
                <span 
                  key={sIdx}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '2px 7px',
                    borderRadius: 6,
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {spec}
                </span>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="font-mono" style={{ 
            fontSize: 16, 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            marginBottom: 16 
          }}>
            {product.priceDisplay || `₦${product.price.toLocaleString()}`}
          </div>
        </div>
        
        {/* Conversion Action: 1-Tap Add to Bag */}
        {product.stock_quantity <= 0 ? (
          <button 
            type="button"
            disabled
            style={{ 
              width: '100%',
              padding: '11px',
              borderRadius: 12,
              background: 'var(--bg-inner)',
              color: 'var(--text-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'not-allowed'
            }}
            title="Out of Stock"
          >
            Out of Stock
          </button>
        ) : (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            style={{ 
              width: '100%',
              padding: '11px',
              borderRadius: 12,
              background: 'var(--text-primary)',
              color: 'var(--bg-void)',
              border: 'none',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            title="Add to Cart"
          >
            <ShoppingBag size={16} />
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    </div>
  );
}
