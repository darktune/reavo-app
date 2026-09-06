import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, Heart, Scale } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { categories } from '../data/products';

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
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        transition: 'transform 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        cursor: 'pointer'
      }}
      onMouseEnter={() => {
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ height: 4, background: categoryColor }}></div>
      
      {/* Image Area */}
      <div style={{ height: 'clamp(210px, 45vw, 260px)', background: 'var(--bg-inner)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <img 
          src={product.image} 
          alt={`${product.name} — REAVO Campus Gadget${product.category ? ` | ${product.category}` : ''}`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            objectPosition: 'center',
            transition: 'transform 0.5s ease',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)'
          }} 
        />
        
        {/* Actions overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.2)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: 16
        }}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            title={isHearted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
              color: isHearted ? 'var(--accent-coral)' : 'var(--text-primary)'
            }}
          >
            <Heart size={18} fill={isHearted ? 'var(--accent-coral)' : 'none'} />
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompare && onCompare(product);
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
            title="Compare"
          >
            <Scale size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 24 }}>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>{product.name}</h3>
        <div className="font-mono" style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
          {product.priceDisplay || `₦${product.price.toLocaleString()}`}
        </div>
        
        {product.stock_quantity <= 0 ? (
          <button 
            disabled
            style={{ 
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              background: 'var(--bg-inner)',
              color: 'var(--text-tertiary)',
              border: '1px solid var(--border-subtle)',
              fontSize: 14,
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
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            style={{ 
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              background: 'var(--text-primary)',
              color: 'var(--bg-void)',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title="Add to Cart"
          >
            <ShoppingBag size={18} />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
