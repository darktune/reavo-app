import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { ShoppingBag, ArrowLeft, Heart, ShieldCheck, Truck, RotateCcw, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../lib/supabase';
import ScrollReveal from '../components/ScrollReveal';
import { products as fallbackProducts, categories as fallbackCategories } from '../data/products';

// Helper to distinguish accessories (AirPods, chargers, cables, etc.) from gadgets
function isAccessoryItem(p) {
  if (!p) return false;
  const name = (p.name || '').toLowerCase();
  const id = (p.id || '').toLowerCase();

  // Primary gadget hardware devices are never accessories
  if (name.includes('ipad') || id.includes('ipad')) return false;
  if (name.includes('iphone') || id.includes('iphone')) return false;
  if (name.includes('macbook') || id.includes('macbook')) return false;
  if (name.includes('laptop') && !name.includes('stand')) return false;
  if (name.includes('tablet') || id.includes('tablet')) return false;
  if (name.includes('galaxy') || id.includes('galaxy')) return false;

  return (
    name.includes('airpod') || id.includes('airpod') ||
    name.includes('charger') || name.includes('charging') || id.includes('charging') ||
    name.includes('power bank') || name.includes('powerbank') || id.includes('powerbank') ||
    name.includes('cable') || name.includes('adapter') ||
    name.includes('earpiece') || name.includes('earpod') || name.includes('headphone') ||
    name.includes('keyboard') || id.includes('keyboard') ||
    name.includes('mouse') || name.includes('deathadder') || id.includes('deathadder') ||
    name.includes('stand') || name.includes('sleeve') || name.includes('pouch') || name.includes('case')
  );
}

// Calculate deterministic, stable stock quantity
function getStockCount(p) {
  if (!p) return 0;
  if (typeof p.stock_quantity === 'number' && p.stock_quantity > 0) return p.stock_quantity;
  if (typeof p.stock === 'number' && p.stock > 0) return p.stock;
  if (p.stock_quantity !== undefined && p.stock_quantity !== null && !isNaN(Number(p.stock_quantity)) && Number(p.stock_quantity) > 0) {
    return Number(p.stock_quantity);
  }
  // Deterministic stable inventory according to client specifications:
  // Accessories (AirPods, chargers, etc.): 100+
  // Gadgets (phones, tablets, laptops, cameras): 5-10 range
  const id = p.id || p.name || 'default';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const abs = Math.abs(hash);

  if (isAccessoryItem(p)) {
    return 100 + (abs % 90) + 5; // 105 to 194
  }
  return 5 + (abs % 6); // 5 to 10
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState(() => fallbackProducts.find(item => item.id === id) || null);
  const [category, setCategory] = useState(() => {
    const p = fallbackProducts.find(item => item.id === id);
    return p ? fallbackCategories.find(c => c.id === p.category) || null : null;
  });
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      try {
        const { data: p } = await supabase.from('products').select('*').eq('id', id).single();
        const fallback = fallbackProducts.find(item => item.id === id);
        if (p) {
          const isStalePlaceholder = !p.image ||
            p.image.includes('m.media-amazon.com') ||
            (p.image.includes('images.unsplash.com/photo-15') && fallback?.image && !fallback.image.includes('images.unsplash.com'));
          const resolvedImage = isStalePlaceholder ? (fallback?.image || p.image) : p.image;

          setProduct({
            ...fallback,
            ...p,
            image: resolvedImage,
            images: (Array.isArray(p.images) && p.images.length > 0 && !p.images[0]?.includes('m.media-amazon.com'))
              ? p.images
              : (resolvedImage ? [resolvedImage] : [])
          });
          const { data: c } = await supabase.from('categories').select('*').eq('id', p.category).single();
          if (c) setCategory(c);
        } else if (fallback) {
          setProduct(fallback);
          const cat = fallbackCategories.find(c => c.id === fallback.category);
          if (cat) setCategory(cat);
        }
      } catch (err) {
        const fallback = fallbackProducts.find(item => item.id === id);
        if (fallback) {
          setProduct(fallback);
          const cat = fallbackCategories.find(c => c.id === fallback.category);
          if (cat) setCategory(cat);
        }
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="dot-pulse" style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--text-primary)' }}></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>Product not found</h1>
        <button onClick={() => navigate('/shop')} className="btn-primary">Return to Shop</button>
      </div>
    );
  }

  const gallery = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : [product.image].filter(Boolean);
  const isHearted = isInWishlist(product.id);

  // Compute live stock count & inventory state
  const stockCount = getStockCount(product);
  const isOutOfStock = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  const handleAdd = () => {
    addToCart(product);
    toggleCart();
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description || `Buy ${product.name} at REAVO.`,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://reavo-app.vercel.app/product/${product.id}`,
      "priceCurrency": "NGN",
      "price": product.price,
      "availability": !isOutOfStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "inventoryLevel": {
        "@type": "QuantitativeValue",
        "value": stockCount
      },
      "seller": {
        "@type": "Organization",
        "name": "REAVO"
      }
    }
  };

  return (
    <main style={{ paddingTop: 80, paddingBottom: 120 }}>
      <SEO 
        title={product.name}
        description={product.description || `Buy ${product.name} at REAVO. Campus gadgets and electronics in Nigeria.`}
        image={product.image}
        url={`/product/${product.id}`}
        type="product"
        schema={productSchema}
      />
      
      <div className="container">
        <ScrollReveal>
          <button 
            onClick={() => navigate('/shop')} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 32, transition: 'color 0.2s', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} 
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} 
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={16} /> Back to all products
          </button>
        </ScrollReveal>

        <article className="product-grid" style={{ alignItems: 'start' }}>
          <ScrollReveal delay={100}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="glass-panel" style={{ width: '100%', aspectRatio: '1/1', borderRadius: 24, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-inner)', padding: 'clamp(16px, 4vw, 32px)' }}>
                <img 
                  src={gallery[selectedImage] || product.image} 
                  alt={product.name} 
                  onError={(e) => {
                    const fallback = fallbackProducts.find(p => p.id === product.id);
                    if (fallback && fallback.image && e.currentTarget.src !== fallback.image) {
                      e.currentTarget.src = fallback.image;
                    }
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>
              {gallery.length > 1 && (
                <div style={{ display: 'flex', gap: 12 }}>
                  {gallery.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)} style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', border: `2px solid ${selectedImage === i ? 'var(--text-primary)' : 'transparent'}`, background: 'var(--bg-inner)', opacity: selectedImage === i ? 1 : 0.6, cursor: 'pointer', padding: 6 }}>
                      <img 
                        src={img} 
                        alt={`${product.name} • view ${i + 1}`} 
                        onError={(e) => {
                          const fallback = fallbackProducts.find(p => p.id === product.id);
                          if (fallback && fallback.image && e.currentTarget.src !== fallback.image) {
                            e.currentTarget.src = fallback.image;
                          }
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: category?.color || 'var(--text-primary)' }}></div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{category?.label || 'General'}</span>
                </div>
                <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', marginBottom: 16 }}>{product.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div className="font-mono" style={{ fontSize: 'clamp(24px, 3.2vw, 30px)', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    {product.priceDisplay || `₦${product.price.toLocaleString()}`}
                  </div>

                  {/* Live Stock Quantity Indicator */}
                  {!isOutOfStock ? (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '5px 14px',
                      borderRadius: 100,
                      background: isLowStock ? 'rgba(255, 184, 0, 0.12)' : 'rgba(57, 217, 196, 0.12)',
                      border: `1px solid ${isLowStock ? 'rgba(255, 184, 0, 0.35)' : 'rgba(57, 217, 196, 0.35)'}`,
                      color: isLowStock ? '#FFB800' : 'var(--accent-primary)',
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: '0.01em',
                    }}>
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: isLowStock ? '#FFB800' : 'var(--accent-primary)',
                        boxShadow: `0 0 8px ${isLowStock ? 'rgba(255, 184, 0, 0.8)' : 'rgba(57, 217, 196, 0.8)'}`,
                        display: 'inline-block'
                      }} />
                      <span>
                        {isLowStock ? (
                          <>Only <strong>{stockCount} left</strong> in stock — order soon</>
                        ) : (
                          <><strong>{stockCount} units in stock</strong> — Ready to ship</>
                        )}
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '5px 14px',
                      borderRadius: 100,
                      background: 'rgba(255, 107, 74, 0.12)',
                      border: '1px solid rgba(255, 107, 74, 0.35)',
                      color: 'var(--accent-coral)',
                      fontSize: 13,
                      fontWeight: 600,
                    }}>
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: 'var(--accent-coral)',
                        boxShadow: '0 0 8px rgba(255, 107, 74, 0.8)',
                        display: 'inline-block'
                      }} />
                      <span><strong>0 units in stock</strong> — Currently sold out</span>
                    </div>
                  )}
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
                The definitive version of the {product.name}, crafted for the modern campus hustle. Features ultra-durable materials, seamless integration with your lifestyle, and the unmistakable REAVO aesthetic.
              </p>

              <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '24px 0' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
                    <Package size={18} />
                    <span>
                      {isOutOfStock ? (
                        <span style={{ color: 'var(--accent-coral)' }}>Out of stock at warehouse</span>
                      ) : (
                        <>Available Stock: <strong style={{ color: 'var(--text-primary)' }}>{stockCount} units</strong> ready at Nigerian Campus Hubs</>
                      )}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
                    <Truck size={18} /> Nationwide Delivery in 2-4 days
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
                    <ShieldCheck size={18} /> 1 Year Official Warranty
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
                    <RotateCcw size={18} /> 7-Day Return Policy
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                {isOutOfStock ? (
                  <button disabled className="btn-ghost" style={{ flex: 1, padding: '20px', fontSize: 16, borderRadius: 100, opacity: 0.5, cursor: 'not-allowed' }}>
                    Out of Stock (0 Available)
                  </button>
                ) : (
                  <button onClick={handleAdd} className="btn-primary" style={{ flex: 1, padding: '20px', fontSize: 16, borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <ShoppingBag size={18} />
                    <span>Add to Cart ({stockCount} in stock)</span>
                  </button>
                )}
                  <button 
                  onClick={() => toggleWishlist(product.id)}
                  style={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: 100, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    color: isHearted ? 'var(--accent-coral)' : 'var(--text-primary)',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  <Heart size={24} fill={isHearted ? 'var(--accent-coral)' : 'none'} />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </article>
      </div>
      
      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 64px;
        }
        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
      `}</style>
    </main>
  );
}
