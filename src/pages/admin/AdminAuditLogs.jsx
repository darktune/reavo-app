import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getUnifiedAuditLogs } from '../../lib/auditLogger';
import { Download, Search, Shield, Bot, Settings, Zap, User, Filter, X, ChevronDown } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import ScrollReveal from '../../components/ScrollReveal';
import AdminSkeleton from '../../components/admin/AdminSkeleton';

const ROLES_LIST = ['Owner', 'Admin', 'Manager', 'Developer', 'Support', 'Inventory', 'Analyst'];

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [allRawLogs, setAllRawLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actorFilter, setActorFilter] = useState('All');
  const [individualFilter, setIndividualFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchLogs();
    
    const channel = supabase.channel('audit_logs_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, payload => {
        setAllRawLogs(prev => [payload.new, ...prev]);
        setLogs(prev => [payload.new, ...prev]);
        setTotalCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debouncedSearch, actorFilter, individualFilter, roleFilter, entityFilter, severityFilter, dateFrom, dateTo, page]);

  const fetchLogs = async () => {
    if (page === 1) setLoading(true);
    
    try {
      // 1. Fetch unified logs from Supabase + localStorage
      const unified = await getUnifiedAuditLogs();
      const combined = unified || [];
      setAllRawLogs(combined);

      // 2. Apply multi-dimensional categorization & filter
      const filtered = combined.filter(log => {
        // Text search across action, entity_name, actor_name, entity_type
        if (debouncedSearch && debouncedSearch.trim()) {
          const t = debouncedSearch.toLowerCase().trim();
          const actionMatch = log.action?.toLowerCase().includes(t);
          const entityMatch = log.entity_name?.toLowerCase().includes(t);
          const actorMatch = log.actor_name?.toLowerCase().includes(t);
          const typeMatch = log.entity_type?.toLowerCase().includes(t);
          if (!actionMatch && !entityMatch && !actorMatch && !typeMatch) return false;
        }

        // Actor Type filter
        if (actorFilter !== 'All') {
          if (actorFilter === 'Staff & Admins' && log.actor_type !== 'admin') return false;
          if (actorFilter === 'AI Copilot' && log.actor_type !== 'ai') return false;
          if (actorFilter === 'System Process' && log.actor_type !== 'system') return false;
          if (actorFilter === 'Automations' && log.actor_type !== 'automation') return false;
          if (!['Staff & Admins', 'AI Copilot', 'System Process', 'Automations'].includes(actorFilter) && log.actor_type !== actorFilter.toLowerCase()) return false;
        }

        // Individual Actor filter
        if (individualFilter !== 'All' && log.actor_name !== individualFilter) {
          return false;
        }

        // Role filter
        if (roleFilter !== 'All') {
          const r = roleFilter.toLowerCase();
          const logRole = (log.role || '').toLowerCase();
          const logActor = (log.actor_name || '').toLowerCase();
          if (!logRole.includes(r) && !logActor.includes(r)) return false;
        }

        // Entity filter
        if (entityFilter !== 'All' && log.entity_type?.toLowerCase() !== entityFilter.toLowerCase()) {
          return false;
        }

        // Severity filter
        if (severityFilter !== 'All' && log.severity?.toLowerCase() !== severityFilter.toLowerCase()) {
          return false;
        }

        // Date range
        if (dateFrom && new Date(log.created_at) < new Date(dateFrom)) return false;
        if (dateTo) {
          const td = new Date(dateTo);
          td.setHours(23, 59, 59, 999);
          if (new Date(log.created_at) > td) return false;
        }

        return true;
      });

      const from = 0;
      const to = page * ITEMS_PER_PAGE;
      const paginated = filtered.slice(from, to);

      setLogs(paginated);
      setTotalCount(filtered.length);

    } catch (err) {
      console.warn('Error fetching unified audit logs:', err);
      setLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setActorFilter('All');
    setIndividualFilter('All');
    setRoleFilter('All');
    setEntityFilter('All');
    setSeverityFilter('All');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const uniqueIndividuals = [...new Set(allRawLogs.map(l => l.actor_name).filter(Boolean))];
  const hasActiveFilters = search || actorFilter !== 'All' || individualFilter !== 'All' || roleFilter !== 'All' || entityFilter !== 'All' || severityFilter !== 'All' || dateFrom || dateTo;

  const exportCSV = () => {
    if (!logs.length) {
      toast.error('No logs to export');
      return;
    }
    const headers = ['ID', 'Date', 'Actor Name', 'Actor Type', 'Action', 'Entity Type', 'Entity Name', 'Severity', 'Approved By'];
    const rows = logs.map(l => [
      l.id,
      format(new Date(l.created_at), 'yyyy-MM-dd HH:mm:ss'),
      l.actor_name,
      l.actor_type,
      l.action,
      l.entity_type,
      l.entity_name,
      l.severity,
      l.approved_by || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(item => `"${(item||'').toString().replace(/"/g, '""')}"`).join(','))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit logs exported successfully');
  };

  const getActorIcon = (type) => {
    switch(type) {
      case 'admin': return <User size={14} />;
      case 'ai': return <Bot size={14} />;
      case 'system': return <Settings size={14} />;
      case 'automation': return <Zap size={14} />;
      default: return <Shield size={14} />;
    }
  };

  const getSourceColor = (type) => {
    switch(type) {
      case 'admin': return '#3B82F6'; // blue
      case 'ai': return 'var(--accent-purple)';
      case 'system': return '#6B7280'; // gray
      case 'automation': return 'var(--accent-teal)';
      default: return '#6B7280';
    }
  };

  const getSeverityDot = (sev) => {
    switch(sev) {
      case 'critical': return '#FF6B4A'; // red
      case 'warning': return '#FFB800'; // yellow
      case 'info': default: return '#3B82F6'; // blue
    }
  };

  const renderValueDiff = (oldVal, newVal) => {
    if (!oldVal && !newVal) return null;
    return (
      <div className="diff-container">
        {oldVal && <div className="diff-old">{JSON.stringify(oldVal)}</div>}
        {oldVal && newVal && <div className="diff-arrow">→</div>}
        {newVal && <div className="diff-new">{JSON.stringify(newVal)}</div>}
      </div>
    );
  };

  if (loading && page === 1) return <AdminSkeleton type="table" />;

  return (
    <div className="admin-audit-logs" style={{ padding: 24, maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <ScrollReveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 8, color: 'var(--text-primary)' }}>Audit Logs</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Immutable record of all system mutations.</p>
          </div>
          <button className="btn-primary" onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="glass-panel audit-filter-card" style={{ padding: 16, borderRadius: 16 }}>
          {/* Top Search & Mobile Toggle Row */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-inner)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>
              <Search size={18} color="var(--text-secondary)" style={{ marginRight: 8, flexShrink: 0 }} />
              <input 
                type="text" 
                placeholder="Search action, actor, entity..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: 14 }}
              />
            </div>

            {/* Mobile Filter Toggle Button (<768px) */}
            <button 
              type="button"
              className="mobile-filter-toggle-btn"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              style={{
                display: 'none', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
                background: showMobileFilters || hasActiveFilters ? 'rgba(57, 217, 196, 0.15)' : 'var(--bg-inner)',
                border: showMobileFilters || hasActiveFilters ? '1px solid rgba(57, 217, 196, 0.4)' : '1px solid var(--border-subtle)',
                color: showMobileFilters || hasActiveFilters ? 'var(--accent-teal)' : 'var(--text-primary)',
                fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 40
              }}
            >
              <Filter size={15} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span style={{ background: 'var(--accent-teal)', color: '#000', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                  !
                </span>
              )}
              <ChevronDown size={14} style={{ transform: showMobileFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className={`audit-filter-controls ${showMobileFilters ? 'mobile-open' : ''}`}>
            <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} className="admin-select">
              <option value="All">All Categories</option>
              <option value="Staff & Admins">Staff & Admins</option>
              <option value="AI Copilot">REAVO AI</option>
              <option value="System Process">System Processes</option>
              <option value="Automations">Automations</option>
            </select>

            <select value={individualFilter} onChange={(e) => setIndividualFilter(e.target.value)} className="admin-select">
              <option value="All">All Individuals</option>
              {uniqueIndividuals.map(actor => (
                <option key={actor} value={actor}>{actor}</option>
              ))}
            </select>

            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="admin-select">
              <option value="All">All Roles</option>
              {ROLES_LIST.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            
            <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="admin-select">
              <option value="All">All Entities</option>
              <option value="Staff">Staff</option>
              <option value="Products">Products</option>
              <option value="Orders">Orders</option>
              <option value="Customers">Customers</option>
              <option value="Payments">Payments</option>
              <option value="Inventory">Inventory</option>
              <option value="Discounts">Discounts</option>
              <option value="Settings">Settings</option>
              <option value="Automations">Automations</option>
              <option value="Trade-Ins">Trade-Ins</option>
            </select>

            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="admin-select">
              <option value="All">All Severity</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="admin-date-input" title="From Date" />
              <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>to</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="admin-date-input" title="To Date" />
            </div>

            {hasActiveFilters && (
              <button 
                onClick={handleClearFilters}
                style={{ background: 'rgba(255, 107, 74, 0.1)', border: '1px solid rgba(255, 107, 74, 0.3)', color: '#FF6B4A', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, minHeight: 38 }}
              >
                <X size={14} /> Reset Filters
              </button>
            )}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="glass-panel" style={{ padding: 24, borderRadius: 16 }}>
          <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>No audit logs found matching criteria.</div>
            ) : (
              logs.map((log, index) => (
                <div key={log.id} className="timeline-card" style={{ display: 'flex', gap: 16, position: 'relative' }}>
                  {/* Vertical Line & Dot */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: getSeverityDot(log.severity), zIndex: 2, marginTop: 6 }} />
                    {index < logs.length - 1 && <div style={{ flex: 1, width: 2, backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />}
                  </div>

                  {/* Card Content */}
                  <div style={{ flex: 1, background: 'var(--bg-inner)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: getSourceColor(log.actor_type), fontWeight: 600, fontSize: 14 }}>
                          {getActorIcon(log.actor_type)}
                          {log.actor_name}
                        </div>
                        <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, backgroundColor: getSourceColor(log.actor_type) + '20', color: getSourceColor(log.actor_type), textTransform: 'uppercase' }}>
                          {log.actor_type}
                        </span>
                        {log.role && (
                          <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                            {log.role}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {log.action}
                    </div>
                    
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                      <span style={{ color: 'var(--text-primary)' }}>{log.entity_type}</span>: {log.entity_name}
                    </div>

                    {renderValueDiff(log.old_value, log.new_value)}

                    {log.actor_type === 'ai' && log.approved_by && (
                      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Shield size={12} color="var(--accent-teal)" /> Approved by: {log.approved_by}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {logs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24, gap: 12 }}>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {logs.length} entries shown of {totalCount} total
              </div>
              {logs.length < totalCount && (
                <button 
                  onClick={() => setPage(p => p + 1)}
                  style={{ background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '8px 24px', borderRadius: 8, cursor: 'pointer' }}
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </div>
      </ScrollReveal>

      <style dangerouslySetInnerHTML={{__html: `
        .admin-select {
          background: var(--bg-inner);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 8px 12px;
          border-radius: 8px;
          outline: none;
        }
        .admin-date-input {
          background: var(--bg-inner);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 8px 12px;
          border-radius: 8px;
          outline: none;
          color-scheme: dark;
        }
        .diff-container {
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: monospace;
          font-size: 13px;
          overflow-x: auto;
        }
        .diff-old {
          color: #FF6B4A;
          text-decoration: line-through;
        }
        .diff-arrow {
          color: var(--text-secondary);
        }
        .diff-new {
          color: #39D9C4;
        }
        .timeline-card:hover > div:nth-child(2) {
          border-color: var(--accent-teal);
        }
        .audit-filter-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          margin-top: 14px;
        }
        @media (max-width: 768px) {
          .mobile-filter-toggle-btn {
            display: inline-flex !important;
          }
          .audit-filter-controls {
            display: none;
            flex-direction: column;
            width: 100%;
            gap: 10px;
            margin-top: 14px;
            padding-top: 14px;
            border-top: 1px solid var(--border-subtle);
          }
          .audit-filter-controls.mobile-open {
            display: flex !important;
          }
          .audit-filter-controls select,
          .audit-filter-controls input {
            width: 100% !important;
            min-height: 42px;
            font-size: 14px !important;
          }
          .audit-filter-controls > div {
            width: 100% !important;
          }
        }
      `}} />
    </div>
  );
}
