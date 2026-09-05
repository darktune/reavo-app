import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { supabase } from '../../lib/supabase';
import { 
  User, Mail, Phone, Shield, Sparkles, CheckCircle2, Circle, Clock, 
  Settings, Volume2, Layout, Eye, Moon, Sun, Monitor, Lock, Key, 
  HelpCircle, Compass, ArrowRight, RefreshCw, Save, Award, Check
} from 'lucide-react';
import { toast } from 'sonner';
import ScrollReveal from '../../components/ScrollReveal';

export default function AdminProfile() {
  const { adminUser } = useAdminAuth();
  
  // Profile Information
  const [fullName, setFullName] = useState(adminUser?.user_metadata?.full_name || 'Adeleke Babajide');
  const [avatarUrl, setAvatarUrl] = useState(adminUser?.user_metadata?.avatar_url || '');
  const [phone, setPhone] = useState(localStorage.getItem('reavo-staff-phone') || '+234 812 345 6789');
  const [department, setDepartment] = useState(localStorage.getItem('reavo-staff-dept') || 'Operations & Logistics');
  const [emergencyContact, setEmergencyContact] = useState(localStorage.getItem('reavo-staff-emergency') || '+234 809 999 8888 (Duty Lead)');
  const [timezone, setTimezone] = useState(localStorage.getItem('reavo-staff-tz') || 'Africa/Lagos (WAT, UTC+1)');
  const [isSaving, setIsSaving] = useState(false);

  // System Customizables & Preferences
  const [defaultLanding, setDefaultLanding] = useState(localStorage.getItem('reavo-pref-landing') || '/admin/dashboard');
  const [tableDensity, setTableDensity] = useState(localStorage.getItem('reavo-pref-density') || 'comfortable');
  const [showTutorialHints, setShowTutorialHints] = useState(localStorage.getItem('reavo-hide-staff-hints') !== 'true');
  const [audioAlerts, setAudioAlerts] = useState(localStorage.getItem('reavo-pref-audio') === 'true');
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem('reavo-theme') || 'system');

  // Interactive 1-Hour Mastery Checklist State
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('reavo-staff-onboarding-checklist');
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return {
      nav: true,
      orders: false,
      inventory: false,
      tradein: false,
      copilot: true,
      vat: false
    };
  });

  const toggleChecklistItem = (key) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    localStorage.setItem('reavo-staff-onboarding-checklist', JSON.stringify(updated));
    toast.success('Onboarding checklist progress updated!');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Save to local storage for instant ergonomics
    localStorage.setItem('reavo-staff-phone', phone);
    localStorage.setItem('reavo-staff-dept', department);
    localStorage.setItem('reavo-staff-emergency', emergencyContact);
    localStorage.setItem('reavo-staff-tz', timezone);
    localStorage.setItem('reavo-pref-landing', defaultLanding);
    localStorage.setItem('reavo-pref-density', tableDensity);
    localStorage.setItem('reavo-hide-staff-hints', (!showTutorialHints).toString());
    localStorage.setItem('reavo-pref-audio', audioAlerts.toString());
    localStorage.setItem('reavo-theme', activeTheme);
    document.documentElement.setAttribute('data-theme', activeTheme);

    try {
      if (adminUser?.email && !adminUser.id.startsWith('demo')) {
        await supabase.auth.updateUser({
          data: { full_name: fullName, avatar_url: avatarUrl }
        });
      }
      toast.success('Staff profile & workspace customizations saved!');
    } catch {
      toast.success('Preferences saved locally to your workstation!');
    } finally {
      setIsSaving(false);
    }
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const masteryPercentage = Math.round((completedCount / 6) * 100);

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      
      {/* Header */}
      <ScrollReveal>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <User size={20} />
              </div>
              Staff Profile & Workspace Customizer
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Configure your on-dial identity, adjust system ergonomics, and track your operational mastery checklist.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)' }}>
            <Award size={16} color="var(--accent-teal)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Mastery: {masteryPercentage}%</span>
          </div>
        </div>
      </ScrollReveal>

      {/* Grid: Profile Station + Onboarding Walkthrough */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        
        {/* Card 1: On-Dial Staff Identity */}
        <ScrollReveal delay={100}>
          <div className="glass-panel" style={{ padding: 26, borderRadius: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ 
                width: 72, height: 72, borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 26, fontWeight: 700,
                boxShadow: '0 8px 24px rgba(124, 92, 255, 0.25)',
                flexShrink: 0
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  (fullName || 'A')[0].toUpperCase()
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700 }}>{fullName}</h2>
                  <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: 'rgba(57, 217, 196, 0.15)', color: 'var(--accent-teal)', border: '1px solid rgba(57, 217, 196, 0.3)' }}>
                    {adminUser?.app_metadata?.role || 'Admin'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{adminUser?.email || 'admin@reavo.ng'}</div>
                <div style={{ fontSize: 12, color: 'var(--accent-purple)', fontWeight: 500, marginTop: 2 }}>Staff ID: STF-2026-081</div>
              </div>
            </div>

            {/* Quick Contact On-Dial Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg-inner)', padding: 16, borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                📞 On-Dial Communication & Escalation
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Official WhatsApp:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Department:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{department}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Duty Escalation:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>{emergencyContact}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Workstation Timezone:</span>
                <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{timezone}</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Card 2: 1-Hour Mastery Checklist (Cognitive Evaluation & HCI Heuristic Guide) */}
        <ScrollReveal delay={150}>
          <div className="glass-panel" style={{ padding: 26, borderRadius: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Compass size={20} color="var(--accent-teal)" />
                <h3 style={{ fontSize: 17, margin: 0, fontWeight: 700 }}>60-Minute System Mastery Checklist</h3>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{completedCount} of 6 Completed</span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: 6, background: 'var(--bg-inner)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
              <div style={{ width: `${masteryPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-teal))', transition: 'width 0.3s ease' }} />
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 12.5, margin: 0 }}>
              Complete these 6 core operational tasks to master the REAVO Admin OS in under 60 minutes:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { id: 'nav', title: 'Global Shortcuts Mastery', desc: 'Press Ctrl+K for search palette and ? for keyboard navigation cheat sheet.' },
                { id: 'orders', title: 'Process & Print Order Waybill', desc: 'Open /admin/orders, assign a courier dispatch, and generate a printable waybill.' },
                { id: 'inventory', title: 'Execute Atomic Stock Restock', desc: 'Open /admin/inventory, click (+), and record a restock batch with audit reason.' },
                { id: 'tradein', title: 'Evaluate a Customer Trade-In', desc: 'Open /admin/trade-ins, score device photos, and test 1-click WhatsApp offer.' },
                { id: 'copilot', title: 'Query Live AI Copilot', desc: 'Ask OS Copilot widget: "Check out-of-stock items and total revenue".' },
                { id: 'vat', title: 'Export FIRS 7.5% Tax & P&L Pack', desc: 'Open /admin/analytics, click [Export VAT (7.5%)] to generate Nigerian tax CSV.' }
              ].map(item => {
                const done = checklist[item.id];
                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: done ? 'rgba(57, 217, 196, 0.06)' : 'var(--bg-inner)',
                      border: `1px solid ${done ? 'rgba(57, 217, 196, 0.2)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ marginTop: 2, color: done ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
                      {done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: done ? 'var(--text-primary)' : 'var(--text-secondary)', textDecoration: done ? 'line-through' : 'none' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Workspace Customizer & Ergonomics Form */}
      <ScrollReveal delay={200}>
        <div className="glass-panel" style={{ padding: 28, borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Settings size={22} color="var(--accent-purple)" />
            <div>
              <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700 }}>Personal Ergonomics & System Customization</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '4px 0 0' }}>
                Tailor the Admin OS layout, density, and notification signals to match your personal workflow.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Row 1: Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Staff Full Name</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  style={{ width: '100%', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Direct WhatsApp / Phone</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="+234 800 000 0000"
                  style={{ width: '100%', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>

            {/* Row 2: Department & Duty Escalation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Department / Function</label>
                <select 
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="Executive & Strategy">Executive & Strategy</option>
                  <option value="Operations & Logistics">Operations & Logistics</option>
                  <option value="Inventory Control">Inventory Control</option>
                  <option value="Customer Relations & CRM">Customer Relations & CRM</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Content & Marketing">Content & Marketing</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Emergency Duty Escalation Contact</label>
                <input 
                  type="text" 
                  value={emergencyContact} 
                  onChange={e => setEmergencyContact(e.target.value)} 
                  style={{ width: '100%', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>

            {/* Row 3: Ergonomics Preferences */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Default Landing Screen</label>
                <select 
                  value={defaultLanding}
                  onChange={e => setDefaultLanding(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="/admin/dashboard">Executive Dashboard</option>
                  <option value="/admin/orders">Orders & Waybills</option>
                  <option value="/admin/inventory">Inventory & Restock</option>
                  <option value="/admin/customers">Customer CRM</option>
                  <option value="/admin/trade-ins">Trade-In Grading Console</option>
                  <option value="/admin/analytics">Analytics & Tax Pack</option>
                  <option value="/admin/automations">Automations & Workflows</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Table Display Density</label>
                <select 
                  value={tableDensity}
                  onChange={e => setTableDensity(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-inner)', border: '1px solid var(--border-subtle)', padding: '10px 14px', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="comfortable">Comfortable (Standard Touch & Spacing)</option>
                  <option value="compact">Compact (High-Density Data Entry)</option>
                </select>
              </div>
            </div>

            {/* Row 4: HCI Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-inner)', padding: 18, borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Contextual Staff Tutorial Tips</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Show subtle, contextual helper tips across admin modules to guide daily operations.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={showTutorialHints} 
                  onChange={e => setShowTutorialHints(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Audible Order & Anomaly Signals</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Play subtle audio chime when new orders arrive or out-of-stock anomalies trigger.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={audioAlerts} 
                  onChange={e => setAudioAlerts(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Visual Interface Theme</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Select between clean high-contrast light mode, stealth dark mode, or system sync.</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { id: 'system', label: 'System', icon: <Monitor size={14} /> },
                    { id: 'light', label: 'Light', icon: <Sun size={14} /> },
                    { id: 'dark', label: 'Dark', icon: <Moon size={14} /> },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setActiveTheme(t.id);
                        document.documentElement.setAttribute('data-theme', t.id);
                        localStorage.setItem('reavo-theme', t.id);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: `1px solid ${activeTheme === t.id ? 'var(--accent-teal)' : 'var(--border-subtle)'}`,
                        background: activeTheme === t.id ? 'var(--accent-teal)' : 'var(--bg-void)',
                        color: activeTheme === t.id ? '#000' : 'var(--text-secondary)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className="btn-primary" 
              style={{ padding: '12px 24px', borderRadius: 10, alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}
            >
              <Save size={18} /> {isSaving ? 'Saving Preferences...' : 'Save Workspace Customizations'}
            </button>
          </form>
        </div>
      </ScrollReveal>

    </div>
  );
}
