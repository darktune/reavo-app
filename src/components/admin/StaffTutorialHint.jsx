import React, { useState, useEffect } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';

export default function StaffTutorialHint({ id, title, hint, actionLabel, onAction, icon: CustomIcon }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if staff globally disabled hints or dismissed this specific hint
    const globalHide = localStorage.getItem('reavo-hide-staff-hints') === 'true';
    const dismissedThis = localStorage.getItem(`reavo-hint-dismissed-${id}`) === 'true';
    if (globalHide || dismissedThis) {
      setIsVisible(false);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`reavo-hint-dismissed-${id}`, 'true');
  };

  if (!isVisible) return null;

  // Clean emoji prefixes like 💡 or ⚡ from title to enforce sleek global tech iconography
  const cleanTitle = title?.replace(/^[\p{Emoji}\s]+/u, '').trim();
  const IconComponent = CustomIcon || Sparkles;

  return (
    <div 
      className="staff-tutorial-hint"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 18px',
        borderRadius: 14,
        background: 'linear-gradient(90deg, rgba(124, 92, 255, 0.08) 0%, rgba(57, 217, 196, 0.08) 100%)',
        border: '1px solid var(--border-subtle)',
        marginBottom: 18,
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <div style={{ 
          width: 32, height: 32, borderRadius: 10, 
          background: 'var(--bg-inner)', 
          border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent-teal)', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <IconComponent size={16} />
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>
          {cleanTitle && <strong style={{ color: 'var(--text-primary)', marginRight: 6, fontWeight: 600 }}>{cleanTitle}:</strong>}
          <span style={{ color: 'var(--text-secondary)' }}>{hint}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {actionLabel && (
          <button 
            onClick={onAction}
            style={{ 
              fontSize: 12, fontWeight: 600, color: 'var(--accent-teal)', 
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4 
            }}
          >
            {actionLabel} <ChevronRight size={14} />
          </button>
        )}
        <button 
          onClick={handleDismiss}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.7, padding: 4 }}
          title="Dismiss this tip"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
