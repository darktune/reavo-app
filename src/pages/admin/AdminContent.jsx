import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, GripVertical, Image as ImageIcon, EyeOff, Layout, FileText, Bell, Globe, Lock } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import AdminSkeleton from '../../components/admin/AdminSkeleton';

export default function AdminContent() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState([]);
  const [activeTab, setActiveTab] = useState('banners');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({});
  const [scaleMode, setScaleMode] = useState(() => localStorage.getItem('reavo-scale-mode') === 'true');

  useEffect(() => {
    const handleScaleMode = () => {
      setScaleMode(localStorage.getItem('reavo-scale-mode') === 'true');
    };
    window.addEventListener('reavo-scale-mode-changed', handleScaleMode);
    return () => window.removeEventListener('reavo-scale-mode-changed', handleScaleMode);
  }, []);

  const mockContent = [
    { id: 1, type: 'banner', title: 'Summer Sale', subtitle: 'Up to 50% off all sneakers', cta_text: 'Shop Now', cta_link: '/category/sneakers', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', status: 'live', position: 1, created_at: new Date().toISOString() },
    { id: 2, type: 'announcement', message: 'Free shipping on orders over ₦50,000!', announcement_type: 'promo', display_location: 'banner_bar', status: 'live', created_at: new Date().toISOString() },
    { id: 3, type: 'page', title: 'About Us', slug: '/about', status: 'live', body: 'Welcome to Reavo...', updated_at: new Date().toISOString() }
  ];

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('content_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_blocks' }, () => {
        fetchData(true);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const { data, error } = await supabase.from('content_blocks').select('*').order('created_at', { ascending: false });
      if (error) {
        setContent(mockContent);
      } else {
        setContent(data && data.length > 0 ? data : mockContent);
      }
    } catch (e) {
      setContent(mockContent);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const getInitialForm = (type) => {
    if (type === 'banner') return { type, title: '', subtitle: '', image_url: '', cta_text: '', cta_link: '', status: 'draft', position: 0 };
    if (type === 'announcement') return { type, message: '', announcement_type: 'info', display_location: 'banner_bar', status: 'draft' };
    if (type === 'page') return { type, title: '', slug: '', body: '', status: 'draft' };
    return { type };
  };

  const openModal = (type, item = null) => {
    setEditingContent(item);
    setFormData(item || getInitialForm(type));
    setModalOpen(true);
  };

  const saveContent = async () => {
    try {
      const payload = { ...formData, updated_at: new Date().toISOString() };
      
      if (editingContent) {
        const { error } = await supabase.from('content_blocks').update(payload).eq('id', editingContent.id);
        if (error) throw error;
        toast.success('Content updated');
      } else {
        payload.created_at = new Date().toISOString();
        const { error } = await supabase.from('content_blocks').insert([payload]);
        if (error) throw error;
        toast.success('Content created');
      }
      setModalOpen(false);
      fetchData(true);
    } catch (e) {
      toast.error('Failed to save. Falling back to local state.');
      const newC = { ...formData, id: editingContent ? editingContent.id : Date.now() };
      setContent(prev => editingContent ? prev.map(p => p.id === newC.id ? newC : p) : [newC, ...prev]);
      setModalOpen(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'live' ? 'draft' : 'live';
    try {
      const { error } = await supabase.from('content_blocks').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success(`Marked as ${newStatus}`);
      fetchData(true);
    } catch (e) {
      setContent(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast.success(`Marked as ${newStatus} (local)`);
    }
  };

  const deleteContent = async (id) => {
    if (!window.confirm('Delete this content?')) return;
    try {
      const { error } = await supabase.from('content_blocks').delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted');
      fetchData(true);
    } catch (e) {
      setContent(prev => prev.filter(c => c.id !== id));
      toast.success('Deleted (local)');
    }
  };

  if (loading) return <AdminSkeleton />;

  const banners = content.filter(c => c.type === 'banner').sort((a,b) => a.position - b.position);
  const announcements = content.filter(c => c.type === 'announcement');
  const pages = content.filter(c => c.type === 'page');

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', color: 'var(--text-primary)' }}>
      <ScrollReveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 8, margin: 0, fontWeight: 600 }}>Content</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Hero banners, announcements, and store messaging.</p>
          </div>
          <button className="btn-primary" onClick={() => openModal(activeTab.slice(0, -1))} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: 'var(--accent-purple)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            <Plus size={18} /> New {activeTab === 'banners' ? 'Banner' : activeTab === 'announcements' ? 'Announcement' : 'Page'}
          </button>
        </div>

        {/* Lean Day 1 Scale Notice */}
        {!scaleMode && (
          <div className="glass-panel" style={{ 
            padding: '20px 24px', 
            borderRadius: 16, 
            border: '1px solid rgba(124, 92, 255, 0.3)', 
            background: 'linear-gradient(135deg, rgba(124, 92, 255, 0.08) 0%, rgba(57, 217, 196, 0.04) 100%)', 
            marginBottom: 28, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 16 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124, 92, 255, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', flexShrink: 0 }}>
                <Lock size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Dynamic CMS • Staged for Phase 2</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(124, 92, 255, 0.2)', color: '#A78BFA' }}>Phase 2 CMS</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', maxWidth: 640 }}>
                  For Lean Day 1 launch, storefront hero banners and policies are locked to code-based templates for maximum sub-second render speeds and brand consistency. Dynamic in-browser CMS unlocks in Scale Phase.
                </p>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 8, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              Toggle Scale Mode to Edit
            </span>
          </div>
        )}


        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border-subtle)', marginBottom: 32 }}>
          {[
            { id: 'banners', label: 'Banners', icon: Layout },
            { id: 'announcements', label: 'Announcements', icon: Bell },
            { id: 'pages', label: 'Pages', icon: FileText }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: '12px 4px', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-teal)' : '2px solid transparent', 
                color: activeTab === tab.id ? 'var(--accent-teal)' : 'var(--text-primary)', 
                cursor: 'pointer', 
                fontSize: 15, 
                fontWeight: activeTab === tab.id ? 700 : 500,
                transition: 'all 0.2s'
              }}
            >
              <tab.icon size={18} color={activeTab === tab.id ? 'var(--accent-teal)' : 'var(--text-secondary)'} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'banners' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
            {banners.map((b, i) => (
              <div key={b.id} className="glass-panel" style={{ padding: 16, borderRadius: 16, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 16, background: '#111', position: 'relative' }}>
                  {b.image_url ? (
                    <img src={b.image_url} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: b.status === 'live' ? 1 : 0.5 }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><ImageIcon size={48} color="var(--text-secondary)" /></div>
                  )}
                  <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: 100, fontSize: 12, fontWeight: 600, color: b.status === 'live' ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
                    {b.status.toUpperCase()}
                  </div>
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: 100, fontSize: 12, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <GripVertical size={14} /> Pos {i + 1}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 18 }}>{b.title || 'Untitled'}</h3>
                  <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: 14 }}>{b.subtitle}</p>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>CTA: {b.cta_text} ({b.cta_link})</div>
                </div>
                <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                  <button onClick={() => openModal('banner', b)} style={{ flex: 1, padding: '8px', borderRadius: 6, background: 'var(--bg-void)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => toggleStatus(b.id, b.status)} style={{ flex: 1, padding: '8px', borderRadius: 6, background: 'var(--bg-void)', color: b.status === 'live' ? 'var(--text-secondary)' : 'var(--accent-teal)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                    {b.status === 'live' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => deleteContent(b.id)} style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-void)', color: '#FF6B4A', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {banners.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No banners found.</div>}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="glass-panel" style={{ padding: 24, borderRadius: 16, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Message</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Location</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map(a => (
                  <tr key={a.id} className="admin-table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '16px' }}>{a.message}</td>
                    <td style={{ padding: '16px', textTransform: 'capitalize' }}>{a.announcement_type || 'Info'}</td>
                    <td style={{ padding: '16px' }}>{a.display_location === 'banner_bar' ? 'Banner Bar' : a.display_location}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: a.status === 'live' ? 'var(--accent-teal)20' : 'var(--text-secondary)20', color: a.status === 'live' ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => openModal('announcement', a)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit size={16} /></button>
                        <button onClick={() => toggleStatus(a.id, a.status)} style={{ background: 'none', border: 'none', color: a.status === 'live' ? 'var(--text-secondary)' : 'var(--accent-teal)', cursor: 'pointer' }}><EyeOff size={16} /></button>
                        <button onClick={() => deleteContent(a.id)} style={{ background: 'none', border: 'none', color: '#FF6B4A', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {announcements.length === 0 && <tr><td colSpan={5} style={{ padding: 16, color: 'var(--text-secondary)' }}>No announcements.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="glass-panel" style={{ padding: 24, borderRadius: 16, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Title</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Slug</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(p => (
                  <tr key={p.id} className="admin-table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{p.title}</td>
                    <td style={{ padding: '16px', color: 'var(--accent-purple)' }}>{p.slug}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: p.status === 'live' ? 'var(--accent-teal)20' : 'var(--text-secondary)20', color: p.status === 'live' ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => openModal('page', p)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit size={16} /></button>
                        <button onClick={() => toggleStatus(p.id, p.status)} style={{ background: 'none', border: 'none', color: p.status === 'live' ? 'var(--text-secondary)' : 'var(--accent-teal)', cursor: 'pointer' }}><Globe size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pages.length === 0 && <tr><td colSpan={4} style={{ padding: 16, color: 'var(--text-secondary)' }}>No pages.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </ScrollReveal>

      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-inner)', width: '100%', maxWidth: 600, borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, textTransform: 'capitalize' }}>{editingContent ? `Edit ${formData.type}` : `Create ${formData.type}`}</h3>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflowY: 'auto' }}>
              {formData.type === 'banner' && (
                <>
                  <div><label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Title</label><input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} /></div>
                  <div><label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Subtitle</label><input type="text" value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} /></div>
                  <div><label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Image URL</label><input type="text" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} /></div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>CTA Text</label><input type="text" value={formData.cta_text || ''} onChange={e => setFormData({...formData, cta_text: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} /></div>
                    <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>CTA Link</label><input type="text" value={formData.cta_link || ''} onChange={e => setFormData({...formData, cta_link: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} /></div>
                  </div>
                </>
              )}
              {formData.type === 'announcement' && (
                <>
                  <div><label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Message</label><input type="text" value={formData.message || ''} onChange={e => setFormData({...formData, message: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} /></div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Type</label><select value={formData.announcement_type || 'info'} onChange={e => setFormData({...formData, announcement_type: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }}><option value="info">Info</option><option value="promo">Promo</option><option value="warning">Warning</option></select></div>
                    <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Location</label><select value={formData.display_location || 'banner_bar'} onChange={e => setFormData({...formData, display_location: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }}><option value="banner_bar">Banner Bar</option><option value="popup">Popup</option></select></div>
                  </div>
                </>
              )}
              {formData.type === 'page' && (
                <>
                  <div><label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Title</label><input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} /></div>
                  <div><label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Slug</label><input type="text" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)' }} /></div>
                  <div><label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>Content Body</label><textarea value={formData.body || ''} onChange={e => setFormData({...formData, body: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-void)', color: 'var(--text-primary)', minHeight: 150 }} /></div>
                </>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <input type="checkbox" id="isLive" checked={formData.status === 'live'} onChange={e => setFormData({...formData, status: e.target.checked ? 'live' : 'draft'})} style={{ width: 18, height: 18, accentColor: 'var(--accent-teal)' }} />
                <label htmlFor="isLive" style={{ cursor: 'pointer' }}>Publish immediately</label>
              </div>
            </div>
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--bg-void)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveContent} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent-teal)', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-table-row:hover { background: rgba(255,255,255,0.02); }
      `}</style>
    </div>
  );
}
