import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import SEO from '../components/SEO';
import { Search, SlidersHorizontal, Heart, X, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CompareDrawer from '../components/CompareDrawer';
import ScrollReveal from '../components/ScrollReveal';
import { supabase } from '../lib/supabase';
import { useWishlist } from '../context/WishlistContext';
import { products as fallbackProducts, categories as fallbackCategories } from '../data/products';

const HARDWARE_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'laptops', label: 'Laptops' },
  { id: 'tablets', label: 'iPads & Tablets' },
  { id: 'audio', label: 'Audio & AirPods' },
  { id: 'gear', label: 'Gear & Sleeves' },
  { id: 'kits', label: 'Campus Bundles' },
  { id: 'deals', label: 'Under ₦150k' },
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

function CustomDropdown({ value, onChange, options, minWidth = 160 }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} style={{ position: 'relative', flex: '1 1 auto', minWidth }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-inner)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 100,
          padding: '10px 14px',
          color: 'var(--text-primary)',
          fontSize: 13,
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {selectedOption?.color && <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedOption.color }} />}
          <span>{selectedOption?.label}</span>
        </div>
        <ChevronDown size={14} style={{ color: 'var(--text-secondary)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: 8,
          zIndex: 50,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: value === opt.value ? 'var(--bg-inner)' : 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) e.currentTarget.style.background = 'var(--bg-inner)';
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) e.currentTarget.style.background = 'transparent';
              }}
            >
              {opt.color && <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color }} />}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [compareItems, setCompareItems] = useState([]);
  const { wishlist } = useWishlist();
  const [wishlistAnim, setWishlistAnim] = useState(false);
  const prevWishlistLength = useRef(wishlist.length);
  
  const [products, setProducts] = useState(fallbackProducts);
  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlist.length > prevWishlistLength.current) {
      setWishlistAnim(true);
      const timer = setTimeout(() => setWishlistAnim(false), 600);
      return () => clearTimeout(timer);
    }
    prevWishlistLength.current = wishlist.length;
  }, [wishlist.length]);

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
              images: (existing?.images?.length > 0)
                ? existing.images
                : ((Array.isArray(dbProd.images) && dbProd.images.length > 0 && !dbProd.images[0]?.includes('m.media-amazon.com'))
                    ? dbProd.images
                    : (resolvedImage ? [resolvedImage] : []))
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

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(c => ({ value: c.id, label: c.label, color: c.color }))
  ];
  
  const typeOptions = HARDWARE_TYPES.map(hw => ({ value: hw.id, label: hw.label }));
  
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

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
          
          {/* Top Row: Search & Filters & Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="shop-filters" style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '1 1 auto', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 200 }}>
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

              <CustomDropdown
                value={currentCategory}
                options={categoryOptions}
                onChange={(val) => {
                  const p = new URLSearchParams(searchParams);
                  p.delete('wishlist');
                  if (val === 'all') {
                    p.delete('cat');
                  } else {
                    p.set('cat', val);
                  }
                  setSearchParams(p);
                }}
              />

              <CustomDropdown
                value={currentHardwareType}
                options={typeOptions}
                onChange={(val) => {
                  const p = new URLSearchParams(searchParams);
                  p.delete('wishlist');
                  if (val === 'all') {
                    p.delete('type');
                  } else {
                    p.set('type', val);
                  }
                  setSearchParams(p);
                }}
              />
              
              <CustomDropdown
                value={sortBy}
                options={sortOptions}
                onChange={(val) => setSortBy(val)}
                minWidth={180}
              />
            </div>

            {/* Quick Wishlist Mode Toggle */}
            <button
              type="button"
              className={wishlistAnim ? 'heart-pulse' : ''}
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
                color: isWishlistOnly || wishlistAnim ? '#FF4757' : 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <Heart size={14} fill={isWishlistOnly || wishlistAnim ? '#FF4757' : 'none'} color={isWishlistOnly || wishlistAnim ? '#FF4757' : 'currentColor'} />
              <span>Wishlist ({wishlist.length})</span>
            </button>
          </div>

        </div>
      </nav>

      {/* Product Grid Area */}
      <section aria-label="Product Listings" className="container" style={{ padding: '32px 24px 120px' }}>
        {/* Active Filter Pill Bar if filtered */}
        {(currentHardwareType !== 'all' || currentCategory !== 'all' || isWishlistOnly || searchQuery) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Active:</span>
            {isWishlistOnly && (
              <span style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 4, 
                padding: '3px 10px', borderRadius: 100, background: 'rgba(255, 71, 87, 0.15)', 
                color: '#FF4757', fontSize: 12, fontWeight: 600 
              }}>
                <Heart size={12} fill="#FF4757" /> Saved Wishlist
              </span>
            )}
            {currentCategory !== 'all' && (
              <span style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 6, 
                padding: '3px 10px', borderRadius: 100, background: 'var(--bg-inner)', 
                border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600 
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: categories.find(c => c.id === currentCategory)?.color || 'var(--accent-primary)' }} />
                <span>{categories.find(c => c.id === currentCategory)?.label || currentCategory}</span>
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
                  Tap the heart icon on any gadget while browsing to save your dream setup here.
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
        @keyframes heartPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(255, 71, 87, 0); border-color: #FF4757; }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 71, 87, 0); }
        }
        .heart-pulse {
          animation: heartPulse 0.6s ease-out;
        }
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
