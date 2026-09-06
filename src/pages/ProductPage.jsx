import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { ShoppingBag, ArrowLeft, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../lib/supabase';
import ScrollReveal from '../components/ScrollReveal';
import { products as fallbackProducts, categories as fallbackCategories } from '../data/products';

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
        if (p) {
          setProduct(p);
          const { data: c } = await supabase.from('categories').select('*').eq('id', p.category).single();
          if (c) setCategory(c);
        } else {
          const fallback = fallbackProducts.find(item => item.id === id);
          if (fallback) {
            setProduct(fallback);
            const cat = fallbackCategories.find(c => c.id === fallback.category);
            if (cat) setCategory(cat);
          }
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

  const gallery = [product.image, product.image, product.image];
  const isHearted = isInWishlist(product.id);

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
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
                <img src={gallery[selectedImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {gallery.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', border: `2px solid ${selectedImage === i ? 'var(--text-primary)' : 'transparent'}`, background: 'var(--bg-inner)', opacity: selectedImage === i ? 1 : 0.6, cursor: 'pointer', padding: 6 }}>
                    <img src={img} alt={`${product.name} — view ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
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
                <div className="font-mono" style={{ fontSize: 24, color: 'var(--accent-primary)', fontWeight: 600 }}>
                  {product.priceDisplay || `₦${product.price.toLocaleString()}`}
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
                The definitive version of the {product.name}, crafted for the modern campus hustle. Features ultra-durable materials, seamless integration with your lifestyle, and the unmistakable REAVO aesthetic.
              </p>

              <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '24px 0' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  {product.stock_quantity <= 0 ? (
                    <button disabled className="btn-ghost" style={{ flex: 1, padding: '20px', fontSize: 16, borderRadius: 100, opacity: 0.5, cursor: 'not-allowed' }}>
                      Out of Stock
                    </button>
                  ) : (
                    <button onClick={handleAdd} className="btn-primary" style={{ flex: 1, padding: '20px', fontSize: 16, borderRadius: 100 }}>
                      Add to Cart
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
