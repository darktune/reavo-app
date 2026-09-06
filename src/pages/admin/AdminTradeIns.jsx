import React, { useState, useEffect } from 'react';
import { 
  Search, CheckCircle, XCircle, Clock, 
  Smartphone, AlertCircle, Edit, Image as ImageIcon, MessageCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import ScrollReveal from '../../components/ScrollReveal';
import AdminSkeleton from '../../components/admin/AdminSkeleton';
import StaffTutorialHint from '../../components/admin/StaffTutorialHint';

// --- Mock Data Fallback ---
const MOCK_TRADE_INS = [
  {
    id: 'trd_001',
    device_name: 'iPhone 13 Pro',
    device_brand: 'Apple',
    device_model: 'A2638',
    device_storage: '256GB',
    condition: 'Good',
    condition_notes: 'Small scratch on the back, screen is perfect.',
    images: ['https://via.placeholder.com/150'],
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '08012345678',
    estimated_value: 350000,
    payout_amount: null,
    admin_grade: null,
    admin_notes: '',
    status: 'pending',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trd_002',
    device_name: 'Samsung Galaxy S22',
    device_brand: 'Samsung',
    device_model: 'SM-S901B',
    device_storage: '128GB',
    condition: 'Excellent',
    condition_notes: 'Barely used, comes with original box.',
    images: ['https://via.placeholder.com/150'],
    customer_name: 'Jane Smith',
    customer_email: 'jane@example.com',
    customer_phone: '08123456789',
    estimated_value: 420000,
    payout_amount: 400000,
    admin_grade: 'Excellent',
    admin_notes: 'Confirmed excellent condition.',
    status: 'approved',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trd_003',
    device_name: 'Google Pixel 6',
    device_brand: 'Google',
    device_model: 'GB7N6',
    device_storage: '128GB',
    condition: 'Poor',
    condition_notes: 'Cracked screen and battery drains fast.',
    images: ['https://via.placeholder.com/150'],
    customer_name: 'Mike Johnson',
    customer_email: 'mike@example.com',
    customer_phone: '09011223344',
    estimated_value: 150000,
    payout_amount: 0,
    admin_grade: 'Rejected',
    admin_notes: 'Screen crack too severe, uneconomical to repair.',
    status: 'rejected',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trd_004',
    device_name: 'iPhone 12',
    device_brand: 'Apple',
    device_model: 'A2403',
    device_storage: '64GB',
    condition: 'Fair',
    condition_notes: 'Dents on corners.',
    images: ['https://via.placeholder.com/150'],
    customer_name: 'Sarah Lee',
    customer_email: 'sarah@example.com',
    customer_phone: '08099887766',
    estimated_value: 200000,
    payout_amount: 190000,
    admin_grade: 'Fair',
    admin_notes: 'Dents match description, fully functional.',
    status: 'completed',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export default function AdminTradeIns() {
  const [loading, setLoading] = useState(true);
  const [tradeIns, setTradeIns] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Modal State
  const [selectedTradeIn, setSelectedTradeIn] = useState(null);
  const [reviewGrade, setReviewGrade] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchTradeIns();

    const subscription = supabase
      .channel('trade_ins_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trade_ins' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTradeIns(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTradeIns(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTradeIns(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchTradeIns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trade_ins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet, use mock
          setTradeIns(MOCK_TRADE_INS);
        } else {
          throw error;
        }
      } else {
        setTradeIns(data && data.length > 0 ? data : MOCK_TRADE_INS);
      }
    } catch (err) {
      console.error('Error fetching trade-ins:', err);
      toast.error('Failed to load trade-ins');
      setTradeIns(MOCK_TRADE_INS);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (tradeIn) => {
    setSelectedTradeIn(tradeIn);
    setReviewGrade(tradeIn.admin_grade || tradeIn.condition);
    setPayoutAmount(tradeIn.payout_amount || tradeIn.estimated_value || '');
    setAdminNotes(tradeIn.admin_notes || '');
  };

  const closeReviewModal = () => {
    setSelectedTradeIn(null);
    setReviewGrade('');
    setPayoutAmount('');
    setAdminNotes('');
  };

  const submitReview = async (status) => {
    if (!selectedTradeIn) return;
    
    try {
      setIsSubmitting(true);
      
      const updates = {
        status,
        admin_grade: reviewGrade,
        payout_amount: status === 'rejected' ? 0 : Number(payoutAmount),
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('trade_ins')
        .update(updates)
        .eq('id', selectedTradeIn.id);
        
      if (error && error.code !== '42P01') throw error;
      
      // Update local state if using mock or optimistic
      setTradeIns(prev => prev.map(t => t.id === selectedTradeIn.id ? { ...t, ...updates } : t));
      
      toast.success(`Trade-in ${status === 'approved' ? 'Approved' : 'Rejected'} successfully`);
      closeReviewModal();
    } catch (err) {
      console.error('Error updating trade-in:', err);
      toast.error('Failed to update trade-in status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = (tradeIn) => {
    const rawPhone = (tradeIn.customer_phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('0') ? '234' + rawPhone.slice(1) : rawPhone.startsWith('234') ? rawPhone : '234' + rawPhone;
    const valueStr = tradeIn.payout_amount ? `₦${Number(tradeIn.payout_amount).toLocaleString()}` : `₦${Number(tradeIn.estimated_value || 0).toLocaleString()}`;
    const message = `Hello ${tradeIn.customer_name}, this is REAVO Flagship Trade-In Desk. We have reviewed your appraisal for the ${tradeIn.device_name} (${tradeIn.device_storage || ''}). Your approved valuation credit is ${valueStr}. Would you like to proceed with payout or store credit?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Derived Stats
  const totalSubmissions = tradeIns.length;
  const pendingReview = tradeIns.filter(t => t.status === 'pending').length;
  const approvedValue = tradeIns
    .filter(t => t.status === 'approved' || t.status === 'completed')
    .reduce((sum, t) => sum + (Number(t.payout_amount) || 0), 0);
  
  const completedOrApproved = tradeIns.filter(t => t.status !== 'pending');
  const avgTurnaroundDays = completedOrApproved.length > 0 
    ? completedOrApproved.reduce((sum, t) => sum + differenceInDays(new Date(t.updated_at), new Date(t.created_at)), 0) / completedOrApproved.length
    : 0;

  // Filtering
  const filteredTradeIns = tradeIns.filter(t => {
    const matchesSearch = 
      t.device_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.customer_name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeTab === 'All') return true;
    return t.status.toLowerCase() === activeTab.toLowerCase();
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return { bg: 'rgba(255,184,0,0.1)', color: 'var(--warning, #FFB800)' };
      case 'approved': return { bg: 'rgba(57,217,196,0.1)', color: 'var(--accent-teal, #39D9C4)' };
      case 'rejected': return { bg: 'rgba(255,107,74,0.1)', color: 'var(--error, #FF6B4A)' };
      case 'completed': return { bg: 'rgba(124,92,255,0.1)', color: 'var(--accent-purple, #7C5CFF)' };
      default: return { bg: 'var(--bg-inner)', color: 'var(--text-secondary)' };
    }
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'excellent': return 'var(--accent-teal)';
      case 'good': return '#4DA8DA';
      case 'fair': return '#FFB800';
      case 'poor': return '#FF6B4A';
      default: return 'var(--text-secondary)';
    }
  };

  if (loading) return <AdminSkeleton type="table" rows={6} />;

  return (
    <div className="admin-page" style={{ padding: 24, paddingBottom: 64 }}>
      <ScrollReveal>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 28, margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>Device Trade-Ins & Circular Economy</h1>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: 'rgba(255, 184, 0, 0.15)', color: '#FFB800', border: '1px solid rgba(255, 184, 0, 0.3)' }}>
              REAVO Trade-In Hub — Beta / Rolling Out to Select Campuses
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Review device submissions, inspect uploaded condition photos, and authorize trade-in valuations for campus beta cohorts.</p>
        </div>
      </ScrollReveal>

      <StaffTutorialHint 
        id="tradeins-grading-guide"
        title="📱 Device Grading Guide"
        hint="Inspect customer condition photos, select an Admin Grade (Excellent / Good / Fair / Poor), set the payout value, and click [WhatsApp] to dispatch instant appraisal offers."
      />

      {/* Stats Row */}
      <ScrollReveal delay={100}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 10, borderRadius: 12, background: 'rgba(57,217,196,0.1)' }}>
                <Smartphone size={20} color="var(--accent-teal)" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Total Submissions</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{totalSubmissions}</div>
          </div>

          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,184,0,0.1)' }}>
                <Clock size={20} color="#FFB800" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Pending Review</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{pendingReview}</div>
          </div>

          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 10, borderRadius: 12, background: 'rgba(124,92,255,0.1)' }}>
                <CheckCircle size={20} color="var(--accent-purple)" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Approved Value</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>₦{approvedValue.toLocaleString()}</div>
          </div>

          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,107,74,0.1)' }}>
                <AlertCircle size={20} color="#FF6B4A" />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Avg Turnaround</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{avgTurnaroundDays.toFixed(1)} <span style={{ fontSize: 16, fontWeight: 'normal', color: 'var(--text-secondary)' }}>days</span></div>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Content */}
      <ScrollReveal delay={200}>
        <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: 24, borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, background: 'var(--bg-inner)', padding: 4, borderRadius: 12 }}>
              {['Pending', 'Approved', 'Rejected', 'All'].map(tab => (
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
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search device or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px',
                  borderRadius: 12,
                  background: 'var(--bg-inner)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Device</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Customer</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Condition</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Est. Value</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTradeIns.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No trade-ins found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTradeIns.map((tradeIn) => (
                    <tr key={tradeIn.id} className="admin-table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-inner)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {tradeIn.images && tradeIn.images[0] ? (
                              <img src={tradeIn.images[0]} alt={tradeIn.device_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Smartphone size={20} color="var(--text-secondary)" />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tradeIn.device_name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tradeIn.device_storage} • {tradeIn.device_model}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ color: 'var(--text-primary)' }}>{tradeIn.customer_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tradeIn.customer_email}</div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: 100, 
                          fontSize: 12, 
                          fontWeight: 500,
                          color: getConditionColor(tradeIn.condition),
                          border: `1px solid ${getConditionColor(tradeIn.condition)}40`,
                          background: `${getConditionColor(tradeIn.condition)}10`
                        }}>
                          {tradeIn.condition}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-primary)' }}>
                        ₦{(tradeIn.estimated_value || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: 14 }}>
                        {format(new Date(tradeIn.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: 100, 
                          fontSize: 12, 
                          fontWeight: 500,
                          background: getStatusColor(tradeIn.status).bg,
                          color: getStatusColor(tradeIn.status).color
                        }}>
                          {tradeIn.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button 
                            onClick={() => handleWhatsApp(tradeIn)}
                            style={{ 
                              padding: '6px 10px', borderRadius: 6, background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.3)', color: '#25D366', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                            }}
                            title="Chat with customer on WhatsApp"
                          >
                            <MessageCircle size={14} /> WhatsApp
                          </button>
                          <button
                            onClick={() => handleActionClick(tradeIn)}
                            className="action-btn"
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              background: tradeIn.status === 'pending' ? 'var(--accent-teal)' : 'var(--bg-inner)',
                              color: tradeIn.status === 'pending' ? '#000' : 'var(--text-primary)',
                              border: '1px solid var(--border-subtle)',
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 500
                            }}
                          >
                            {tradeIn.status === 'pending' ? 'Review' : 'View'}
                          </button>
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

      {/* Review Modal */}
      {selectedTradeIn && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto',
            background: 'var(--bg-void)', borderRadius: 16, padding: 0
          }}>
            <div style={{ padding: 24, borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Trade-In Review</h2>
              <button onClick={closeReviewModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Device Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ background: 'var(--bg-inner)', padding: 16, borderRadius: 12 }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Smartphone size={16} /> Device Details
                  </h3>
                  <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedTradeIn.device_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Brand/Model:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{selectedTradeIn.device_brand} {selectedTradeIn.device_model}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Storage:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{selectedTradeIn.device_storage}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>User Condition:</span>
                      <span style={{ color: getConditionColor(selectedTradeIn.condition), fontWeight: 500 }}>{selectedTradeIn.condition}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Est. Value:</span>
                      <span style={{ color: 'var(--accent-teal)', fontWeight: 500 }}>₦{(selectedTradeIn.estimated_value || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-inner)', padding: 16, borderRadius: 12 }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertCircle size={16} /> Customer Notes
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, background: 'var(--bg-void)', padding: 12, borderRadius: 8, minHeight: 80 }}>
                    {selectedTradeIn.condition_notes || "No additional notes provided."}
                  </p>
                </div>
              </div>

              {/* Images */}
              {selectedTradeIn.images && selectedTradeIn.images.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ImageIcon size={16} /> Uploaded Images
                  </h3>
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                    {selectedTradeIn.images.map((img, i) => (
                      <div key={i} style={{ width: 120, height: 120, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-inner)' }}>
                        <img src={img} alt={`Device view ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }} />

              {/* Admin Grading Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Edit size={18} /> Admin Grading
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>Assigned Grade</label>
                    <select
                      value={reviewGrade}
                      onChange={(e) => setReviewGrade(e.target.value)}
                      disabled={selectedTradeIn.status !== 'pending'}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 8,
                        background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)', outline: 'none'
                      }}
                    >
                      <option value="">Select Grade...</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>Final Payout (₦)</label>
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      disabled={selectedTradeIn.status !== 'pending'}
                      placeholder="e.g. 350000"
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 8,
                        background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)', outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>Admin Notes (Internal)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    disabled={selectedTradeIn.status !== 'pending'}
                    placeholder="Add notes about grading decision..."
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)', outline: 'none', resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
            
            {selectedTradeIn.status === 'pending' && (
              <div style={{ padding: 24, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  onClick={() => submitReview('rejected')}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px', borderRadius: 8, border: '1px solid var(--error, #FF6B4A)',
                    background: 'transparent', color: 'var(--error, #FF6B4A)', cursor: 'pointer', fontWeight: 500
                  }}
                >
                  Reject Device
                </button>
                <button
                  onClick={() => submitReview('approved')}
                  disabled={isSubmitting || !reviewGrade || !payoutAmount}
                  className="btn-primary"
                  style={{
                    padding: '10px 20px', borderRadius: 8, border: 'none',
                    background: 'var(--accent-teal)', color: '#000', cursor: 'pointer', fontWeight: 500,
                    opacity: (!reviewGrade || !payoutAmount) ? 0.5 : 1
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Approve & Set Payout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .admin-table-row:hover {
          background: rgba(255,255,255,0.02);
        }
        .action-btn:hover {
          filter: brightness(1.1);
        }
        .stat-card {
          transition: transform 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
