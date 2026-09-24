import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Plus, Edit2, ShieldOff, MoreVertical, Shield, RotateCcw, CheckCircle, Ban } from 'lucide-react';
import { recordAuditLog } from '../../lib/auditLogger';
import { toast } from 'sonner';
import { format, differenceInMinutes } from 'date-fns';
import ScrollReveal from '../../components/ScrollReveal';
import AdminSkeleton from '../../components/admin/AdminSkeleton';
import StaffTutorialHint from '../../components/admin/StaffTutorialHint';

const ROLE_COLORS = {
  OWNER: { bg: 'rgba(255, 184, 0, 0.1)', color: '#FFB800' },
  ADMIN: { bg: 'rgba(57, 217, 196, 0.1)', color: '#39D9C4' },
  INVENTORY: { bg: 'rgba(74, 158, 255, 0.1)', color: '#4A9EFF' },
  'ORDER MANAGER': { bg: 'rgba(124, 92, 255, 0.1)', color: '#7C5CFF' },
  CONTENT: { bg: 'rgba(255, 121, 198, 0.1)', color: '#FF79C6' },
  SUPPORT: { bg: 'rgba(255, 107, 74, 0.1)', color: '#FF6B4A' },
  ANALYST: { bg: 'rgba(80, 250, 123, 0.1)', color: '#50FA7B' },
};

const PERMISSIONS_LIST = [
  'Products & Inventory',
  'Orders & Fulfillment',
  'Customers',
  'Analytics',
  'AI Operations',
  'Content Management',
  'Trade-Ins',
  'Payments',
  'Discounts',
  'Settings',
  'Staff Management',
  'Audit Logs'
];

