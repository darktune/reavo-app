import React, { useState, useEffect } from 'react';
import { 
  Search, CheckCircle, XCircle, Clock, 
  CreditCard, Activity, RotateCcw, Copy
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ScrollReveal from '../../components/ScrollReveal';
import AdminSkeleton from '../../components/admin/AdminSkeleton';

export default function AdminPayments() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Date Range
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modal State
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchPayments();

    const subscription = supabase
      .channel('payments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPayments(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setPayments(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        } else if (payload.eventType === 'DELETE') {
          setPayments(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          setPayments([]);
        } else {
          throw error;
        }
      } else {
        setPayments(data || []);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (payment, action) => {
    if (action === 'view') {
      setSelectedPayment(payment);
      return;
    } 
    
    if (action === 'refund') {
      if (!window.confirm(`Initiate refund of ₦${Number(payment.amount).toLocaleString()} for ${payment.customer_name}?`)) return;
      try {
        await supabase.from('payments').update({ status: 'refunded', updated_at: new Date().toISOString() }).eq('id', payment.id);
        await supabase.from('audit_logs').insert([{
          actor_name: 'Administrator',
          actor_type: 'admin',
          action: 'INITIATE_PAYMENT_REFUND',
          entity_type: 'Payment',
          entity_id: payment.id,
          entity_name: `Refund ₦${Number(payment.amount).toLocaleString()} (${payment.customer_name})`,
          old_value: { status: payment.status },
          new_value: { status: 'refunded' },
          severity: 'critical'
        }]).catch(() => {});
        
        toast.success(`Refund initiated for ₦${Number(payment.amount).toLocaleString()}`);
        setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'refunded', updated_at: new Date().toISOString() } : p));
        if (selectedPayment?.id === payment.id) {
          setSelectedPayment(prev => ({ ...prev, status: 'refunded', updated_at: new Date().toISOString() }));
        }
      } catch (err) {
        toast.error('Refund failed: ' + err.message);
      }
    } else if (action === 'retry') {
      const retryUrl = `${window.location.origin}/checkout?order_id=${payment.order_id || payment.id}`;
      navigator.clipboard.writeText(retryUrl);
      toast.success('Customer checkout payment retry link copied to clipboard!');
    }
  };

  // Derived Stats
  const successfulPayments = payments.filter(p => p.status === 'successful');
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const failedCount = payments.filter(p => p.status === 'failed').length;
  const successRate = payments.length > 0 
    ? ((successfulPayments.length / payments.length) * 100).toFixed(1) 
    : 0;

  // Filtering
  const filteredPayments = payments.filter(p => {
    const matchesSearch = 
      p.id?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.order_id?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.customer_name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeTab !== 'All' && p.status.toLowerCase() !== activeTab.toLowerCase()) return false;

    if (fromDate && new Date(p.created_at) < new Date(fromDate)) return false;
    if (toDate && new Date(p.created_at) > new Date(toDate + 'T23:59:59')) return false;

    return true;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return { bg: 'rgba(255,184,0,0.1)', color: 'var(--warning, #FFB800)' };
      case 'successful': return { bg: 'rgba(57,217,196,0.1)', color: 'var(--accent-teal, #39D9C4)' };
      case 'failed': return { bg: 'rgba(255,107,74,0.1)', color: 'var(--error, #FF6B4A)' };
      case 'refunded': return { bg: 'rgba(124,92,255,0.1)', color: 'var(--accent-purple, #7C5CFF)' };
      default: return { bg: 'var(--bg-inner)', color: 'var(--text-secondary)' };
    }
  };

  if (loading) return <AdminSkeleton type="table" rows={6} />;

  return (
    <div className="admin-page" style={{ padding: 24, paddingBottom: 64 }}>
      <ScrollReveal>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Payments</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Transaction ledger, gateway reconciliation, and payout tracking.</p>
        </div>
      </ScrollReveal>

      {/* Stats Row */}
      <ScrollReveal delay={100}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 10, borderRadius: 12, background: 'rgba(57,217,196,0.1)' }}>
                <Activity size={20} color="var(--accent-teal)" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Total Revenue</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>₦{totalRevenue.toLocaleString()}</div>
          </div>

          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,184,0,0.1)' }}>
                <Clock size={20} color="#FFB800" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Pending Payments</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{pendingCount}</div>
          </div>

          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,107,74,0.1)' }}>
                <XCircle size={20} color="#FF6B4A" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Failed Payments</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#FF6B4A' }}>{failedCount}</div>
          </div>

          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 10, borderRadius: 12, background: 'rgba(124,92,255,0.1)' }}>
                <CheckCircle size={20} color="var(--accent-purple)" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Success Rate</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{successRate}%</div>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Content */}
      <ScrollReveal delay={200}>
        <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: 24, borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, background: 'var(--bg-inner)', padding: 4, borderRadius: 12, overflowX: 'auto' }}>
              {['All', 'Successful', 'Pending', 'Failed', 'Refunded'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: activeTab === tab ? 'var(--bg-void)' : 'transparent',
                    border: activeTab === tab ? '1px solid var(--border-subtle)' : '1px solid transparent',
                    color: activeTab === tab ? 'var(--accent-teal)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab ? 700 : 500,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', outline: 'none'
                  }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', outline: 'none'
                  }}
                />
              </div>
              <div style={{ position: 'relative', width: 250 }}>
                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px 8px 40px', borderRadius: 8,
                    background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)', outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Transaction ID</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Customer</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Order Ref</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Amount</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Gateway</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No payments found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="admin-table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {payment.id}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ color: 'var(--text-primary)' }}>{payment.customer_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{payment.customer_email}</div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-primary)' }}>
                        {payment.order_id}
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        ₦{(payment.amount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                          <CreditCard size={14} /> {payment.gateway}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: 100, 
                          fontSize: 12, 
                          fontWeight: 500,
                          background: getStatusColor(payment.status).bg,
                          color: getStatusColor(payment.status).color
                        }}>
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: 14 }}>
                        {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleAction(payment, 'view')}
                            className="action-btn"
                            style={{
                              padding: '6px 12px', borderRadius: 6, background: 'var(--bg-inner)',
                              color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', cursor: 'pointer', fontSize: 12
                            }}
                          >
                            Details
                          </button>
                          {payment.status === 'failed' && (
                            <button
                              onClick={() => handleAction(payment, 'retry')}
                              className="action-btn"
                              style={{
                                padding: '6px 12px', borderRadius: 6, background: 'transparent',
                                color: 'var(--warning)', border: '1px solid var(--warning)', cursor: 'pointer', fontSize: 12
                              }}
                            >
                              Retry
                            </button>
                          )}
                          {payment.status === 'successful' && (
                            <button
                              onClick={() => handleAction(payment, 'refund')}
                              className="action-btn"
                              style={{
                                padding: '6px 12px', borderRadius: 6, background: 'transparent',
                                color: 'var(--accent-purple)', border: '1px solid var(--accent-purple)', cursor: 'pointer', fontSize: 12
                              }}
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* Transaction Detail Modal */}
      {selectedPayment && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-void)', borderRadius: 16, padding: 0
          }}>
            <div style={{ padding: 24, borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Transaction Details</h2>
              <button onClick={() => setSelectedPayment(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 8 }}>
                  ₦{(selectedPayment.amount || 0).toLocaleString()}
                </div>
                <span style={{ 
                  padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                  background: getStatusColor(selectedPayment.status).bg,
                  color: getStatusColor(selectedPayment.status).color
                }}>
                  {selectedPayment.status.toUpperCase()}
                </span>
              </div>

              <div style={{ background: 'var(--bg-inner)', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Transaction ID</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{selectedPayment.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Order Reference</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedPayment.order_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Customer</span>
                  <span style={{ color: 'var(--text-primary)', textAlign: 'right' }}>
                    {selectedPayment.customer_name}<br/>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{selectedPayment.customer_email}</span>
                  </span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-inner)', padding: 16, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>Payment Metadata</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Gateway</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedPayment.gateway}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Gateway Ref</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: 12 }}>{selectedPayment.gateway_reference}</span>
                </div>
                {selectedPayment.card_type && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Card</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedPayment.card_type} ending in {selectedPayment.card_last4}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 11, top: 12, bottom: 12, width: 2, background: 'var(--border-subtle)' }} />
                  
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-inner)', border: '2px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-secondary)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>Payment Created</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{format(new Date(selectedPayment.created_at), 'MMM dd, yyyy HH:mm:ss')}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-inner)', border: `2px solid ${getStatusColor(selectedPayment.status).color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(selectedPayment.status).color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>Marked as {selectedPayment.status.toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{format(new Date(selectedPayment.updated_at), 'MMM dd, yyyy HH:mm:ss')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ padding: 24, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              {(selectedPayment.status === 'success' || selectedPayment.status === 'successful') && (
                <button
                  onClick={() => handleAction(selectedPayment, 'refund')}
                  style={{
                    padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255, 107, 74, 0.4)',
                    background: 'rgba(255, 107, 74, 0.1)', color: '#FF6B4A', cursor: 'pointer', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  <RotateCcw size={14} /> Initiate Refund
                </button>
              )}

              {selectedPayment.status === 'failed' && (
                <button
                  onClick={() => handleAction(selectedPayment, 'retry')}
                  style={{
                    padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(57, 217, 196, 0.4)',
                    background: 'rgba(57, 217, 196, 0.1)', color: 'var(--accent-teal)', cursor: 'pointer', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6
                  }}
                >
                  <Copy size={14} /> Copy Payment Retry Link
                </button>
              )}

              <button
                onClick={() => setSelectedPayment(null)}
                className="btn-primary"
                style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: 'var(--bg-inner)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-table-row:hover {
          background: rgba(255,255,255,0.02);
        }
        .action-btn:hover {
          filter: brightness(1.2);
        }
        .stat-card {
          transition: transform 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.5;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
