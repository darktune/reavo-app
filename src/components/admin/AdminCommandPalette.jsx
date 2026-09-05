import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, Package, LayoutDashboard, Building2, MessageSquare, X, ShoppingCart, Boxes, Users, ArrowLeftRight, CreditCard, Tag, FileText, BarChart3, Shield, ScrollText, Settings, Plus, Upload, Zap, User } from 'lucide-react';

export default function AdminCommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  const items = [
    { id: 'dashboard', name: 'Dashboard Overview', path: '/admin/dashboard', icon: <LayoutDashboard size={18} />, section: 'Navigate' },
    { id: 'orders', name: 'Manage Orders', path: '/admin/orders', icon: <ShoppingCart size={18} />, section: 'Navigate' },
    { id: 'products', name: 'Manage Products', path: '/admin/products', icon: <Package size={18} />, section: 'Navigate' },
    { id: 'inventory', name: 'Inventory Control', path: '/admin/inventory', icon: <Boxes size={18} />, section: 'Navigate' },
    { id: 'customers', name: 'Customer CRM', path: '/admin/customers', icon: <Users size={18} />, section: 'Navigate' },
    { id: 'trade-ins', name: 'Trade-In Submissions', path: '/admin/trade-ins', icon: <ArrowLeftRight size={18} />, section: 'Navigate' },
    { id: 'payments', name: 'Payments & Transactions', path: '/admin/payments', icon: <CreditCard size={18} />, section: 'Navigate' },
    { id: 'discounts', name: 'Discounts & Promos', path: '/admin/discounts', icon: <Tag size={18} />, section: 'Navigate' },
    { id: 'content', name: 'Content Management', path: '/admin/content', icon: <FileText size={18} />, section: 'Navigate' },
    { id: 'analytics', name: 'Analytics & BI', path: '/admin/analytics', icon: <BarChart3 size={18} />, section: 'Navigate' },
    { id: 'ai', name: 'AI Operations Copilot', path: '/admin/ai', icon: <MessageSquare size={18} />, section: 'Navigate' },
    { id: 'automations', name: 'Automations & Workflows', path: '/admin/automations', icon: <Zap size={18} />, section: 'Navigate' },
    { id: 'partnerships', name: 'Partnership Inquiries', path: '/admin/partnerships', icon: <Building2 size={18} />, section: 'Navigate' },
    { id: 'staff', name: 'Staff & Permissions', path: '/admin/staff', icon: <Shield size={18} />, section: 'Navigate' },
    { id: 'audit', name: 'Audit Logs', path: '/admin/audit-logs', icon: <ScrollText size={18} />, section: 'Navigate' },
    { id: 'settings', name: 'Settings', path: '/admin/settings', icon: <Settings size={18} />, section: 'Navigate' },
    { id: 'profile', name: 'My Staff Profile & Preferences', path: '/admin/profile', icon: <User size={18} />, section: 'Navigate' },
    { id: 'add-product', name: 'Add New Product', path: '/admin/products', icon: <Plus size={18} />, section: 'Quick Actions' },
    { id: 'create-discount', name: 'Create Discount Code', path: '/admin/discounts', icon: <Tag size={18} />, section: 'Quick Actions' },
    { id: 'ask-ai', name: 'Ask AI Copilot', path: '/admin/ai', icon: <Zap size={18} />, section: 'Quick Actions' },
    { id: 'view-analytics', name: 'Generate Sales Report', path: '/admin/analytics', icon: <BarChart3 size={18} />, section: 'Quick Actions' },
  ];

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex].path);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '10vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%', maxWidth: 500, borderRadius: 16, overflow: 'hidden',
          boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)',
          animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <Search size={20} color="var(--text-secondary)" style={{ marginRight: 12 }} />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Search commands, pages, or jump to..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)',
              fontSize: 16, outline: 'none'
            }}
          />
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: 12, maxHeight: 400, overflowY: 'auto' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No results found for "{query}"
            </div>
          ) : (
            (() => {
              let lastSection = '';
              let globalIndex = -1;
              return filteredItems.map((item) => {
                globalIndex++;
                const currentIndex = globalIndex;
                const showSectionHeader = item.section !== lastSection;
                lastSection = item.section;
                return (
                  <div key={item.id}>
                    {showSectionHeader && (
                      <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-secondary)', opacity: 0.6 }}>
                        {item.section}
                      </div>
                    )}
                    <button
                      onClick={() => handleSelect(item.path)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                        background: currentIndex === selectedIndex ? 'var(--border-subtle)' : 'transparent', border: 'none', borderRadius: 8, color: 'var(--text-primary)',
                        cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s'
                      }}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      <div style={{ color: 'var(--text-secondary)' }}>{item.icon}</div>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-secondary)', padding: '2px 6px', background: 'var(--bg-void)', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
                        {item.section === 'Quick Actions' ? 'Action' : 'Jump'}
                      </span>
                    </button>
                  </div>
                );
              });
            })()
          )}
        </div>
        
        <div style={{ padding: '8px 20px', background: 'var(--bg-void)', borderTop: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 16 }}>
          <span><kbd style={{ background: 'var(--border-active)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>↑↓</kbd> to navigate</span>
          <span><kbd style={{ background: 'var(--border-active)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>↵</kbd> to select</span>
          <span><kbd style={{ background: 'var(--border-active)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>esc</kbd> to close</span>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