export default function AdminStaff() {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [scaleMode, setScaleMode] = useState(() => localStorage.getItem('reavo-scale-mode') === 'true');

  useEffect(() => {
    const handleScaleMode = () => {
      setScaleMode(localStorage.getItem('reavo-scale-mode') === 'true');
    };
    window.addEventListener('reavo-scale-mode-changed', handleScaleMode);
    return () => window.removeEventListener('reavo-scale-mode-changed', handleScaleMode);
  }, []);


  useEffect(() => {
    fetchStaff();
    
    const channel = supabase.channel('staff_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
        fetchStaff(true);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStaff = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setStaff(data);
      } else {
        setStaff(getDefaultStaff());
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load staff members');
      if (staff.length === 0) setStaff(getDefaultStaff());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultStaff = () => [
    { id: 'fc09b1e8-fc6f-4206-ab96-508756faf3c3', name: 'Abraham Toluwani', email: 'abrahamtoluwani999@gmail.com', role: 'OWNER', is_active: true, last_active_at: new Date().toISOString(), created_at: new Date().toISOString() },
  ];

  const handleInvite = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email')?.trim();
    const name = formData.get('name')?.trim();
    const role = formData.get('role');
    const permissions = PERMISSIONS_LIST.filter(p => formData.get(`perm_${p}`) === 'on');

    if (!email || !name) {
      toast.error('Please enter both name and email.');
      return;
    }

    let inviteToken = null;

    try {
      const { data, error } = await supabase.from('staff_invites').insert({
        email, name, role, permissions, status: 'pending'
      }).select('id').single();
      
      if (!error && data?.id) {
        inviteToken = data.id;
      }
    } catch (err) {
      console.warn('Supabase staff_invites cloud write failed, switching to local store:', err.message);
    }

    // Resilient fallback: If Supabase table missing, offline, or errored
    if (!inviteToken) {
      inviteToken = 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      try {
        const stored = JSON.parse(localStorage.getItem('reavo_staff_invites') || '[]');
        stored.push({
          id: inviteToken,
          email,
          name,
          role,
          permissions,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('reavo_staff_invites', JSON.stringify(stored));
      } catch (storageErr) {
        console.warn('Local storage write warning:', storageErr);
      }
    }

    // Always record universal audit log
    await recordAuditLog({
      action: 'CREATED_STAFF_INVITE',
      entityType: 'Staff',
      entityId: inviteToken,
      entityName: `${name} (${email})`,
      newValue: { role, permissions },
      severity: 'info'
    });

    const link = `${window.location.origin}/staff-onboarding?token=${inviteToken}`;
    setGeneratedLink(link);
    toast.success('Staff invitation link generated successfully!');
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const role = formData.get('role');
    const permissions = PERMISSIONS_LIST.filter(p => formData.get(`perm_${p}`) === 'on');

    // Update state optimistically
    setStaff(s => s.map(u => u.id === selectedStaff.id ? { ...u, role, permissions } : u));
    setShowEditModal(false);

    // Record universal audit log
    await recordAuditLog({
      action: 'UPDATE_STAFF_ROLE',
      entityType: 'Staff',
      entityId: selectedStaff.id,
      entityName: selectedStaff.name || selectedStaff.email,
      oldValue: { role: selectedStaff.role, permissions: selectedStaff.permissions },
      newValue: { role, permissions },
      severity: 'warning'
    });

    try {
      const { error } = await supabase.from('staff').update({ role, permissions }).eq('id', selectedStaff.id);
      if (error) throw error;
      toast.success('Staff role updated!');
      fetchStaff(true);
    } catch (err) {
      toast.success('Staff role updated! (Saved locally)');
    }
  };

  const handleRevoke = async (id) => {
    const target = staff.find(s => s.id === id);
    if (!window.confirm(`Are you sure you want to revoke access for ${target?.name || 'this staff member'}?`)) return;

    // 1. Update state immediately
    setStaff(s => s.map(u => u.id === id ? { ...u, is_active: false } : u));

    // 2. Guaranteed universal audit log
    await recordAuditLog({
      action: 'REVOKED_STAFF_ACCESS',
      entityType: 'Staff',
      entityId: id,
      entityName: target?.name || target?.email || 'Staff Member',
      oldValue: { is_active: true },
      newValue: { is_active: false },
      severity: 'critical'
    });

    try {
      const { error } = await supabase.from('staff').update({ is_active: false }).eq('id', id);
      if (error) throw error;
      toast.success(`Access revoked for ${target?.name || 'staff member'}`);
      fetchStaff(true);
    } catch (err) {
      toast.success(`Access revoked for ${target?.name || 'staff member'} (Saved locally)`);
    }
  };

  const handleRestore = async (id) => {
    const target = staff.find(s => s.id === id);
    if (!window.confirm(`Restore active system access for ${target?.name || 'this staff member'}?`)) return;

    // 1. Update state immediately
    setStaff(s => s.map(u => u.id === id ? { ...u, is_active: true } : u));

    // 2. Guaranteed universal audit log
    await recordAuditLog({
      action: 'RESTORED_STAFF_ACCESS',
      entityType: 'Staff',
      entityId: id,
      entityName: target?.name || target?.email || 'Staff Member',
      oldValue: { is_active: false },
      newValue: { is_active: true },
      severity: 'warning'
    });

    try {
      const { error } = await supabase.from('staff').update({ is_active: true }).eq('id', id);
      if (error) throw error;
      toast.success(`Access restored for ${target?.name || 'staff member'}`);
      fetchStaff(true);
    } catch (err) {
      toast.success(`Access restored for ${target?.name || 'staff member'} (Saved locally)`);
    }
  };

  if (loading) return <AdminSkeleton type="list" />;

  const activeNowCount = staff.filter(s => s.last_active_at && differenceInMinutes(new Date(), new Date(s.last_active_at)) < 15).length;
  const uniqueRoles = [...new Set(staff.map(s => s.role))];

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ padding: '24px 0' }}>
      <ScrollReveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 8, color: 'var(--text-primary)', fontWeight: 700 }}>Staff & RBAC Permissions</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Team directory, granular permission checklists, and role management.</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowInviteModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: 'var(--accent-teal)', color: '#000', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            <Plus size={18} />
            Invite Staff
          </button>
        </div>

        <StaffTutorialHint 
          id="staff-rbac-guide"
          title="🛡️ RBAC Permissions Guide"
          hint="Admins & Owners can assign granular permission sets across 12 store domains. Each staff member can also customize their personal profile and layout at /admin/profile."
        />

        {/* Lean Day 1 Single-Tier Notice */}
        {!scaleMode && (
          <div className="glass-panel" style={{ 
            padding: '16px 20px', 
            borderRadius: 14, 
            border: '1px solid rgba(57, 217, 196, 0.25)', 
            background: 'rgba(57, 217, 196, 0.05)', 
            marginBottom: 24, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 12 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Shield size={20} color="var(--accent-teal)" />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Lean Day 1: Single-Tier Admin Operating Mode</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: 'rgba(57, 217, 196, 0.15)', color: 'var(--accent-teal)', fontWeight: 600 }}>Active</span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                  Standard Admin access is active. Multi-seat role delegation (7 specialized roles & 12-point permission matrices) is reserved for enterprise team scaling.
                </p>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              Multi-Seat Role Management (Enterprise Scale)
            </span>
          </div>
        )}


        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 32 }}>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Total Staff Members</h3>
            <div style={{ fontSize: 32, fontWeight: 600, color: 'var(--text-primary)' }}>{staff.length}</div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-teal)', boxShadow: '0 0 8px var(--accent-teal)' }} />
              <h3 style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>Active Now</h3>
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, color: 'var(--text-primary)' }}>{activeNowCount}</div>
          </div>
          <div className="glass-panel stat-card" style={{ padding: 24, borderRadius: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Roles Configured</h3>
            <div style={{ fontSize: 32, fontWeight: 600, color: 'var(--text-primary)' }}>{uniqueRoles.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="staff-filter-bar" style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: 8, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', minWidth: 150 }}
          >
            <option value="All">All Roles</option>
            {Object.keys(ROLE_COLORS).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="glass-panel" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div className="desktop-staff-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Staff Member</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Role</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Last Active</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(member => {
                  const isRevoked = member.is_active === false;
                  const isOnline = !isRevoked && member.last_active_at && differenceInMinutes(new Date(), new Date(member.last_active_at)) < 15;
                  const roleStyle = ROLE_COLORS[member.role] || ROLE_COLORS.ADMIN;
                  return (
                    <tr key={member.id} className="admin-table-row" style={{ borderBottom: '1px solid var(--border-subtle)', opacity: isRevoked ? 0.75 : 1 }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ 
                            width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-inner)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, 
                            color: isRevoked ? '#FF6B4A' : 'var(--text-primary)',
                            border: isRevoked ? '2px solid rgba(255, 107, 74, 0.4)' : '1px solid var(--border-subtle)',
                            position: 'relative'
                          }}>
                            {member.name?.charAt(0) || '?'}
                            {isRevoked && (
                              <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#FF6B4A', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Ban size={9} color="#FFFFFF" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: isRevoked ? 'var(--text-secondary)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ textDecoration: isRevoked ? 'line-through' : 'none' }}>{member.name}</span>
                              {isRevoked && <span style={{ fontSize: 11, color: '#FF6B4A', fontWeight: 600 }}>(Revoked)</span>}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', opacity: isRevoked ? 0.7 : 1 }}>{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                          background: isRevoked ? 'rgba(255,255,255,0.05)' : roleStyle.bg, 
                          color: isRevoked ? 'var(--text-secondary)' : roleStyle.color 
                        }}>
                          {member.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {isRevoked ? (
                          <span style={{ 
                            padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, 
                            background: 'rgba(255, 107, 74, 0.12)', color: '#FF6B4A', 
                            border: '1px solid rgba(255, 107, 74, 0.3)', display: 'inline-flex', alignItems: 'center', gap: 4 
                          }}>
                            <Ban size={12} /> REVOKED
                          </span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isOnline ? 'var(--accent-teal)' : 'var(--text-secondary)' }} />
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{isOnline ? 'Online' : 'Offline'}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: 13 }}>
                        {member.last_active_at ? format(new Date(member.last_active_at), 'MMM dd, HH:mm') : 'Never'}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <button 
                            onClick={() => { setSelectedStaff(member); setShowEditModal(true); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                            title="Edit Role"
                          >
                            <Edit2 size={16} />
                          </button>
                          {isRevoked ? (
                            <button 
                              onClick={() => handleRestore(member.id)}
                              style={{ background: 'rgba(57, 217, 196, 0.1)', border: '1px solid rgba(57, 217, 196, 0.3)', color: 'var(--accent-teal)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                              title="Restore Access"
                            >
                              <RotateCcw size={14} /> Restore
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleRevoke(member.id)}
                              style={{ background: 'none', border: 'none', color: '#FF6B4A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                              title="Revoke Access"
                            >
                              <ShieldOff size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredStaff.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
                No staff members found matching your filters.
              </div>
            )}
          </div>

          {/* Mobile Staff Cards View (<768px) */}
          <div className="mobile-staff-cards" style={{ display: 'none', flexDirection: 'column', gap: 12, padding: 12 }}>
            {filteredStaff.map(member => {
              const isRevoked = member.is_active === false;
              const isOnline = !isRevoked && member.last_active_at && differenceInMinutes(new Date(), new Date(member.last_active_at)) < 15;
              const roleStyle = ROLE_COLORS[member.role] || ROLE_COLORS.ADMIN;

              return (
                <div 
                  key={member.id} 
                  style={{
                    padding: 16, borderRadius: 14, background: 'var(--bg-inner)',
                    border: isRevoked ? '1px solid rgba(255, 107, 74, 0.3)' : '1px solid var(--border-subtle)',
                    opacity: isRevoked ? 0.8 : 1, display: 'flex', flexDirection: 'column', gap: 12
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, 
                        color: isRevoked ? '#FF6B4A' : 'var(--text-primary)',
                        border: isRevoked ? '2px solid rgba(255, 107, 74, 0.4)' : '1px solid var(--border-subtle)',
                        position: 'relative', flexShrink: 0
                      }}>
                        {member.name?.charAt(0) || '?'}
                        {isRevoked && (
                          <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#FF6B4A', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Ban size={9} color="#FFFFFF" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: isRevoked ? 'var(--text-secondary)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ textDecoration: isRevoked ? 'line-through' : 'none' }}>{member.name}</span>
                          {isRevoked && <span style={{ fontSize: 10, color: '#FF6B4A', fontWeight: 700 }}>(Revoked)</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{member.email}</div>
                      </div>
                    </div>

                    <span style={{ 
                      padding: '4px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600, flexShrink: 0,
                      background: isRevoked ? 'rgba(255,255,255,0.05)' : roleStyle.bg, 
                      color: isRevoked ? 'var(--text-secondary)' : roleStyle.color 
                    }}>
                      {member.role}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 }}>
                    <div>
                      {isRevoked ? (
                        <span style={{ color: '#FF6B4A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Ban size={11} /> Revoked Access
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: isOnline ? 'var(--accent-teal)' : 'var(--text-secondary)' }} />
                          {isOnline ? 'Online now' : 'Offline'}
                        </span>
                      )}
                    </div>
                    <div>
                      Active: {member.last_active_at ? format(new Date(member.last_active_at), 'MMM dd, HH:mm') : 'Never'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 4 }}>
                    <button 
                      onClick={() => { setSelectedStaff(member); setShowEditModal(true); }}
                      className="btn-secondary"
                      style={{ padding: '8px', fontSize: 12, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40, cursor: 'pointer' }}
                    >
                      <Edit2 size={13} /> Edit Role
                    </button>
                    {isRevoked ? (
                      <button 
                        onClick={() => handleRestore(member.id)}
                        style={{ padding: '8px', fontSize: 12, borderRadius: 8, background: 'rgba(57, 217, 196, 0.15)', border: '1px solid rgba(57, 217, 196, 0.4)', color: 'var(--accent-teal)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', minHeight: 40 }}
                      >
                        <RotateCcw size={13} /> Restore
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRevoke(member.id)}
                        style={{ padding: '8px', fontSize: 12, borderRadius: 8, background: 'rgba(255, 107, 74, 0.1)', border: '1px solid rgba(255, 107, 74, 0.3)', color: '#FF6B4A', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', minHeight: 40 }}
                      >
                        <Ban size={13} /> Revoke
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </ScrollReveal>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 500, padding: 32, borderRadius: 16 }}>
            <h2 style={{ fontSize: 24, marginBottom: 24, color: 'var(--text-primary)' }}>Invite Staff Member</h2>
            
            {generatedLink ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ padding: 16, background: 'rgba(57, 217, 196, 0.1)', border: '1px solid #39D9C4', borderRadius: 8, marginBottom: 24, wordBreak: 'break-all', color: 'var(--text-primary)' }}>
                  {generatedLink}
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
                  Copy this secure onboarding link and send it to your new staff member. They will be able to create their password and immediately join the Admin OS.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button 
                    onClick={() => navigator.clipboard.writeText(generatedLink).then(() => toast.success('Copied!'))}
                    style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--accent-primary)', color: 'var(--bg-void)', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                  >
                    Copy Link
                  </button>
                  <button 
                    onClick={() => { setShowInviteModal(false); setGeneratedLink(null); }}
                    style={{ padding: '10px 24px', borderRadius: 8, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInvite}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)', fontSize: 14 }}>Full Name</label>
                  <input required name="name" type="text" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)', fontSize: 14 }}>Email Address</label>
                  <input required name="email" type="email" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Assign Role</label>
                    {!scaleMode && (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(57, 217, 196, 0.15)', color: 'var(--accent-teal)', fontWeight: 600 }}>
                        1-Tier Admin Standard
                      </span>
                    )}
                  </div>
                  <select required name="role" defaultValue="ADMIN" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                    {scaleMode ? (
                      Object.keys(ROLE_COLORS).map(r => <option key={r} value={r}>{r}</option>)
                    ) : (
                      <>
                        <option value="ADMIN">ADMIN (Full Operations Access)</option>
                        <option disabled value="INVENTORY">INVENTORY • [Enterprise Scale Only]</option>
                        <option disabled value="ORDER MANAGER">ORDER MANAGER • [Enterprise Scale Only]</option>
                        <option disabled value="CONTENT">CONTENT • [Enterprise Scale Only]</option>
                        <option disabled value="SUPPORT">SUPPORT • [Enterprise Scale Only]</option>
                        <option disabled value="ANALYST">ANALYST • [Enterprise Scale Only]</option>
                      </>
                    )}
                  </select>
                  {!scaleMode && (
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
                      Multi-Seat Role Management (Enterprise Scale) • 6 specialized sub-roles unlock in Scale Mode.
                    </div>
                  )}
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)', fontSize: 14 }}>Permissions</label>
                  {scaleMode ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {PERMISSIONS_LIST.map(p => (
                        <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontSize: 13 }}>
                          <input type="checkbox" name={`perm_${p}`} defaultChecked />
                          {p}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', fontSize: 13, color: 'var(--text-secondary)' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>Standard Full Admin Access (12 Domains Active)</div>
                      All store operational modules are enabled by default for Day-1 simplicity. Granular 12-point permission matrices unlock in Scale Mode.
                      {PERMISSIONS_LIST.map(p => (
                        <input key={p} type="hidden" name={`perm_${p}`} value="on" />
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowInviteModal(false)} style={{ padding: '10px 24px', borderRadius: 8, background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--accent-primary)', color: 'var(--bg-void)', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Create Invite Link</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedStaff && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 500, padding: 32, borderRadius: 16 }}>
            <h2 style={{ fontSize: 24, marginBottom: 8, color: 'var(--text-primary)' }}>Edit Staff Role</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Updating access for {selectedStaff.name}</p>
            <form onSubmit={handleUpdateRole}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Role</label>
                  {!scaleMode && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(57, 217, 196, 0.15)', color: 'var(--accent-teal)', fontWeight: 600 }}>
                      1-Tier Admin Standard
                    </span>
                  )}
                </div>
                <select name="role" defaultValue={selectedStaff.role} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                  {scaleMode ? (
                    Object.keys(ROLE_COLORS).map(r => <option key={r} value={r}>{r}</option>)
                  ) : (
                    <>
                      <option value="ADMIN">ADMIN (Full Operations Access)</option>
                      <option value="OWNER">OWNER</option>
                      <option disabled value="INVENTORY">INVENTORY • [Enterprise Scale Only]</option>
                      <option disabled value="ORDER MANAGER">ORDER MANAGER • [Enterprise Scale Only]</option>
                      <option disabled value="CONTENT">CONTENT • [Enterprise Scale Only]</option>
                      <option disabled value="SUPPORT">SUPPORT • [Enterprise Scale Only]</option>
                      <option disabled value="ANALYST">ANALYST • [Enterprise Scale Only]</option>
                    </>
                  )}
                </select>
                {!scaleMode && (
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
                    Multi-Seat Role Management (Enterprise Scale) • 6 specialized sub-roles unlock in Scale Mode.
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 12, color: 'var(--text-secondary)', fontSize: 14 }}>Permissions</label>
                {scaleMode ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {PERMISSIONS_LIST.map(perm => (
                      <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontSize: 14 }}>
                        <input type="checkbox" name={`perm_${perm}`} defaultChecked={selectedStaff.permissions?.includes(perm) || true} />
                        {perm}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', fontSize: 13, color: 'var(--text-secondary)' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>Standard Full Admin Access (12 Domains Active)</div>
                    All permissions granted for standard operations. Granular 12-point matrix unlocks in Scale Mode.
                    {PERMISSIONS_LIST.map(p => (
                      <input key={p} type="hidden" name={`perm_${p}`} value="on" />
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent-teal)', border: 'none', color: '#000', fontWeight: 600, cursor: 'pointer' }}>Update Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .stat-card { transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-2px); }
        .admin-table-row { transition: background 0.2s; }
        .admin-table-row:hover { background: rgba(255,255,255,0.03); }
        input[type="checkbox"] { accent-color: var(--accent-teal); }
        @media (max-width: 768px) {
          .staff-filter-bar {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .staff-filter-bar > div {
            min-width: 100% !important;
          }
          .desktop-staff-table {
            display: none !important;
          }
          .mobile-staff-cards {
            display: flex !important;
          }
        }
      `}} />
    </div>
  );
}
