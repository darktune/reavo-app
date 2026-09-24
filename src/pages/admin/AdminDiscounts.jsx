import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash2, Tag, Percent, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import AdminSkeleton from '../../components/admin/AdminSkeleton';

export default function AdminDiscounts() {
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState(getInitialForm());

  function getInitialForm() {
    return {
      code: '',
      type: 'percentage',
      value: '',
      min_order_amount: '',
      max_uses: '',
      valid_from: '',
      valid_until: '',
      applies_to: 'all',
      is_active: true
    };
  }

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('discounts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'discounts' }, () => {
        fetchData(true);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const { data, error } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
      if (error) {
        setDiscounts([]);
      } else {
        setDiscounts(data || []);
      }
    } catch (e) {
      setDiscounts([]);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const getStatus = (discount) => {
    if (!discount.is_active) return 'PAUSED';
    const now = new Date();
    if (discount.valid_until && new Date(discount.valid_until) < now) return 'EXPIRED';
    if (discount.valid_from && new Date(discount.valid_from) > now) return 'SCHEDULED';
    return 'ACTIVE';
  };

  const filteredDiscounts = discounts.filter(d => {
    const matchesSearch = d.code.toLowerCase().includes(search.toLowerCase());
    const status = getStatus(d);
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && status === 'ACTIVE') ||
                         (filter === 'expired' && status === 'EXPIRED') ||
                         (filter === 'scheduled' && status === 'SCHEDULED');
    return matchesSearch && matchesFilter;
  });

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData({ ...formData, code });
  };

  const saveDiscount = async () => {
    try {
      const payload = {
        ...formData,
        value: Number(formData.value),
        min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : 0,
        max_uses: formData.max_uses ? Number(formData.max_uses) : null,
      };

      if (editingDiscount) {
        const { error } = await supabase.from('discounts').update(payload).eq('id', editingDiscount.id);
        if (error) throw error;
        toast.success('Discount updated successfully');
      } else {
        const { error } = await supabase.from('discounts').insert([{ ...payload, times_used: 0 }]);
        if (error) throw error;
        toast.success('Discount created successfully');
      }
      setModalOpen(false);
      fetchData(true);
    } catch (e) {
      toast.error('Failed to save discount. Falling back to local state.');
      const newD = { ...formData, id: editingDiscount ? editingDiscount.id : Date.now(), times_used: editingDiscount ? editingDiscount.times_used : 0, created_at: new Date().toISOString() };
      setDiscounts(prev => editingDiscount ? prev.map(p => p.id === newD.id ? newD : p) : [newD, ...prev]);
      setModalOpen(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('discounts').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      toast.success(currentStatus ? 'Discount paused' : 'Discount activated');
      fetchData(true);
    } catch (e) {
      setDiscounts(prev => prev.map(d => d.id === id ? { ...d, is_active: !currentStatus } : d));
      toast.success(currentStatus ? 'Discount paused (local)' : 'Discount activated (local)');
    }
  };

  const deleteDiscount = async (id) => {
    if (!window.confirm('Delete this discount?')) return;
    try {
      const { error } = await supabase.from('discounts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Discount deleted');
      fetchData(true);
    } catch (e) {
      setDiscounts(prev => prev.filter(d => d.id !== id));
      toast.success('Discount deleted (local)');
    }
  };

  if (loading) return <AdminSkeleton />;

  const activeCount = discounts.filter(d => getStatus(d) === 'ACTIVE').length;
  const totalUses = discounts.reduce((sum, d) => sum + (d.times_used || 0), 0);
  const avgDiscount = discounts.filter(d => d.type === 'percentage').reduce((sum, d, i, arr) => sum + d.value / arr.length, 0) || 0;
  const revenueImpact = discounts.filter(d => d.type === 'fixed').reduce((sum, d) => sum + ((d.value || 0) * (d.times_used || 0)), 0); // Simplified calculation

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', color: 'var(--text-primary)' }}>
      <ScrollReveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 8, margin: 0, fontWeight: 600 }}>Discounts</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Promo codes, discount rules, and usage analytics.</p>
          </div>
          <button className="btn-primary" onClick={() => { setEditingDiscount(null); setFormData(getInitialForm()); setModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: 'var(--accent-purple)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            <Plus size={18} /> Create Discount
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'var(--text-secondary)' }}>
              <span>Active Discounts</span>
              <Tag size={20} color="var(--accent-teal)" />
            </div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{activeCount}</div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'var(--text-secondary)' }}>
              <span>Total Uses</span>
              <ArrowUpRight size={20} color="var(--accent-purple)" />
            </div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{totalUses}</div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'var(--text-secondary)' }}>
              <span>Revenue Impact</span>
              <span style={{ fontSize: 20, color: 'var(--accent-teal)' }}>₦</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>₦{revenueImpact.toLocaleString()}</div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'var(--text-secondary)' }}>
              <span>Avg Discount %</span>
              <Percent size={20} color="#FFB800" />
            </div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{avgDiscount.toFixed(1)}%</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, borderRadius: 16, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Search codes..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'active', 'expired', 'scheduled'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: 8, 
                    background: filter === f ? 'var(--accent-purple)' : 'var(--bg-void)', 
                    color: filter === f ? '#fff' : 'var(--text-primary)', 
                    border: '1px solid var(--border-subtle)', 
                    cursor: 'pointer', 
                    fontWeight: filter === f ? 700 : 500,
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Code</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Value</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Min Order</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Usage</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiscounts.map(d => {
                  const status = getStatus(d);
                  const statusColors = { ACTIVE: 'var(--accent-teal)', EXPIRED: '#FF6B4A', SCHEDULED: 'var(--accent-purple)', PAUSED: 'var(--text-secondary)' };
                  const progress = d.max_uses ? Math.min(100, (d.times_used / d.max_uses) * 100) : 0;
                  return (
                    <tr key={d.id} className="admin-table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px', fontFamily: 'monospace', fontWeight: 'bold' }}>{d.code}</td>
                      <td style={{ padding: '16px', textTransform: 'capitalize' }}>{d.type}</td>
                      <td style={{ padding: '16px' }}>{d.type === 'percentage' ? `${d.value}%` : `₦${d.value.toLocaleString()}`}</td>
                      <td style={{ padding: '16px' }}>{d.min_order_amount ? `₦${d.min_order_amount.toLocaleString()}` : '-'}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>{d.times_used} {d.max_uses ? `/ ${d.max_uses}` : 'uses'}</div>
                        {d.max_uses && (
                          <div style={{ height: 6, background: 'var(--bg-void)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'var(--accent-teal)', width: `${progress}%` }} />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: `${statusColors[status]}20`, color: statusColors[status] }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setEditingDiscount(d); setFormData(d); setModalOpen(true); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit size={16} /></button>
                          <button onClick={() => toggleActive(d.id, d.is_active)} style={{ background: 'none', border: 'none', color: d.is_active ? 'var(--accent-teal)' : 'var(--text-secondary)', cursor: 'pointer' }}><CheckCircle2 size={16} /></button>
                          <button onClick={() => deleteDiscount(d.id)} style={{ background: 'none', border: 'none', color: '#FF6B4A', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredDiscounts.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>No discounts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-inner)', width: '100%', maxWidth: 500, borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{editingDiscount ? 'Edit Discount' : 'Create Discount'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><XCircle size={20} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Code</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} />
                  <button onClick={generateCode} style={{ padding: '0 16px', borderRadius: 8, background: 'var(--bg-void)', color: 'var(--accent-purple)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>Generate</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₦)</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Value</label>
                  <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Min Order (₦)</label>
                  <input type="number" value={formData.min_order_amount} onChange={e => setFormData({...formData, min_order_amount: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} placeholder="Optional" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Max Uses</label>
                  <input type="number" value={formData.max_uses} onChange={e => setFormData({...formData, max_uses: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} placeholder="Optional" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Valid From</label>
                  <input type="datetime-local" value={formData.valid_from ? formData.valid_from.substring(0,16) : ''} onChange={e => setFormData({...formData, valid_from: e.target.value ? new Date(e.target.value).toISOString() : null})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Valid Until</label>
                  <input type="datetime-local" value={formData.valid_until ? formData.valid_until.substring(0,16) : ''} onChange={e => setFormData({...formData, valid_until: e.target.value ? new Date(e.target.value).toISOString() : null})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Applies To</label>
                <select value={formData.applies_to} onChange={e => setFormData({...formData, applies_to: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }}>
                  <option value="all">All Products</option>
                  <option value="categories">Specific Categories</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} style={{ width: 18, height: 18, accentColor: 'var(--accent-teal)' }} />
                <label htmlFor="isActive" style={{ cursor: 'pointer' }}>Is Active</label>
              </div>
            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--bg-void)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveDiscount} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent-teal)', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save Discount</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-table-row:hover { background: rgba(255,255,255,0.02); }
        .stat-card:hover { transform: translateY(-2px); transition: transform 0.2s; }
      `}</style>
    </div>
  );
}
