import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Building2, Search, Mail, Loader2, RefreshCw, Send, DollarSign, Wallet, Lock, Sparkles, TrendingUp, Users, Gift, Share2 } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import AdminSkeleton from '../../components/admin/AdminSkeleton';
import { toast } from 'sonner';

export default function AdminPartnerships() {
  const [activeTab, setActiveTab] = useState('inquiries'); // 'inquiries' | 'payouts' | 'affiliates'
  
  // Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Payouts State
  const [payouts, setPayouts] = useState([]);
  const [loadingPayouts, setLoadingPayouts] = useState(true);
  const [payoutForm, setPayoutForm] = useState({ account_name: '', account_number: '', bank_code: '', amount: '' });
  const [isPaying, setIsPaying] = useState(false);

  // Common: Fetch Inquiries
  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('partnership_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setInquiries(data);
    if (error) console.error('Error fetching inquiries:', error);
    setLoading(false);
  };

  // Common: Fetch Payouts
  const fetchPayouts = async () => {
    setLoadingPayouts(true);
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPayouts(data);
    if (error) console.error('Error fetching payouts:', error);
    setLoadingPayouts(false);
  };

  useEffect(() => {
    fetchInquiries();
    fetchPayouts();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('partnership_inquiries')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      toast.success(`Status updated to ${newStatus}`);
    } else {
      toast.error('Failed to update status');
    }
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setIsPaying(true);
    
    const reference = `reavo_payout_${Date.now()}`;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/korapay/disburse', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ ...payoutForm, reference })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Payout failed to initiate');
      }
      
      toast.success('Payout initiated successfully!');
      setPayoutForm({ account_name: '', account_number: '', bank_code: '', amount: '' });
      fetchPayouts();
    } catch (error) {
      toast.error('Disbursement Error', { description: error.message });
    } finally {
      setIsPaying(false);
    }
  };

  const filteredInquiries = inquiries.filter(inq => 
    inq.organisation?.toLowerCase().includes(search.toLowerCase()) || 
    inq.name?.toLowerCase().includes(search.toLowerCase()) ||
    inq.type?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return { bg: 'rgba(57, 217, 196, 0.1)', color: 'var(--accent-teal)' };
      case 'in progress': return { bg: 'rgba(255, 184, 0, 0.1)', color: '#FFB800' };
      case 'closed': return { bg: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' };
      case 'success': return { bg: 'rgba(52, 168, 83, 0.1)', color: '#34A853' };
      case 'failed': return { bg: 'rgba(234, 67, 53, 0.1)', color: '#EA4335' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <ScrollReveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Building2 size={28} />
              Partnerships & Ambassadors
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage institutional inquiries, ambassador disbursements, and affiliate referral pipelines.</p>
          </div>
          
          <div style={{ display: 'flex', gap: 8, background: 'var(--bg-inner)', padding: 4, borderRadius: 12, border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('inquiries')}
              style={{ 
                padding: '8px 16px', 
                borderRadius: 8, 
                fontWeight: activeTab === 'inquiries' ? 700 : 500,
                fontSize: 13,
                background: activeTab === 'inquiries' ? 'var(--bg-void)' : 'transparent',
                color: activeTab === 'inquiries' ? 'var(--accent-teal)' : 'var(--text-primary)',
                border: activeTab === 'inquiries' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Inquiries ({inquiries.length})
            </button>
            <button 
              onClick={() => setActiveTab('payouts')}
              style={{ 
                padding: '8px 16px', 
                borderRadius: 8, 
                fontWeight: activeTab === 'payouts' ? 700 : 500,
                fontSize: 13,
                background: activeTab === 'payouts' ? 'var(--bg-void)' : 'transparent',
                color: activeTab === 'payouts' ? 'var(--accent-teal)' : 'var(--text-primary)',
                border: activeTab === 'payouts' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Ambassador Payouts
            </button>
            <button 
              onClick={() => setActiveTab('affiliates')}
              style={{ 
                padding: '8px 16px', 
                borderRadius: 8, 
                fontWeight: activeTab === 'affiliates' ? 700 : 500,
                fontSize: 13,
                background: activeTab === 'affiliates' ? 'var(--bg-void)' : 'transparent',
                color: activeTab === 'affiliates' ? 'var(--accent-teal)' : 'var(--text-primary)',
                border: activeTab === 'affiliates' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Lock size={13} opacity={0.7} /> Affiliates & Referrals
              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 100, background: 'rgba(124, 92, 255, 0.2)', color: 'var(--accent-purple)' }}>Roadmap</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* TAB 1: INQUIRIES */}
      {activeTab === 'inquiries' && (
        <ScrollReveal delay={100}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search inquiries..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '10px 16px 10px 40px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-inner)', color: 'var(--text-primary)', outline: 'none', width: 260 }}
              />
            </div>
            <button onClick={fetchInquiries} className="btn-ghost" style={{ padding: '10px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Refresh">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
            {loading && inquiries.length === 0 ? (
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AdminSkeleton height={40} style={{ marginBottom: 12 }} />
                {[...Array(4)].map((_, i) => (
                  <AdminSkeleton key={i} height={80} />
                ))}
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Building2 size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <p>No partnership inquiries found.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13 }}>ORGANISATION</th>
                      <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13 }}>CONTACT</th>
                      <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13 }}>INTEREST</th>
                      <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13 }}>DATE</th>
                      <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13 }}>STATUS</th>
                      <th style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13, textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map(inq => (
                      <tr key={inq.id} className="admin-table-row" style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ fontWeight: 600 }}>{inq.organisation}</div>
                          {inq.message && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{inq.message}"</div>}
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ fontWeight: 500 }}>{inq.name}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Mail size={12} /> {inq.email}
                          </div>
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ display: 'inline-block', padding: '4px 10px', background: 'var(--bg-inner)', borderRadius: 100, fontSize: 12, border: '1px solid var(--border-subtle)' }}>
                            {inq.type}
                          </div>
                        </td>
                        <td style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: 14 }}>
                          {new Date(inq.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <span style={{ 
                            padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                            background: getStatusColor(inq.status).bg, color: getStatusColor(inq.status).color,
                            border: `1px solid ${getStatusColor(inq.status).color.replace(')', ', 0.3)').replace('var(--accent-teal)', 'rgba(57, 217, 196, 0.3)').replace('#FFB800', 'rgba(255, 184, 0, 0.3)').replace('var(--text-secondary)', 'rgba(255,255,255,0.2)')}`
                          }}>
                            {inq.status}
                          </span>
                        </td>
                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                          <select 
                            value={inq.status}
                            onChange={(e) => updateStatus(inq.id, e.target.value)}
                            style={{ padding: '6px 12px', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', fontSize: 13 }}
                          >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ScrollReveal>
      )}

      {/* TAB 2: PAYOUTS */}
      {activeTab === 'payouts' && (
        <ScrollReveal delay={100}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
            {/* Payout Form */}
            <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
              <h2 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={20} className="text-accent-purple" />
                Initiate Payout
              </h2>
              <form onSubmit={handlePayoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Recipient Name</label>
                  <input 
                    type="text" required
                    value={payoutForm.account_name}
                    onChange={e => setPayoutForm({...payoutForm, account_name: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-inner)', color: 'var(--text-primary)' }}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Account Number</label>
                  <input 
                    type="text" required
                    value={payoutForm.account_number}
                    onChange={e => setPayoutForm({...payoutForm, account_number: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-inner)', color: 'var(--text-primary)' }}
                    placeholder="10-digit number"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Bank Code (3 digits)</label>
                  <input 
                    type="text" required
                    value={payoutForm.bank_code}
                    onChange={e => setPayoutForm({...payoutForm, bank_code: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-inner)', color: 'var(--text-primary)' }}
                    placeholder="e.g. 058 (GTBank)"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Amount (₦)</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="number" required min="100"
                      value={payoutForm.amount}
                      onChange={e => setPayoutForm({...payoutForm, amount: e.target.value})}
                      style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-inner)', color: 'var(--text-primary)' }}
                      placeholder="Amount to send"
                    />
                  </div>
                </div>
                <button type="submit" disabled={isPaying} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                  {isPaying ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {isPaying ? 'Processing...' : 'Send Funds'}
                </button>
              </form>
            </div>

            {/* Payouts Table */}
            <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>Recent Payouts</h2>
                <button onClick={fetchPayouts} className="btn-ghost" style={{ padding: 6, borderRadius: 8 }}>
                  <RefreshCw size={16} className={loadingPayouts ? "animate-spin" : ""} />
                </button>
              </div>
              
              {loadingPayouts && payouts.length === 0 ? (
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <AdminSkeleton height={40} style={{ marginBottom: 12 }} />
                  {[...Array(3)].map((_, i) => (
                    <AdminSkeleton key={i} height={60} />
                  ))}
                </div>
              ) : payouts.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p>No payouts recorded yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '12px 24px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13 }}>RECIPIENT</th>
                        <th style={{ padding: '12px 24px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13 }}>AMOUNT</th>
                        <th style={{ padding: '12px 24px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13 }}>STATUS</th>
                        <th style={{ padding: '12px 24px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13 }}>DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map(payout => (
                        <tr key={payout.id} className="admin-table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ fontWeight: 500 }}>{payout.recipient_name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                              {payout.bank_code} • {payout.account_number}
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                            ₦{Number(payout.amount).toLocaleString()}
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{ 
                              padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                              background: getStatusColor(payout.status).bg, color: getStatusColor(payout.status).color
                            }}>
                              {payout.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: 13 }}>
                            {new Date(payout.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* TAB 3: AFFILIATES & REFERRALS (GREYED OUT FOR FUTURE ROADMAP) */}
      {activeTab === 'affiliates' && (
        <ScrollReveal delay={100}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20 }}>
            {/* Lock Roadmap Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(5, 5, 5, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              textAlign: 'center'
            }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(124, 92, 255, 0.2)', border: '1px solid rgba(124, 92, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--accent-purple)' }}>
                <Lock size={26} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Ambassador Affiliate & Referral Engine</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 520, fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
                Unique creator promo links, automated 5% commission calculation, and 1-click batch disbursement are architected and queued for the Enterprise v2.2 rollout.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, color: 'var(--text-secondary)' }}>
                <Sparkles size={14} color="var(--accent-teal)" /> Planned for Q3 Release
              </div>
            </div>

            {/* Greyed-out Inactive Mock UI */}
            <div style={{ opacity: 0.3, pointerEvents: 'none', filter: 'grayscale(0.6)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="glass-panel" style={{ padding: 18, borderRadius: 14 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Active Ambassadors</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>24 Creators</div>
                </div>
                <div className="glass-panel" style={{ padding: 18, borderRadius: 14 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Referred Revenue</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-teal)' }}>₦8,450,000</div>
                </div>
                <div className="glass-panel" style={{ padding: 18, borderRadius: 14 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Commissions Accrued (5%)</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#FFB800' }}>₦422,500</div>
                </div>
              </div>

              {/* Table */}
              <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>Ambassador Affiliate Ledger</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { name: 'Chioma Ndubisi', handle: '@chioma.creates', code: 'REAVO-CHIOMA10', sales: '₦3,200,000', comm: '₦160,000', status: 'Pending Payout' },
                    { name: 'Tunde Bakare', handle: '@tundegaming', code: 'REAVO-TUNDE5', sales: '₦2,450,000', comm: '₦122,500', status: 'Paid' },
                    { name: 'Efe Studio', handle: '@efevisuals', code: 'REAVO-EFE10', sales: '₦1,800,000', comm: '₦90,000', status: 'Pending Payout' }
                  ].map((amb, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'var(--bg-inner)', borderRadius: 10 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{amb.name} <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>({amb.handle})</span></div>
                        <div style={{ fontSize: 12, color: 'var(--accent-teal)', fontFamily: 'monospace' }}>Code: {amb.code}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>Sales: {amb.sales}</div>
                        <div style={{ fontSize: 12, color: '#FFB800' }}>Commission: {amb.comm}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      <style>{`
        .admin-table-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        select:focus {
          border-color: var(--accent-teal) !important;
          box-shadow: 0 0 0 2px rgba(57, 217, 196, 0.1);
        }
        @media (max-width: 900px) {
          .glass-panel[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
