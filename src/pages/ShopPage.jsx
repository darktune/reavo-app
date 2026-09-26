import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import SEO from '../components/SEO';
import { Search, SlidersHorizontal, Heart, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CompareDrawer from '../components/CompareDrawer';
import ScrollReveal from '../components/ScrollReveal';
import { supabase } from '../lib/supabase';
import { useWishlist } from '../context/WishlistContext';
import { products as fallbackProducts, categories as fallbackCategories } from '../data/products';

const HARDWARE_TYPES = [
  { id: 'all', label: 'All Hardware' },
  { id: 'laptops', label: '💻 Laptops' },
  { id: 'tablets', label: '📱 iPads & Tablets' },
  { id: 'audio', label: '🎧 Audio & AirPods' },
  { id: 'gear', label: '⚡ Gear & Sleeves' },
  { id: 'kits', label: '📦 Campus Bundles' },
  { id: 'deals', label: '🔥 Under ₦150k' },
];

function matchesHardwareType(product, type) {
  if (!type || type === 'all') return true;
  const name = (product.name || '').toLowerCase();
  if (type === 'laptops') return /macbook|laptop|thinkpad|rog|dell|zenbook|hp|omen|surface/i.test(name);
  if (type === 'tablets') return /ipad|tablet|galaxy tab/i.test(name);
  if (type === 'audio') return /airpods|headphone|earbud|audio|speaker|wh-1000|pa system|blackshark/i.test(name);
  if (type === 'gear') return /sleeve|stand|keyboard|mouse|deathadder|charger|hub|cable|case/i.test(name);
  if (type === 'kits') return /bundle|pack|kit|package/i.test(name) || product.category === 'schools' || product.category === 'events';
  if (type === 'deals') return product.price <= 150000;
  return true;
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [compareItems, setCompareItems] = useState([]);
  const { wishlist } = useWishlist();
  
  const [products, setProducts] = useState(fallbackProducts);
  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [{ data: prodData }, { data: catData }] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('categories').select('*')
        ]);
        if (prodData && prodData.length > 0) {
          const prodMap = new Map();
          fallbackProducts.forEach(fp => prodMap.set(fp.id, { ...fp }));
          prodData.forEach(dbProd => {
            const existing = prodMap.get(dbProd.id);
            const isStalePlaceholder = !dbProd.image ||
              (existing?.image && existing.image.startsWith('/images/')) ||
              dbProd.image.includes('m.media-amazon.com') ||
              dbProd.image.includes('apple.com') ||
              dbProd.image.includes('cdsassets') ||
              (dbProd.image.includes('images.unsplash.com/photo-15') && existing?.image && !existing.image.includes('images.unsplash.com'));
            const resolvedImage = isStalePlaceholder ? (existing?.image || dbProd.image) : dbProd.image;

            prodMap.set(dbProd.id, {
              ...existing,
              ...dbProd,
              image: resolvedImage,
              images: (Array.isArray(dbProd.images) && dbProd.images.length > 0 && !dbProd.images[0]?.includes('m.media-amazon.com'))
                ? dbProd.images
                : (resolvedImage ? [resolvedImage] : [])
            });
          });
          setProducts(Array.from(prodMap.values()));
        }
        if (catData && catData.length > 0) setCategories(catData);
      } catch (e) {
        console.warn('Using fallback catalog data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentCategory = searchParams.get('cat') || 'all';
  const currentHardwareType = searchParams.get('type') || 'all';
  const isWishlistOnly = searchParams.get('wishlist') === 'true';

  // Filter products
  let filteredProducts = products.filter(p => {
    if (isWishlistOnly && !wishlist.includes(p.id)) return false;
    const matchesCat = currentCategory === 'all' || p.category === currentCategory;
    const matchesHw = matchesHardwareType(p, currentHardwareType);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesHw && matchesSearch;
  });

  // Sort products
  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const handleCompare = (product) => {
    if (compareItems.find(p => p.id === product.id)) return;
    if (compareItems.length >= 3) {
      setCompareItems(prev => [...prev.slice(1), product]);
    } else {
      setCompareItems(prev => [...prev, product]);
    }
  };

  const removeCompare = (id) => {
    setCompareItems(prev => prev.filter(p => p.id !== id));
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  return (
    <main style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--bg-void)' }}>
      <SEO 
        title={isWishlistOnly ? "My Wishlist • REAVO" : currentCategory === 'all' ? "Shop Gadgets • REAVO" : `Shop ${categories.find(c => c.id === currentCategory)?.name || 'Products'}`} 
        url={isWishlistOnly ? "/shop?wishlist=true" : currentCategory === 'all' ? "/shop" : `/shop?cat=${currentCategory}`} 
      />

      {/* Header & Filters Navigation */}
      <nav aria-label="Product Filters" style={{ 
        position: 'sticky', 
        top: 64, 
        zIndex: 40,
        background: 'var(--bg-void)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '16px 0',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Top Row: Search & Sort & Wishlist Pill */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="shop-filters" style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '1 1 320px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Search laptops, iPads, audio..." 
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (e.target.value === '') {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('q');
                      setSearchParams(newParams);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 100,
                    padding: '10px 16px 10px 40px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: 13
                  }}
                />
              </div>
              
              <div style={{ position: 'relative' }}>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    appearance: 'none',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 100,
                    padding: '10px 34px 10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <SlidersHorizontal size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            {/* Quick Wishlist Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                const p = new URLSearchParams(searchParams);
                if (isWishlistOnly) {
                  p.delete('wishlist');
                } else {
                  p.set('wishlist', 'true');
                }
                setSearchParams(p);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 100,
                background: isWishlistOnly ? 'rgba(255, 71, 87, 0.15)' : 'var(--bg-inner)',
                border: `1px solid ${isWishlistOnly ? '#FF4757' : 'var(--border-subtle)'}`,
                color: isWishlistOnly ? '#FF4757' : 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Heart size={14} fill={isWishlistOnly ? '#FF4757' : 'none'} color={isWishlistOnly ? '#FF4757' : 'currentColor'} />
              <span>Wishlist ({wishlist.length})</span>
            </button>
          </div>

          {/* Row 2: Hardware Category Quick Pills (Hick's Law: Direct concrete hardware) */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
            {HARDWARE_TYPES.map(hw => {
              const active = !isWishlistOnly && currentHardwareType === hw.id;
              return (
                <button
                  key={hw.id}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.delete('wishlist');
                    if (hw.id === 'all') {
                      p.delete('type');
                    } else {
                      p.set('type', hw.id);
                    }
                    setSearchParams(p);
                  }}
                  style={{
                    flexShrink: 0,
                    padding: '6px 14px',
                    borderRadius: 100,
                    background: active ? 'var(--text-primary)' : 'var(--bg-inner)',
                    color: active ? 'var(--bg-void)' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'transparent' : 'var(--border-subtle)'}`,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {hw.label}
                </button>
              );
            })}
          </div>

        </div>
      </nav>

      {/* Product Grid Area */}
      <section aria-label="Product Listings" className="container" style={{ padding: '32px 24px 120px' }}>
        {/* Active Filter Pill Bar if filtered */}
        {(currentHardwareType !== 'all' || currentCategory !== 'all' || isWishlistOnly || searchQuery) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Active Filter:</span>
            {isWishlistOnly && (
              <span style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 4, 
                padding: '3px 10px', borderRadius: 100, background: 'rgba(255, 71, 87, 0.15)', 
                color: '#FF4757', fontSize: 12, fontWeight: 600 
              }}>
                ❤️ Saved Wishlist
              </span>
            )}
            {currentHardwareType !== 'all' && (
              <span style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 4, 
                padding: '3px 10px', borderRadius: 100, background: 'var(--glass-bg)', 
                border: '1px solid var(--border-subtle)', color: 'var(--accent-primary)', fontSize: 12, fontWeight: 600 
              }}>
                {HARDWARE_TYPES.find(h => h.id === currentHardwareType)?.label}
              </span>
            )}
            <button 
              onClick={clearAllFilters}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 100, background: 'transparent',
                border: 'none', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              <X size={12} /> Clear filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="shop-grid">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="skeleton" style={{ height: 380, borderRadius: 18 }}></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-secondary)' }}>
            {isWishlistOnly ? (
              <div>
                <div style={{ 
                  width: 56, height: 56, borderRadius: '50%', background: 'rgba(255, 71, 87, 0.1)', 
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 
                }}>
                  <Heart size={28} color="#FF4757" />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  Your Wishlist is Empty
                </h3>
                <p style={{ maxWidth: 420, margin: '0 auto 24px', fontSize: 14 }}>
                  Tap the ❤️ heart icon on any gadget while browsing to save your dream setup here.
                </p>
                <button onClick={clearAllFilters} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Explore All Gadgets
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>No products found</h3>
                <p style={{ maxWidth: 400, margin: '0 auto 20px', fontSize: 14 }}>We couldn't find matches for this filter. Try adjusting your search.</p>
                <button onClick={clearAllFilters} className="btn-ghost">
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="shop-grid">
            {filteredProducts.map((product, i) => (
              <ScrollReveal key={product.id} delay={(i % 4) * 80}>
                <ProductCard product={product} onCompare={handleCompare} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      <CompareDrawer 
        isOpen={compareItems.length > 0} 
        products={compareItems} 
        onRemove={removeCompare}
        onClose={() => setCompareItems([])} 
      />

      <style>{`
        .shop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 24px;
        }
        @media (max-width: 768px) {
          .shop-grid {
            grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
            gap: 18px;
          }
          .shop-filters {
            flex-direction: column;
            width: 100%;
          }
          .shop-filters > div {
            width: 100%;
          }
          .shop-filters select {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
