import { useSearchParams, useNavigate } from 'react-router';
import { ArrowLeft, Check, X } from 'lucide-react';
import { products } from '../data/products';
import ScrollReveal from '../components/ScrollReveal';

export default function ComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const ids = searchParams.get('ids')?.split(',') || [];
  const compareProducts = products.filter(p => ids.includes(p.id));

  if (compareProducts.length === 0) {
    return (
      <div style={{ paddingTop: 120, minHeight: '80vh', textAlign: 'center' }}>
        <h2>No products selected for comparison.</h2>
        <button className="btn-primary" onClick={() => navigate('/shop')} style={{ marginTop: 24 }}>Back to Shop</button>
      </div>
    );
  }

  // Define the specs we want to compare (keys from technicalSpecs)
  const specKeys = ['Processor', 'Memory', 'Storage', 'Display', 'Battery', 'Ports'];

  return (
    <div style={{ paddingTop: 120, paddingBottom: 120, minHeight: '100vh', background: 'var(--bg-void)' }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        
        <ScrollReveal>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
            <button 
              onClick={() => navigate('/shop')}
              style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-inner)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>Compare Products</h1>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div style={{ overflowX: 'auto', paddingBottom: 32 }}>
            <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse' }}>
              
              {/* Table Header: Products */}
              <thead>
                <tr>
                  <th style={{ width: '20%', padding: 16, borderBottom: '1px solid var(--border-active)' }}></th>
                  {compareProducts.map(p => (
                    <th key={p.id} style={{ width: `${80 / compareProducts.length}%`, padding: 16, borderBottom: '1px solid var(--border-active)', textAlign: 'left', verticalAlign: 'top' }}>
                      <div style={{ background: 'var(--bg-inner)', borderRadius: 16, padding: 16, position: 'relative' }}>
                        <button 
                          onClick={() => {
                            const newIds = compareProducts.filter(cp => cp.id !== p.id).map(cp => cp.id);
                            if (newIds.length === 0) navigate('/shop');
                            else navigate(`/compare?ids=${newIds.join(',')}`);
                          }}
                          style={{ position: 'absolute', top: 8, right: 8, color: 'var(--text-secondary)' }}
                        >
                          <X size={16} />
                        </button>
                        <div style={{ height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                          <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>{p.name}</h3>
                        <div className="font-mono" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>₦{p.price.toLocaleString()}</div>
                        <button 
                          onClick={() => navigate(`/product/${p.id}`)}
                          className="btn-primary"
                          style={{ width: '100%', padding: '8px', fontSize: 13, marginTop: 16 }}
                        >
                          Buy Now
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body: Specs */}
              <tbody>
                {specKeys.map((key, i) => (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '24px 16px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                      {key}
                    </td>
                    {compareProducts.map(p => (
                      <td key={`${p.id}-${key}`} style={{ padding: '24px 16px', color: 'var(--text-secondary)', fontSize: 14 }}>
                        {p.technicalSpecs[key] || 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              
            </table>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}
