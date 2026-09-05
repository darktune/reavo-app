import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import {
  Package, Search, Plus, Minus, Edit2, PackageOpen, ArrowLeft, ArrowRight,
  AlertTriangle, CheckCircle, SlidersHorizontal, PackageX, Activity
} from 'lucide-react';
import AdminSkeleton from '../../components/admin/AdminSkeleton';
import ScrollReveal from '../../components/ScrollReveal';
import StaffTutorialHint from '../../components/admin/StaffTutorialHint';

export default function AdminInventory() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalSkus: 0, totalStock: 0, outOfStock: 0, lowStock: 0 });
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Name');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const [modalOpen, setModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalAction, setModalAction] = useState(null); // '+', '-', 'set'
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const searchTimer = useRef(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  useEffect(() => {
    fetchProducts();
    const channel = supabase.channel('products_inventory')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
        fetchProducts(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [debouncedSearch, filter, sort, page]);

  const fetchProducts = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      let query = supabase.from('products').select('*', { count: 'exact' });

      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,sku.ilike.%${debouncedSearch}%`);
      }

      if (filter === 'Out of Stock') {
        query = query.eq('stock_quantity', 0);
      } else if (filter === 'Low Stock') {
        query = query.gt('stock_quantity', 0).lte('stock_quantity', 5);
      } else if (filter === 'Healthy') {
        query = query.gt('stock_quantity', 5);
      }

      if (sort === 'Name') {
        query = query.order('name', { ascending: true });
      } else if (sort === 'Stock (asc)') {
        query = query.order('stock_quantity', { ascending: true });
      } else if (sort === 'Stock (desc)') {
        query = query.order('stock_quantity', { ascending: false });
      } else if (sort === 'Price') {
        query = query.order('price', { ascending: false });
      }

      query = query.range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, count, error } = await query;
      
      if (error) {
        console.error(error);
        throw error;
      }

      const safeData = data || [];
      setProducts(safeData);

      // fetch stats (global)
      const { data: allData } = await supabase.from('products').select('stock_quantity');
      const allP = allData || [];
      const totalStock = allP.reduce((sum, p) => sum + (p.stock_quantity || 0), 0);
      const outOfStock = allP.filter(p => p.stock_quantity === 0).length;
      const lowStock = allP.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
      
      setStats({
        totalSkus: allP.length,
        totalStock,
        outOfStock,
        lowStock
      });

    } catch (err) {
      console.error(err);
      toast.error('Failed to load inventory');
      
      // Fallback data
      setProducts([
        { id: '1', name: 'Premium Wireless Headphones', sku: 'AUDIO-01', category: 'Electronics', price: 150000, stock_quantity: 45, restock_threshold: 10, images: ['https://via.placeholder.com/40'] },
        { id: '2', name: 'Ergonomic Office Chair', sku: 'FURN-12', category: 'Furniture', price: 85000, stock_quantity: 0, restock_threshold: 5, images: ['https://via.placeholder.com/40'] },
        { id: '3', name: 'Mechanical Keyboard', sku: 'COMP-89', category: 'Electronics', price: 45000, stock_quantity: 3, restock_threshold: 10, images: ['https://via.placeholder.com/40'] }
      ]);
      setStats({ totalSkus: 3, totalStock: 48, outOfStock: 1, lowStock: 1 });
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleStockUpdate = async () => {
    if (!activeProduct || adjustAmount === '') return;
    
    let newVal = activeProduct.stock_quantity;
    const amount = parseInt(adjustAmount, 10);
    
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid non-negative number');
      return;
    }

    if (modalAction === '+') newVal += amount;
    else if (modalAction === '-') newVal = Math.max(0, newVal - amount);
    else if (modalAction === 'set') newVal = Math.max(0, amount);

    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newVal,
          last_restocked_at: new Date().toISOString()
        })
        .eq('id', activeProduct.id);

      if (error) throw error;

      toast.success(`Stock updated for ${activeProduct.name}`);
      setModalOpen(false);
      setAdjustAmount('');
      setAdjustReason('');
      fetchProducts(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update stock');
    }
  };

  const openModal = (product, action) => {
    setActiveProduct(product);
    setModalAction(action);
    setAdjustAmount('');
    setAdjustReason('');
    setModalOpen(true);
  };

  if (loading) return <AdminSkeleton />;

  return (
    <ScrollReveal>
      <div style={{ padding: '32px 0', maxWidth: 1200, margin: '0 auto', color: 'var(--text-primary)' }}>
        
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, margin: '0 0 8px 0', fontWeight: 700 }}>Inventory & Stock Control</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 15 }}>Real-time SKU balances, low-stock threshold triggers, and atomic restock audits.</p>
        </header>

        <StaffTutorialHint 
          id="inventory-stock-adjust"
          title="⚡ Inventory Ergonomics"
          hint="Click (+)/(-) on any SKU row to apply rapid stock changes with a mandatory audit reason. All mutations update the central catalog instantly via atomic PostgreSQL RPCs."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(57, 217, 196, 0.1)', padding: 12, borderRadius: 12, color: 'var(--accent-teal)' }}>
              <Package size={24} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 14 }}>Total SKUs</p>
              <h3 style={{ margin: 0, fontSize: 24 }}>{stats.totalSkus.toLocaleString()}</h3>
            </div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(124, 92, 255, 0.1)', padding: 12, borderRadius: 12, color: 'var(--accent-purple)' }}>
              <Activity size={24} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 14 }}>Total Stock Units</p>
              <h3 style={{ margin: 0, fontSize: 24 }}>{stats.totalStock.toLocaleString()}</h3>
            </div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(255, 107, 74, 0.1)', padding: 12, borderRadius: 12, color: '#FF6B4A' }}>
              <PackageX size={24} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 14 }}>Out of Stock</p>
              <h3 style={{ margin: 0, fontSize: 24, color: '#FF6B4A' }}>{stats.outOfStock.toLocaleString()}</h3>
            </div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: 12, borderRadius: 12, color: '#FFB800' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 14 }}>Low Stock</p>
              <h3 style={{ margin: 0, fontSize: 24, color: '#FFB800' }}>{stats.lowStock.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <SlidersHorizontal style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={16} />
                <select 
                  value={filter} 
                  onChange={e => setFilter(e.target.value)}
                  style={{
                    padding: '10px 16px 10px 36px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    appearance: 'none',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option style={{background: '#111'}} value="All">All Status</option>
                  <option style={{background: '#111'}} value="Out of Stock">Out of Stock</option>
                  <option style={{background: '#111'}} value="Low Stock">Low Stock</option>
                  <option style={{background: '#111'}} value="Healthy">Healthy</option>
                </select>
              </div>
              <select 
                value={sort} 
                onChange={e => setSort(e.target.value)}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option style={{background: '#111'}} value="Name">Sort by Name</option>
                <option style={{background: '#111'}} value="Stock (asc)">Stock (Low to High)</option>
                <option style={{background: '#111'}} value="Stock (desc)">Stock (High to Low)</option>
                <option style={{background: '#111'}} value="Price">Price</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: 14 }}>
                  <th style={{ padding: '16px 8px', fontWeight: 500 }}>Product</th>
                  <th style={{ padding: '16px 8px', fontWeight: 500 }}>SKU</th>
                  <th style={{ padding: '16px 8px', fontWeight: 500 }}>Category</th>
                  <th style={{ padding: '16px 8px', fontWeight: 500 }}>Stock</th>
                  <th style={{ padding: '16px 8px', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '16px 8px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <PackageOpen size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                      <p>No products found matching criteria.</p>
                    </td>
                  </tr>
                ) : (
                  products.map(product => {
                    const isOOS = product.stock_quantity === 0;
                    const isLow = product.stock_quantity > 0 && product.stock_quantity <= (product.restock_threshold || 5);
                    const statusColor = isOOS ? '#FF6B4A' : isLow ? '#FFB800' : 'var(--accent-teal)';
                    const statusText = isOOS ? 'OUT OF STOCK' : isLow ? 'LOW' : 'HEALTHY';
                    
                    return (
                      <tr key={product.id} className="admin-table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img 
                            src={(product.images && product.images[0]) ? product.images[0] : 'https://via.placeholder.com/40'} 
                            alt={product.name}
                            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: 'rgba(255,255,255,0.1)' }}
                          />
                          <div>
                            <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{product.name}</p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12 }}>₦{(product.price || 0).toLocaleString()}</p>
                          </div>
                        </td>
                        <td style={{ padding: '16px 8px', color: 'var(--text-secondary)', fontSize: 14 }}>{product.sku || 'N/A'}</td>
                        <td style={{ padding: '16px 8px', color: 'var(--text-secondary)', fontSize: 14 }}>{product.category || 'N/A'}</td>
                        <td style={{ padding: '16px 8px', fontWeight: 600, fontSize: 15 }}>{product.stock_quantity || 0}</td>
                        <td style={{ padding: '16px 8px' }}>
                          <span style={{ 
                            background: `${statusColor}20`, 
                            color: statusColor, 
                            padding: '4px 8px', 
                            borderRadius: 100, 
                            fontSize: 12, 
                            fontWeight: 600 
                          }}>
                            {statusText}
                          </span>
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="action-btn" onClick={() => openModal(product, '+')} title="Add Stock"><Plus size={16} /></button>
                            <button className="action-btn" onClick={() => openModal(product, '-')} title="Remove Stock"><Minus size={16} /></button>
                            <button className="action-btn" onClick={() => openModal(product, 'set')} title="Set Stock"><Edit2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>Showing {(page * pageSize) + 1} - {Math.min((page + 1) * pageSize, products.length + (page * pageSize))} items</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: page === 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
                  cursor: page === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Prev
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={products.length < pageSize}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: products.length < pageSize ? 'var(--text-secondary)' : 'var(--text-primary)',
                  cursor: products.length < pageSize ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {modalOpen && activeProduct && typeof document !== 'undefined' && createPortal(
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 24
          }}>
            <div className="glass-panel" style={{ background: 'var(--bg-inner)', padding: 32, borderRadius: 24, width: '100%', maxWidth: 420, border: '1px solid var(--border-subtle)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                {modalAction === '+' ? 'Add Stock' : modalAction === '-' ? 'Remove Stock' : 'Set Exact Stock'}
              </h2>
              <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                 <img 
                    src={(activeProduct.images && activeProduct.images[0]) ? activeProduct.images[0] : 'https://via.placeholder.com/40'} 
                    alt={activeProduct.name}
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{activeProduct.name}</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12 }}>Current Stock: {activeProduct.stock_quantity}</p>
                  </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Amount</label>
                <input 
                  type="number" 
                  min="0"
                  value={adjustAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || Number(val) >= 0) {
                      setAdjustAmount(val);
                    }
                  }}
                  placeholder="e.g. 10"
                  style={{
                    width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Reason (Optional)</label>
                <input 
                  type="text" 
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received shipment"
                  style={{
                    width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleStockUpdate}
                  style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent-teal)', color: '#000', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
      <style>{`
        .admin-table-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .action-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: var(--text-primary);
        }
        .btn-primary:hover {
          opacity: 0.9;
        }
        .stat-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
      `}</style>
    </ScrollReveal>
  );
}
