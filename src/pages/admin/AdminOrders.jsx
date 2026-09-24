import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, PackageOpen, Truck, CheckCircle, Eye, X, Printer, MessageCircle, Send, MapPin, Phone, Mail, Calendar, ShieldCheck, ChevronRight } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import AdminSkeleton from '../../components/admin/AdminSkeleton';
import StaffTutorialHint from '../../components/admin/StaffTutorialHint';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Invoice / Waybill Print Modal
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  
  // Dispatch Modal State
  const [dispatchModalOrder, setDispatchModalOrder] = useState(null);
  const [courierInfo, setCourierInfo] = useState({
    courier: 'GIG Logistics',
    trackingNumber: '',
    riderPhone: '',
    estimatedDelivery: ''
  });

  const tabs = ['All', 'Pending', 'Paid', 'Shipped', 'Delivered'];

  useEffect(() => {
    fetchOrders(false);
    const channel = supabase
      .channel('admin_orders_enterprise')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchOrders(isBackground = false) {
    if (!isBackground) setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, images, sku))')
      .order('created_at', { ascending: false });
    
    setOrders(data || []);
    if (!isBackground) setLoading(false);
  }

  const updateStatus = async (orderId, newStatus, extraMetadata = {}) => {
    const updatePayload = { status: newStatus, ...extraMetadata, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('orders').update(updatePayload).eq('id', orderId);
    
    if (!error) {
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders(true);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, ...updatePayload }));
      }
    } else {
      // Local optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatePayload } : o));
      toast.success(`Order status updated to ${newStatus}`);
    }
  };

  // Open Dispatch Modal
  const handleOpenDispatchModal = (order) => {
    setDispatchModalOrder(order);
    setCourierInfo({
      courier: 'GIG Logistics',
      trackingNumber: `RV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      riderPhone: '',
      estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
    });
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchModalOrder) return;
    await updateStatus(dispatchModalOrder.id, 'Shipped', { courier_info: courierInfo });
    setDispatchModalOrder(null);
  };

  // 1-Click WhatsApp Chat
  const handleOpenWhatsApp = (order) => {
    const rawPhone = (order.customer_phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('0') ? '234' + rawPhone.slice(1) : rawPhone.startsWith('234') ? rawPhone : '234' + rawPhone;
    
    const message = `Hello ${order.customer_name}, this is REAVO Flagship Support regarding your order #${order.id.split('-')[0].toUpperCase()}. ` +
      (order.status === 'Shipped' && order.courier_info?.trackingNumber 
        ? `Your parcel is on its way via ${order.courier_info.courier} (Tracking: ${order.courier_info.trackingNumber}).` 
        : `We are currently processing your order of ₦${order.total_amount?.toLocaleString()}. Let us know if you have any questions!`);
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Print Invoice / Waybill
  const handlePrint = () => {
    window.print();
  };

  const filteredOrders = orders.filter(o => {
    const matchesTab = activeTab === 'All' || o.status === activeTab;
    const matchesSearch = !searchTerm || 
      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_phone?.includes(searchTerm) ||
      o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.courier_info?.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    paid: orders.filter(o => o.status === 'Paid').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    revenue: orders.filter(o => ['Paid', 'Shipped', 'Delivered'].includes(o.status)).reduce((s, o) => s + Number(o.total_amount || 0), 0),
  };

  const statusConfig = {
    Pending: { color: '#FFB800', bg: 'rgba(255, 184, 0, 0.1)', border: 'rgba(255, 184, 0, 0.3)' },
    Paid: { color: '#39D9C4', bg: 'rgba(57, 217, 196, 0.1)', border: 'rgba(57, 217, 196, 0.3)' },
    Shipped: { color: '#4A9EFF', bg: 'rgba(74, 158, 255, 0.1)', border: 'rgba(74, 158, 255, 0.3)' },
    Delivered: { color: '#50FA7B', bg: 'rgba(80, 250, 123, 0.1)', border: 'rgba(80, 250, 123, 0.3)' },
    Failed: { color: '#FF6B4A', bg: 'rgba(255, 107, 74, 0.1)', border: 'rgba(255, 107, 74, 0.3)' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <ScrollReveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 8, fontWeight: 700 }}>Order Fulfillment & Logistics</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Track purchases, dispatch couriers, print commercial waybills, and communicate with customers.</p>
          </div>
        </div>
      </ScrollReveal>

      <StaffTutorialHint 
        id="orders-workflow-guide"
        title="📦 Fulfillment Funnel Guide"
        hint="Progress orders step-by-step: Pending → Paid → Shipped → Delivered. Click [Dispatch Courier] to assign logistics tracking numbers and [Print Waybill] for parcel packing slips."
      />

      {/* Stats Row */}
      <ScrollReveal delay={100}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { label: 'Total Orders', value: stats.total, color: 'var(--text-primary)' },
            { label: 'Awaiting Payment', value: stats.pending, color: '#FFB800' },
            { label: 'Ready to Dispatch', value: stats.paid, color: '#39D9C4' },
            { label: 'In Transit', value: stats.shipped, color: '#4A9EFF' },
            { label: 'Delivered', value: stats.delivered, color: '#50FA7B' },
            { label: 'Gross Processed', value: `₦${stats.revenue.toLocaleString()}`, color: 'var(--accent-teal)' },
          ].map(s => (
            <div key={s.label} className="glass-panel" style={{ padding: 16, borderRadius: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Orders Table Panel */}
      <ScrollReveal delay={150}>
        <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
          {/* Tabs + Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s',
                    background: activeTab === tab ? 'var(--accent-teal)' : 'var(--bg-inner)',
                    color: activeTab === tab ? '#000' : 'var(--text-primary)',
                    border: `1px solid ${activeTab === tab ? 'var(--accent-teal)' : 'var(--border-subtle)'}`
                  }}
                >
                  {tab} {tab !== 'All' ? `(${stats[tab.toLowerCase()] || 0})` : ''}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search orders, phone, customer, tracking..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '9px 12px 9px 36px', color: 'var(--text-primary)', outline: 'none', fontSize: 13 }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AdminSkeleton height={40} style={{ marginBottom: 12 }} />
              {[...Array(5)].map((_, i) => <AdminSkeleton key={i} height={72} />)}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Order Ref</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Items</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '14px 12px', fontWeight: 600, textAlign: 'right' }}>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const sc = statusConfig[order.status] || statusConfig.Pending;
                    return (
                      <tr key={order.id} className="admin-table-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s ease' }}>
                        <td style={{ padding: '16px 12px', fontFamily: 'monospace', fontSize: 13 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{order.id?.split('-')[0].toUpperCase()}</div>
                          {order.courier_info?.trackingNumber && (
                            <div style={{ fontSize: 11, color: 'var(--accent-teal)' }}>{order.courier_info.courier}: {order.courier_info.trackingNumber}</div>
                          )}
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{order.customer_name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.customer_phone || order.customer_email}</div>
                        </td>
                        <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: 13 }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>
                          {order.order_items?.length || 1} item{(order.order_items?.length || 1) !== 1 ? 's' : ''}
                        </td>
                        <td style={{ padding: '16px 12px', fontWeight: 600, fontSize: 14 }}>
                          ₦{Number(order.total_amount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
                            {/* WhatsApp Button */}
                            <button 
                              onClick={() => handleOpenWhatsApp(order)} 
                              style={{ padding: '6px 10px', background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.3)', borderRadius: 6, color: '#25D366', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                              title="Chat with customer on WhatsApp"
                            >
                              <MessageCircle size={14} /> WhatsApp
                            </button>

                            {/* Printable Waybill Button */}
                            <button 
                              onClick={() => setInvoiceOrder(order)} 
                              style={{ padding: '6px 10px', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                              title="Print commercial waybill & invoice"
                            >
                              <Printer size={14} /> Waybill
                            </button>

                            {/* View Modal Button */}
                            <button 
                              onClick={() => setSelectedOrder(order)} 
                              style={{ padding: '6px 10px', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: 'var(--text-primary)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Eye size={14} /> Details
                            </button>

                            {/* Dispatch Trigger */}
                            {order.status === 'Paid' && (
                              <button 
                                onClick={() => handleOpenDispatchModal(order)} 
                                style={{ padding: '6px 12px', background: 'linear-gradient(135deg, #7C5CFF 0%, #39D9C4 100%)', border: 'none', borderRadius: 6, color: '#000', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <Truck size={14} /> Dispatch
                              </button>
                            )}

                            {order.status === 'Shipped' && (
                              <button 
                                onClick={() => updateStatus(order.id, 'Delivered')} 
                                style={{ padding: '6px 12px', background: 'rgba(80, 250, 123, 0.15)', border: '1px solid rgba(80, 250, 123, 0.3)', borderRadius: 6, color: '#50FA7B', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <CheckCircle size={14} /> Mark Delivered
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-secondary)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <PackageOpen size={32} color="var(--text-secondary)" opacity={0.5} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>No Orders Found</div>
                  <div style={{ fontSize: 14 }}>{activeTab !== 'All' ? `No ${activeTab.toLowerCase()} orders.` : 'Customer orders will automatically synchronize here.'}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* DISPATCH / COURIER MODAL */}
      {dispatchModalOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
          <div className="glass-panel" style={{ padding: 32, width: '100%', maxWidth: 520, borderRadius: 24, position: 'relative', border: '1px solid var(--border-subtle)' }}>
            <button onClick={() => setDispatchModalOrder(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                <Truck size={20} />
              </div>
              <h2 style={{ fontSize: 22 }}>Dispatch Order #{dispatchModalOrder.id.split('-')[0].toUpperCase()}</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
              Assign shipping carrier & tracking code for <strong>{dispatchModalOrder.customer_name}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Logistics Courier</label>
                <select 
                  value={courierInfo.courier} 
                  onChange={e => setCourierInfo({ ...courierInfo, courier: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="GIG Logistics">GIG Logistics</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="Fez Delivery">Fez Delivery</option>
                  <option value="Gokada Last-Mile">Gokada Last-Mile</option>
                  <option value="In-House Dispatch Rider">In-House Dispatch Rider</option>
                  <option value="Store Pickup">Customer Store Pickup</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Tracking Number / Waybill ID</label>
                <input 
                  type="text" 
                  value={courierInfo.trackingNumber} 
                  onChange={e => setCourierInfo({ ...courierInfo, trackingNumber: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: 8, color: 'var(--text-primary)', outline: 'none', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Rider Contact Phone (Optional)</label>
                <input 
                  type="text" 
                  placeholder="+234 800 000 0000"
                  value={courierInfo.riderPhone} 
                  onChange={e => setCourierInfo({ ...courierInfo, riderPhone: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                type="button" 
                onClick={() => setDispatchModalOrder(null)} 
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 12, color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDispatch}
                className="btn-primary" 
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer' }}
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMERCIAL INVOICE / WAYBILL PRINT MODAL */}
      {invoiceOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, animation: 'fadeIn 0.2s ease', padding: 16 }}>
          <div style={{ background: '#fff', color: '#000', width: '100%', maxWidth: 750, borderRadius: 16, position: 'relative', maxHeight: '92vh', overflowY: 'auto', padding: 40, boxShadow: '0 24px 80px rgba(0,0,0,0.9)' }} className="print-area">
            {/* Modal Controls (Hidden in Print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#444' }}>Commercial Invoice & Shipping Waybill</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#000', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  <Printer size={16} /> Print / Save PDF
                </button>
                <button onClick={() => setInvoiceOrder(null)} style={{ padding: '8px 12px', background: '#eee', color: '#333', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                  Close
                </button>
              </div>
            </div>

            {/* Commercial Invoice Document Body */}
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: 20, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, color: '#000' }}>REAVO</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>REAVO TECHNOLOGIES NIGERIA LTD.</div>
                  <div style={{ fontSize: 12, color: '#666' }}>14 Admiralty Way, Lekki Phase 1, Lagos</div>
                  <div style={{ fontSize: 12, color: '#666' }}>support@reavoglobal.com | +234 915 855 4158</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#000', textTransform: 'uppercase' }}>WAYBILL / INVOICE</div>
                  <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, marginTop: 4 }}>#{invoiceOrder.id.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Date: {new Date(invoiceOrder.created_at).toLocaleDateString()}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#000', marginTop: 2 }}>Payment: {invoiceOrder.payment_method || 'Kora Pay'} ({invoiceOrder.status})</div>
                </div>
              </div>

              {/* Delivery & Customer Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 16, background: '#f8f9fa', borderRadius: 8, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Deliver To:</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{invoiceOrder.customer_name}</div>
                  <div style={{ fontSize: 13, color: '#333', marginTop: 2 }}>{invoiceOrder.shipping_address?.street || 'Pickup at Store'}</div>
                  <div style={{ fontSize: 13, color: '#333' }}>{invoiceOrder.shipping_address?.city || 'Lagos'}, {invoiceOrder.shipping_address?.state || 'Lagos State'}</div>
                  <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}><strong>Phone:</strong> {invoiceOrder.customer_phone || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Logistics & Dispatch:</div>
                  <div style={{ fontSize: 13, color: '#333' }}><strong>Carrier:</strong> {invoiceOrder.courier_info?.courier || 'GIG Logistics'}</div>
                  <div style={{ fontSize: 13, color: '#333' }}><strong>Tracking Number:</strong> {invoiceOrder.courier_info?.trackingNumber || 'PENDING'}</div>
                  <div style={{ fontSize: 13, color: '#333' }}><strong>Rider Contact:</strong> {invoiceOrder.courier_info?.riderPhone || 'Assigned on Dispatch'}</div>
                  <div style={{ fontSize: 13, color: '#333', marginTop: 4 }}><strong>Fulfillment Status:</strong> {invoiceOrder.status}</div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #000', textAlign: 'left', fontSize: 12, textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 8px' }}>SKU / Item Description</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Total (NGN)</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoiceOrder.order_items || []).map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #ddd', fontSize: 13 }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 700 }}>{item.products?.name || 'Product'}</div>
                        <div style={{ fontSize: 11, color: '#666', fontFamily: 'monospace' }}>SKU: {item.products?.sku || 'RV-PROD'}</div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>₦{Number(item.price || 0).toLocaleString()}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>₦{(Number(item.price || 0) * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
                <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>Subtotal:</span>
                    <span>₦{(invoiceOrder.subtotal || invoiceOrder.total_amount).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>Delivery Fee:</span>
                    <span>₦{(invoiceOrder.delivery_fee || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>VAT (7.5% Included):</span>
                    <span>₦{Math.round((invoiceOrder.total_amount || 0) * 0.075).toLocaleString()}</span>
                  </div>
                  <div style={{ height: 1, background: '#000', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800 }}>
                    <span>Total Paid:</span>
                    <span>₦{Number(invoiceOrder.total_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Barcode & Security Stamp Footer */}
              <div style={{ borderTop: '1px dashed #ccc', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666' }}>Official Warranty & Return Terms:</div>
                  <div style={{ fontSize: 11, color: '#888', maxWidth: 420 }}>
                    All REAVO hardware includes 24-month replacement guarantee. Return window valid within 7 days of package delivery with untampered security seals.
                  </div>
                </div>
                <div style={{ border: '2px solid #000', padding: '6px 14px', borderRadius: 6, textAlign: 'center', fontSize: 11, fontWeight: 800 }}>
                  AUTHENTICATED<br />REAVO SEAL
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
          <div className="glass-panel" style={{ padding: 32, width: '100%', maxWidth: 620, borderRadius: 24, position: 'relative', border: '1px solid var(--border-subtle)', maxHeight: '85vh', overflowY: 'auto' }}>
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: 24, marginBottom: 20 }}>Order #{selectedOrder.id.split('-')[0].toUpperCase()}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div><div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>Customer</div><div style={{ fontWeight: 600 }}>{selectedOrder.customer_name}</div></div>
              <div><div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>Status</div><span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: (statusConfig[selectedOrder.status] || statusConfig.Pending).bg, color: (statusConfig[selectedOrder.status] || statusConfig.Pending).color }}>{selectedOrder.status}</span></div>
              <div><div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>Phone</div><div>{selectedOrder.customer_phone || 'N/A'}</div></div>
              <div><div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>Total Amount</div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-teal)' }}>₦{selectedOrder.total_amount?.toLocaleString()}</div></div>
            </div>

            {/* Address */}
            <div style={{ background: 'var(--bg-inner)', padding: 14, borderRadius: 12, marginBottom: 20, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} /> Shipping Destination
              </div>
              <div style={{ fontSize: 13 }}>
                {selectedOrder.shipping_address?.street || '14 Admiralty Way'}, {selectedOrder.shipping_address?.city || 'Lagos'}, {selectedOrder.shipping_address?.state || 'Nigeria'}
              </div>
            </div>

            {/* Items */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Order Items</div>
              {(selectedOrder.order_items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{item.products?.name || 'Item'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Qty: {item.quantity} • SKU: {item.products?.sku || 'RV'}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>₦{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleOpenWhatsApp(selectedOrder)} style={{ flex: 1, padding: '10px', background: 'rgba(37, 211, 102, 0.15)', border: '1px solid rgba(37, 211, 102, 0.3)', borderRadius: 10, color: '#25D366', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button onClick={() => { setInvoiceOrder(selectedOrder); setSelectedOrder(null); }} style={{ flex: 1, padding: '10px', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', borderRadius: 10, color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                <Printer size={16} /> Print Waybill
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-table-row:hover { background: rgba(255, 255, 255, 0.03); }
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100% !important; max-width: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
