import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import SEO from '../components/SEO';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import CompareDrawer from '../components/CompareDrawer';
import ScrollReveal from '../components/ScrollReveal';
import { supabase } from '../lib/supabase';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [compareItems, setCompareItems] = useState([]);
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [{ data: prodData }, { data: catData }] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*')
      ]);
      if (prodData) setProducts(prodData);
      if (catData) setCategories(catData);
      setLoading(false);
    }
    loadData();
  }, []);

  const currentCategory = searchParams.get('cat') || 'all';

  // Filter products
  let filteredProducts = products.filter(p => {
    const matchesCat = currentCategory === 'all' || p.category === currentCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
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
      // Replace oldest
      setCompareItems(prev => [...prev.slice(1), product]);
    } else {
      setCompareItems(prev => [...prev, product]);
    }
  };

  const removeCompare = (id) => {
    setCompareItems(prev => prev.filter(p => p.id !== id));
  };

  return (
    <main style={{ paddingTop: 64, minHeight: '100vh' }}>
      <SEO 
        title={currentCategory === 'all' ? "Shop" : `Shop ${categories.find(c => c.id === currentCategory)?.name || 'Products'}`} 
        url={currentCategory === 'all' ? "/shop" : `/shop?cat=${currentCategory}`} 
      />
      {/* Header & Filters */}
      <nav aria-label="Product Filters" style={{ 
        position: 'sticky', 
        top: 64, 
        zIndex: 40,
        background: 'var(--bg-void)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '24px 0'
      }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Categories */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            <button 
              className="glass-hover"
              onClick={() => setSearchParams({})}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: 100,
                background: currentCategory === 'all' ? 'var(--text-primary)' : 'transparent',
                color: currentCategory === 'all' ? 'var(--bg-void)' : 'var(--text-secondary)',
                border: `1px solid ${currentCategory === 'all' ? 'transparent' : 'var(--border-subtle)'}`,
                fontSize: 14,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              All Products
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className="glass-hover"
                onClick={() => setSearchParams({ cat: cat.id })}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: 100,
                  background: currentCategory === cat.id ? 'var(--text-primary)' : 'transparent',
                  color: currentCategory === cat.id ? 'var(--bg-void)' : 'var(--text-secondary)',
                  border: `1px solid ${currentCategory === cat.id ? 'transparent' : 'var(--border-subtle)'}`,
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }}></div>
                {cat.label}
              </button>
            ))}
          </div>

            {/* Search */}
          <div className="shop-filters" style={{ display: 'flex', gap: 12, alignItems: 'center', flex: '1 1 300px' }}>
            <div style={{
              position: 'relative',
              flex: 1
            }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  // Update URL param if user clears search or types
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
                  padding: '12px 16px 12px 44px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: 14
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
                  padding: '12px 36px 12px 16px',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <SlidersHorizontal size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
            </div>
          </div>

        </div>
      </nav>

      {/* Product Grid */}
      <section aria-label="Product Listings" className="container" style={{ padding: '48px 24px 120px' }}>
        {loading ? (
          <div className="shop-grid">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="skeleton" style={{ height: 400, borderRadius: 16 }}></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-secondary)' }}>
            <h3 style={{ fontSize: 24, marginBottom: 12, color: 'var(--text-primary)' }}>No products found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="shop-grid">
            {filteredProducts.map((product, i) => (
              <ScrollReveal key={product.id} delay={(i % 4) * 100}>
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
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 32px;
        }
        @media (max-width: 768px) {
          .shop-grid {
            grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
            gap: 24px;
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
