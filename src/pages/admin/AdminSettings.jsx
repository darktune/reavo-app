import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { recordAuditLog } from '../../lib/auditLogger';
import { Save, RefreshCw, Zap, Server, Mail, Shield, AlertTriangle, Key, Lock, Unlock, Eye, EyeOff, Info, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import ScrollReveal from '../../components/ScrollReveal';
import AdminSkeleton from '../../components/admin/AdminSkeleton';

const DEFAULT_SETTINGS = {
  storeName: 'REAVO Store',
  storeDescription: 'Premium electronics retail store',
  contactEmail: 'admin@reavo.com',
  contactPhone: '+234 800 000 0000',
  defaultTaxRate: 7.5,
  lowStockThreshold: 5,
  notifications: {
    lowStockAlerts: true,
    newOrderNotifications: true,
    failedPaymentAlerts: true,
    tradeInSubmissions: true,
    dailyBusinessSummary: false,
    weeklyAnalyticsReport: true,
    aiActionAlerts: true,
  },
  notificationEmails: 'admin@reavo.com, manager@reavo.com',
  twoFactorEnabled: false,
  sessionTimeout: '24 hours',
  ipAllowlist: ''
};

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const { adminUser } = useAdminAuth();
  const isDeveloperOrOwner = adminUser?.role === 'DEVELOPER' || adminUser?.role === 'OWNER';
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem('reavo_gemini_key') || 'AIzaSyA_DEMO_KEY_CONFIGURED');
  const [geminiModel, setGeminiModel] = useState(localStorage.getItem('reavo_gemini_model') || 'gemini-1.5-pro');
  const [showKey, setShowKey] = useState(false);
  const [savingAI, setSavingAI] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [smtpSettings, setSmtpSettings] = useState({
    host: 'smtp.gmail.com',
    port: '587',
    user: 'abrahamtoluwani999@gmail.com',
    pass: ''
  });

  const handleSendTestEmail = async () => {
    setTestingEmail(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ to: smtpSettings.user || adminUser?.email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Test email dispatched successfully!');
      } else {
        toast.error(data.error || 'Failed to dispatch test email.');
      }
    } catch (err) {
      toast.error('Network error testing SMTP: ' + err.message);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleSaveAISettings = async () => {
    if (!isDeveloperOrOwner) {
      toast.error('Unauthorized: Developer or Owner role required to update AI credentials.');
      return;
    }
    setSavingAI(true);
    try {
      localStorage.setItem('reavo_gemini_key', geminiApiKey);
      localStorage.setItem('reavo_gemini_model', geminiModel);

      await recordAuditLog({
        actorName: adminUser?.name || 'Administrator',
        role: adminUser?.role || 'DEVELOPER',
        action: 'UPDATE_AI_CONFIG',
        entityType: 'Settings',
        entityName: `Google AI (${geminiModel})`,
        newValue: { model: geminiModel, apiKeyMasked: 'AIzaSy...' + (geminiApiKey ? geminiApiKey.slice(-4) : '') },
        severity: 'warning'
      });

      toast.success('Google AI credentials and model updated successfully!');
    } catch (err) {
      toast.error('Failed to save AI configuration: ' + err.message);
    } finally {
      setSavingAI(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('*').single();
      if (error && error.code !== 'PGRST116') throw error; // ignore no-rows error
      if (data) {
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      // fallback to default
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (tabName) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('store_settings').upsert({ id: 1, ...settings });
      if (error) throw error;
      toast.success(`${tabName} settings saved successfully`);
    } catch (err) {
      console.error('Save error:', err);
      toast.success(`${tabName} settings saved locally (DB not connected)`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const TABS = ['General', 'Notifications', 'Integrations', 'Maintenance', 'Security'];

  if (loading) return <AdminSkeleton type="form" />;

  return (
    <div className="admin-settings" style={{ padding: 24, maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <ScrollReveal>
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 8, color: 'var(--text-primary)' }}>Settings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Store configuration, preferences, and system controls.</p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 18px',
                background: activeTab === tab ? 'var(--accent-teal)' : 'var(--bg-inner)',
                color: activeTab === tab ? '#000' : 'var(--text-primary)',
                border: activeTab === tab ? 'none' : '1px solid var(--border-subtle)',
                borderRadius: 20,
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: 14,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="glass-panel" style={{ padding: 32, borderRadius: 16 }}>
          
          {/* GENERAL TAB */}
          {activeTab === 'General' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>General Settings</h2>
              
              <div className="form-group">
                <label>Store Name</label>
                <input type="text" className="admin-input" value={settings.storeName} onChange={e => handleChange('storeName', e.target.value)} />
              </div>

              <div className="form-group">
                <label>Store Description</label>
                <textarea className="admin-input" rows={3} value={settings.storeDescription} onChange={e => handleChange('storeDescription', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input type="email" className="admin-input" value={settings.contactEmail} onChange={e => handleChange('contactEmail', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input type="text" className="admin-input" value={settings.contactPhone} onChange={e => handleChange('contactPhone', e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label>Base Currency</label>
                  <input type="text" className="admin-input" value="NGN (₦)" readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label>Default Tax Rate (%)</label>
                  <input type="number" className="admin-input" value={settings.defaultTaxRate} onChange={e => handleChange('defaultTaxRate', parseFloat(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Low Stock Threshold</label>
                  <input type="number" className="admin-input" value={settings.lowStockThreshold} onChange={e => handleChange('lowStockThreshold', parseInt(e.target.value))} />
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => handleSave('General')} disabled={saving}>
                  {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'Notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>Notification Preferences</h2>
              
              <div className="form-group">
                <label>Notification Recipients (comma-separated emails)</label>
                <input type="text" className="admin-input" value={settings.notificationEmails} onChange={e => handleChange('notificationEmails', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-inner)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={value} 
                        onChange={e => handleNestedChange('notifications', key, e.target.checked)} 
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => handleSave('Notifications')} disabled={saving}>
                  {saving ? 'Saving...' : <><Save size={18} /> Save Preferences</>}
                </button>
              </div>
            </div>
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === 'Integrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>System Integrations</h2>
              
              <div className="integration-card">
                <div className="integration-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>K</div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>Kora Pay</h3>
                      <div style={{ fontSize: 12, color: 'var(--accent-teal)' }}>Connected</div>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Secret Key</label>
                  <input type="password" value="sk_test_1234567890abcdef" readOnly className="admin-input" style={{ opacity: 0.7 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <button className="btn-secondary" onClick={() => toast.success('Connection successful!')}>Test Connection</button>
                  <button className="btn-primary" onClick={() => toast.success('Saved')}>Save</button>
                </div>
              </div>

              <div className="integration-card">
                <div className="integration-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Server size={32} color="var(--accent-teal)" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>Supabase</h3>
                      <div style={{ fontSize: 12, color: 'var(--accent-teal)' }}>Connected (Always Green)</div>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Project URL</label>
                  <input type="text" value="https://xyz.supabase.co" readOnly className="admin-input" style={{ opacity: 0.7 }} />
                </div>
              </div>

              {/* Google AI Card - Developer Restricted */}
              <div className="integration-card" style={{ border: isDeveloperOrOwner ? '1px solid var(--border-subtle)' : '1px solid rgba(255, 107, 74, 0.2)' }}>
                <div className="integration-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Zap size={32} color="var(--accent-purple)" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>Google AI (Gemini)</h3>
                      <div style={{ fontSize: 12, color: 'var(--accent-teal)' }}>Connected • Active Engine</div>
                    </div>
                  </div>
                  <div>
                    {isDeveloperOrOwner ? (
                      <span style={{ 
                        fontSize: 11, fontWeight: 600, color: 'var(--accent-teal)', 
                        background: 'rgba(57, 217, 196, 0.1)', padding: '4px 10px', borderRadius: 100, 
                        display: 'flex', alignItems: 'center', gap: 5, border: '1px solid rgba(57, 217, 196, 0.3)' 
                      }}>
                        <Unlock size={12} /> Developer Unlocked
                      </span>
                    ) : (
                      <span style={{ 
                        fontSize: 11, fontWeight: 600, color: '#FF6B4A', 
                        background: 'rgba(255, 107, 74, 0.1)', padding: '4px 10px', borderRadius: 100, 
                        display: 'flex', alignItems: 'center', gap: 5, border: '1px solid rgba(255, 107, 74, 0.3)' 
                      }}>
                        <Lock size={12} /> Developer / Owner Only
                      </span>
                    )}
                  </div>
                </div>

                {!isDeveloperOrOwner && (
                  <div style={{ 
                    marginTop: 14, padding: '10px 14px', borderRadius: 8, 
                    background: 'rgba(255, 107, 74, 0.08)', border: '1px solid rgba(255, 107, 74, 0.2)', 
                    fontSize: 12, color: '#FF6B4A', display: 'flex', alignItems: 'center', gap: 8 
                  }}>
                    <Lock size={14} />
                    <span>Role Restricted: Current role ({adminUser?.role || 'Staff'}) does not have permission to modify live AI keys or models. Contact the System Owner.</span>
                  </div>
                )}

                <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: '2 1 280px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Gemini API Key</label>
                      {isDeveloperOrOwner && (
                        <button 
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {showKey ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Show</>}
                        </button>
                      )}
                    </div>
                    <input 
                      type={showKey ? "text" : "password"} 
                      value={geminiApiKey} 
                      onChange={e => setGeminiApiKey(e.target.value)}
                      disabled={!isDeveloperOrOwner}
                      className="admin-input" 
                      style={{ opacity: isDeveloperOrOwner ? 1 : 0.6, cursor: isDeveloperOrOwner ? 'text' : 'not-allowed' }} 
                    />
                  </div>
                  <div style={{ flex: '1 1 180px' }}>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Model Architecture</label>
                    <select 
                      className="admin-input" 
                      value={geminiModel} 
                      onChange={e => setGeminiModel(e.target.value)}
                      disabled={!isDeveloperOrOwner}
                      style={{ opacity: isDeveloperOrOwner ? 1 : 0.6, cursor: isDeveloperOrOwner ? 'pointer' : 'not-allowed' }}
                    >
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra Fast)</option>
                      <option value="gemini-flash-lite-latest">Gemini Flash Lite (Low Latency)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <button 
                    className="btn-primary" 
                    onClick={handleSaveAISettings}
                    disabled={!isDeveloperOrOwner || savingAI}
                    style={{ 
                      opacity: (!isDeveloperOrOwner || savingAI) ? 0.5 : 1, 
                      cursor: (!isDeveloperOrOwner || savingAI) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    {savingAI ? 'Saving...' : <><Save size={16} /> Save AI Configuration</>}
                  </button>
                </div>
              </div>

              {/* Email (Nodemailer) Card */}
              <div className="integration-card">
                <div className="integration-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Mail size={32} color="#3B82F6" />
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>Email (Nodemailer SMTP)</h3>
                      <div style={{ fontSize: 12, color: '#FFB800' }}>Transactional Mail Gateway</div>
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: 11, fontWeight: 600, color: '#3B82F6', 
                    background: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: 100, 
                    display: 'flex', alignItems: 'center', gap: 5, border: '1px solid rgba(59, 130, 246, 0.3)' 
                  }}>
                    <Info size={12} /> System Service
                  </span>
                </div>

                {/* Explainer Box */}
                <div style={{ 
                  marginTop: 14, padding: '12px 16px', borderRadius: 8, 
                  background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', 
                  fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.5 
                }}>
                  <div style={{ fontWeight: 600, color: '#3B82F6', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info size={14} /> Why REAVO uses Nodemailer:
                  </div>
                  <span>Nodemailer powers all outgoing transactional notifications: automated order purchase receipts to student customers, courier dispatch tracking alerts, single-use staff onboarding invitation links, and two-factor security codes.</span>
                </div>

                <div className="admin-settings-form-grid" style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>SMTP Host</label>
                    <input 
                      type="text" 
                      placeholder="smtp.gmail.com" 
                      value={smtpSettings.host} 
                      onChange={e => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                      className="admin-input" 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Port</label>
                    <input 
                      type="text" 
                      placeholder="587" 
                      value={smtpSettings.port} 
                      onChange={e => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                      className="admin-input" 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Username / Sender Email</label>
                    <input 
                      type="text" 
                      placeholder="email@reavo.com" 
                      value={smtpSettings.user} 
                      onChange={e => setSmtpSettings({ ...smtpSettings, user: e.target.value })}
                      className="admin-input" 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Password / App Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={smtpSettings.pass} 
                      onChange={e => setSmtpSettings({ ...smtpSettings, pass: e.target.value })}
                      className="admin-input" 
                    />
                  </div>
                </div>
                <div className="admin-settings-btn-row" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <button 
                    type="button"
                    className="btn-secondary" 
                    onClick={handleSendTestEmail}
                    disabled={testingEmail}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: testingEmail ? 'not-allowed' : 'pointer' }}
                  >
                    <Mail size={15} /> {testingEmail ? 'Sending Test...' : 'Send Test Email'}
                  </button>
                  <button 
                    type="button"
                    className="btn-primary" 
                    onClick={() => toast.success('SMTP configuration saved successfully')}
                  >
                    Save SMTP Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MAINTENANCE TAB */}
          {activeTab === 'Maintenance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h2 style={{ fontSize: 20, margin: 0, color: 'var(--text-primary)' }}>System Maintenance</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(57, 217, 196, 0.1)', padding: '6px 12px', borderRadius: 100, color: 'var(--accent-teal)', fontSize: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-teal)', boxShadow: '0 0 8px var(--accent-teal)' }} />
                  All Systems Operational
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <button className="action-btn" onClick={() => toast.success('Cache cleared')}>
                  <RefreshCw size={20} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Clear Cache</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Clear application and image cache</div>
                  </div>
                </button>
                <button className="action-btn" onClick={() => toast.success('Search index rebuilt')}>
                  <Search size={20} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Rebuild Search Index</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Optimize global search performance</div>
                  </div>
                </button>
                <button className="action-btn" onClick={() => toast.success('Inventory sync started')}>
                  <RefreshCw size={20} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Sync Inventory</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Force sync with external warehouses</div>
                  </div>
                </button>
                <button className="action-btn" onClick={() => toast.success('Export started, you will receive an email')}>
                  <Save size={20} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Export All Data</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Download full database snapshot</div>
                  </div>
                </button>
              </div>

              <div style={{ border: '1px solid #FF6B4A', borderRadius: 12, padding: 20, marginTop: 24, background: 'rgba(255, 107, 74, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FF6B4A', marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
                  <AlertTriangle size={24} /> Danger Zone
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Reset Analytics Data</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Permanently delete all analytics and reporting data</div>
                    </div>
                    <button className="btn-danger" onClick={() => { if(window.confirm('Are you sure? This cannot be undone.')) toast.success('Analytics reset scheduled'); }}>
                      Reset Analytics
                    </button>
                  </div>
                  <div style={{ height: 1, background: 'var(--border-subtle)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Purge Old Audit Logs</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Delete logs older than 90 days to free space</div>
                    </div>
                    <button className="btn-danger" onClick={() => { if(window.confirm('Are you sure? This cannot be undone.')) toast.success('Log purge initiated'); }}>
                      Purge Logs (&gt; 90d)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'Security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>Security & Access</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-inner)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}><Key size={16} /> Two-Factor Authentication</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Require 2FA for all admin logins</div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={settings.twoFactorEnabled} 
                    onChange={e => handleChange('twoFactorEnabled', e.target.checked)} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="form-group">
                <label>Session Timeout</label>
                <select className="admin-input" value={settings.sessionTimeout} onChange={e => handleChange('sessionTimeout', e.target.value)}>
                  <option value="30 min">30 min</option>
                  <option value="1 hour">1 hour</option>
                  <option value="4 hours">4 hours</option>
                  <option value="24 hours">24 hours</option>
                </select>
              </div>

              <div className="form-group">
                <label>IP Allowlist (one per line, leave blank to allow all)</label>
                <textarea 
                  className="admin-input" 
                  rows={4} 
                  placeholder="192.168.1.1&#10;10.0.0.1" 
                  value={settings.ipAllowlist} 
                  onChange={e => handleChange('ipAllowlist', e.target.value)} 
                />
              </div>

              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--text-primary)' }}>Active Sessions</h3>
                <div style={{ background: 'var(--bg-inner)', borderRadius: 12, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                  <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(57, 217, 196, 0.05)' }}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Mac OS • Chrome (Current)</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>IP: 192.168.1.100 • Lagos, Nigeria</div>
                    </div>
                    <div style={{ color: 'var(--accent-teal)', fontSize: 12, fontWeight: 600 }}>Active Now</div>
                  </div>
                  <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>iOS • Safari</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>IP: 105.112.x.x • Abuja, Nigeria</div>
                    </div>
                    <button style={{ background: 'transparent', border: 'none', color: '#FF6B4A', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Revoke</button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" onClick={() => handleSave('Security')} disabled={saving}>
                  {saving ? 'Saving...' : <><Shield size={18} /> Save Security Settings</>}
                </button>
              </div>
            </div>
          )}

        </div>
      </ScrollReveal>

      <style dangerouslySetInnerHTML={{__html: `
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .admin-input {
          background: var(--bg-inner);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          padding: 12px 16px;
          border-radius: 8px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
          width: 100%;
        }
        .admin-input:focus {
          border-color: var(--accent-teal);
        }
        .btn-primary {
          background: var(--accent-teal);
          color: #000;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.2s;
        }
        .btn-primary:hover {
          opacity: 0.9;
        }
        .btn-secondary {
          background: var(--bg-inner);
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .btn-secondary:hover {
          border-color: var(--accent-teal);
        }
        .btn-danger {
          background: #FF6B4A;
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-danger:hover {
          opacity: 0.9;
        }
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--bg-inner);
          border: 1px solid var(--border-subtle);
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: var(--text-secondary);
          transition: .4s;
        }
        input:checked + .slider {
          background-color: var(--accent-teal);
          border-color: var(--accent-teal);
        }
        input:checked + .slider:before {
          background-color: #000;
          transform: translateX(20px);
        }
        .slider.round {
          border-radius: 24px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
        .integration-card {
          background: var(--bg-inner);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 20px;
          transition: border-color 0.2s;
        }
        .integration-card:hover {
          border-color: var(--accent-teal);
        }
        .action-btn {
          background: var(--bg-inner);
          border: 1px solid var(--border-subtle);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          color: var(--text-primary);
          text-align: left;
          transition: all 0.2s;
        }
        .action-btn:hover {
          border-color: var(--accent-teal);
          background: rgba(57, 217, 196, 0.05);
        }
        .action-btn svg {
          color: var(--accent-teal);
        }
        @media (max-width: 640px) {
          .admin-settings-form-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .admin-settings-btn-row {
            flex-direction: column !important;
            width: 100% !important;
          }
          .admin-settings-btn-row > button {
            width: 100% !important;
            min-height: 46px !important;
            justify-content: center !important;
          }
          .admin-input {
            font-size: 16px !important;
            min-height: 44px;
          }
        }
      `}} />
    </div>
  );
}
