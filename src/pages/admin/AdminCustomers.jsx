import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { 
  Users, UserPlus, Award, Search, Filter, ChevronRight, X, Phone, Mail, Clock, ShoppingCart, CreditCard, MessageCircle, GraduationCap 
} from 'lucide-react';
import AdminSkeleton from '../../components/admin/AdminSkeleton';
import ScrollReveal from '../../components/ScrollReveal';
import StaffTutorialHint from '../../components/admin/StaffTutorialHint';
import { format, isThisMonth, parseISO } from 'date-fns';

export default function AdminCustomers() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({ total: 0, newThisMonth: 0, avgLtv: 0, returningPct: 0 });
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const [modalOpen, setModalOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [note, setNote] = useState('');

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
    fetchCustomers();
    const channel = supabase.channel('customers_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, payload => {
        fetchCustomers(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [debouncedSearch, filter, page]);

  const fetchCustomers = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      let query = supabase.from('customers').select('*', { count: 'exact' });

      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,institution.ilike.%${debouncedSearch}%`);
      }

      query = query.range(page * pageSize, (page + 1) * pageSize - 1).order('created_at', { ascending: false });

      let { data, count, error } = await query;

      if (error && debouncedSearch) {
        // Fallback search if institution column is still pending migration
        const fallbackQuery = supabase
          .from('customers')
          .select('*', { count: 'exact' })
          .or(`email.ilike.%${debouncedSearch}%`)
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order('created_at', { ascending: false });
        const fallbackRes = await fallbackQuery;
        if (!fallbackRes.error) {
          data = fallbackRes.data;
          error = null;
        }
      }
      
      if (error) {
        console.error(error);
        throw error;
      }

      let safeData = data || [];

      // Filter logic
      if (filter === 'Active') safeData = safeData.filter(c => (c.order_count || 0) > 0 || c.status === 'active');
      if (filter === 'VIP') safeData = safeData.filter(c => (c.total_spent || 0) > 1000000);
      
      setCustomers(safeData);

      // fetch stats (global)
      const { data: allData } = await supabase.from('customers').select('*');
      const allC = allData || [];
      const total = allC.length;
      const newThisMonth = allC.filter(c => {
        try { return isThisMonth(parseISO(c.created_at)); } catch(e) { return false; }
      }).length;
      
      const totalSpendAll = allC.reduce((sum, c) => sum + (c.total_spent || 0), 0);
      const avgLtv = total > 0 ? (totalSpendAll / total) : 0;
      
      const returning = allC.filter(c => (c.order_count || 0) > 1).length;
      const returningPct = total > 0 ? Math.round((returning / total) * 100) : 0;
      
      setStats({
        total,
        newThisMonth,
        avgLtv,
        returningPct
      });

    } catch (err) {
      console.error(err);
      toast.error('Failed to load customers');
      
      // Clean fallback: empty state
      setCustomers([]);
      setStats({ total: 0, newThisMonth: 0, avgLtv: 0, returningPct: 0 });
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const openProfile = async (customer) => {
    setActiveCustomer(customer);
    setNote(customer.admin_notes || '');
    setOrderHistory([]);
    setModalOpen(true);
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', customer.email)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      setOrderHistory(data || []);
    } catch (err) {
      console.error(err);
      // Clean fallback
      setOrderHistory([]);
    }
  };

  const saveNote = async () => {
    if (!activeCustomer) return;
    try {
      const { error } = await supabase
        .from('customers')
        .update({ admin_notes: note })
        .eq('id', activeCustomer.id);
        
      if (error) throw error;
      toast.success('Note saved successfully');
      fetchCustomers(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save note');
    }
  };

  const handleWhatsApp = (customer, template = 'greeting') => {
    const rawPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('0') ? '234' + rawPhone.slice(1) : rawPhone.startsWith('234') ? rawPhone : '234' + rawPhone;
    
    let message = `Hello ${customer.full_name || 'Valued Customer'}, this is REAVO Flagship Client Services. How can we assist your creative setup today?`;
    if (template === 'milestone') {
      const spendFormatted = `₦${Number(customer.total_spent || 0).toLocaleString()}`;
      message = `🎉 Congratulations ${customer.full_name || ''}! You've reached a cumulative milestone of ${spendFormatted} with REAVO. The entire REAVO team thanks you for powering your creative journey with us!`;
    } else if (template === 'vip') {
      message = `Hello ${customer.full_name || ''}, as an esteemed patron of REAVO, we would like to offer you private concierge access to our latest creator drops. Let us know if you need any priority assistance!`;
    }
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  };

  if (loading) return <AdminSkeleton />;

  return (
    <ScrollReveal>
      <div style={{ padding: '32px 0', maxWidth: 1200, margin: '0 auto', color: 'var(--text-primary)' }}>
        
        <header style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, margin: '0 0 8px 0', fontWeight: 700 }}>Customer CRM & Client Services</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 15 }}>Customer profiles, lifetime value metrics, and 1-click WhatsApp concierge outreach.</p>
        </header>

        <StaffTutorialHint 
          id="customers-crm-guide"
          title="💬 Client Relations Guide"
          hint="Click [View Profile] on any customer to inspect full order history and notes. Use [WhatsApp Concierge] or [Send Milestone Congratulations] for instant customer outreach."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(57, 217, 196, 0.1)', padding: 12, borderRadius: 12, color: 'var(--accent-teal)' }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 14 }}>Total Customers</p>
              <h3 style={{ margin: 0, fontSize: 24 }}>{stats.total.toLocaleString()}</h3>
            </div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(124, 92, 255, 0.1)', padding: 12, borderRadius: 12, color: 'var(--accent-purple)' }}>
              <UserPlus size={24} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 14 }}>New This Month</p>
              <h3 style={{ margin: 0, fontSize: 24 }}>{stats.newThisMonth.toLocaleString()}</h3>
            </div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: 12, borderRadius: 12, color: '#FFB800' }}>
              <Award size={24} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 14 }}>Average LTV</p>
              <h3 style={{ margin: 0, fontSize: 24 }}>₦{Math.round(stats.avgLtv).toLocaleString()}</h3>
            </div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(57, 217, 196, 0.1)', padding: 12, borderRadius: 12, color: 'var(--accent-teal)' }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 14 }}>Returning Customers</p>
              <h3 style={{ margin: 0, fontSize: 24 }}>{stats.returningPct}%</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
              <input
                type="text"
                placeholder="Search customers by name or email..."
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
                <Filter style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={16} />
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
                  <option style={{background: '#111'}} value="All">All Customers</option>
                  <option style={{background: '#111'}} value="Active">Active (30d)</option>
                  <option style={{background: '#111'}} value="Inactive">Inactive</option>
                  <option style={{background: '#111'}} value="VIP">VIP (LTV {">"} 1M)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: 14 }}>
                  <th style={{ padding: '16px 8px', fontWeight: 500 }}>Customer</th>
                  <th style={{ padding: '16px 8px', fontWeight: 500 }}>Orders</th>
                  <th style={{ padding: '16px 8px', fontWeight: 500 }}>Total Spent (₦)</th>
                  <th style={{ padding: '16px 8px', fontWeight: 500 }}>Last Order</th>
                  <th style={{ padding: '16px 8px', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '16px 8px', fontWeight: 500 }}>LTV Tier</th>
                  <th style={{ padding: '16px 8px', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <Users size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                      <p>No customers found.</p>
                    </td>
                  </tr>
                ) : (
                  customers.map(customer => {
                    const ltv = customer.total_spent || 0;
                    const tier = ltv > 1000000 ? 'VIP' : (customer.order_count > 1 ? 'Regular' : 'New');
                    const tierColor = tier === 'VIP' ? 'var(--accent-purple)' : tier === 'Regular' ? 'var(--accent-teal)' : '#888';
                    const isActive = customer.status !== 'inactive';

                    return (
                      <tr key={customer.id} className="admin-table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {getInitials(customer.name || customer.full_name)}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{customer.name || customer.full_name || 'Customer'}</p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12 }}>{customer.email}</p>
                            {(customer.institution || customer.school) && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, padding: '2px 7px', borderRadius: 4, background: 'rgba(57, 217, 196, 0.1)', border: '1px solid rgba(57, 217, 196, 0.25)', color: 'var(--accent-teal)', fontSize: 11, fontWeight: 600 }}>
                                <GraduationCap size={11} /> {customer.institution || customer.school}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 8px', color: 'var(--text-secondary)', fontSize: 14 }}>{customer.order_count || 0}</td>
                        <td style={{ padding: '16px 8px', fontWeight: 600, fontSize: 14 }}>{(customer.total_spent || 0).toLocaleString()}</td>
                        <td style={{ padding: '16px 8px', color: 'var(--text-secondary)', fontSize: 14 }}>
                          {customer.last_order_date ? format(new Date(customer.last_order_date), 'MMM dd, yyyy') : 'N/A'}
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? 'var(--accent-teal)' : '#888' }} />
                            {isActive ? 'Active' : 'Inactive'}
                          </div>
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <span style={{ 
                            background: `${tierColor}20`, 
                            color: tierColor, 
                            padding: '4px 8px', 
                            borderRadius: 100, 
                            fontSize: 12, 
                            fontWeight: 600 
                          }}>
                            {tier}
                          </span>
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button 
                              onClick={() => handleWhatsApp(customer, tier === 'VIP' ? 'vip' : 'greeting')}
                              style={{ 
                                padding: '6px 10px', borderRadius: 8, background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.3)', color: '#25D366', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                              }}
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={14} /> WhatsApp
                            </button>
                            <button 
                              className="btn-outline" 
                              onClick={() => openProfile(customer)}
                              style={{ 
                                padding: '6px 12px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 12, fontWeight: 500
                              }}
                            >
                              Profile
                            </button>
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
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>Showing {(page * pageSize) + 1} - {Math.min((page + 1) * pageSize, customers.length + (page * pageSize))} items</p>
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
                disabled={customers.length < pageSize}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: customers.length < pageSize ? 'var(--text-secondary)' : 'var(--text-primary)',
                  cursor: customers.length < pageSize ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {modalOpen && activeCustomer && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 24
          }}>
            <div className="glass-panel" style={{ background: 'var(--bg-inner)', padding: 32, borderRadius: 24, width: '100%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-subtle)', position: 'relative' }}>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ position: 'absolute', top: 24, right: 24, background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
              
              <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--text-primary)', fontSize: 32 }}>
                  {getInitials(activeCustomer.name || activeCustomer.full_name)}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: 24 }}>{activeCustomer.name || activeCustomer.full_name}</h2>
                  {(activeCustomer.institution || activeCustomer.school) && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 6, background: 'rgba(57, 217, 196, 0.12)', border: '1px solid rgba(57, 217, 196, 0.3)', color: 'var(--accent-teal)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                      <GraduationCap size={14} /> {activeCustomer.institution || activeCustomer.school}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={14}/> {activeCustomer.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14}/> {activeCustomer.phone || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleWhatsApp(activeCustomer, 'milestone')}
                      style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(124, 92, 255, 0.15)', border: '1px solid rgba(124, 92, 255, 0.4)', color: 'var(--accent-purple)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      🎉 Send Milestone Congratulations
                    </button>
                    <button 
                      onClick={() => handleWhatsApp(activeCustomer, 'greeting')}
                      style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.3)', color: '#25D366', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      💬 WhatsApp Concierge
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                  <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 12 }}>Join Date</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{activeCustomer.created_at ? format(new Date(activeCustomer.created_at), 'MMM yyyy') : 'N/A'}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                  <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 12 }}>Total Orders</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{activeCustomer.order_count || 0}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                  <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 12 }}>Total Spent</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>₦{(activeCustomer.total_spent || 0).toLocaleString()}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                  <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: 12 }}>AOV</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>₦{activeCustomer.order_count > 0 ? Math.round((activeCustomer.total_spent || 0) / activeCustomer.order_count).toLocaleString() : 0}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingCart size={16}/> Order History
                  </h3>
                  {orderHistory.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No orders found.</p>
                  ) : (
                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                      {orderHistory.map((order, i) => (
                        <div key={order.id} style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < orderHistory.length -1 ? '1px solid var(--border-subtle)' : 'none' }}>
                          <div>
                            <p style={{ margin: '0 0 4px 0', fontWeight: 500, fontSize: 14 }}>{order.id}</p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12 }}>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: 14 }}>₦{(order.total_amount || 0).toLocaleString()}</p>
                            <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 100, background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 16 }}>Notes</h3>
                  <textarea 
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add customer notes here..."
                    style={{
                      width: '100%', height: 120, padding: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: 12, color: 'var(--text-primary)', outline: 'none', resize: 'none', marginBottom: 12
                    }}
                  />
                  <button 
                    onClick={saveNote}
                    className="btn-primary"
                    style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: 'var(--accent-teal)', color: '#000', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Save Note
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
      <style>{`
        .admin-table-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .btn-outline:hover {
          background: rgba(255,255,255,0.05) !important;
          border-color: var(--text-primary) !important;
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
