import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { products as localProductDB } from '../../data/products.js';

export default function ChatMessages({ messages, isTyping, onActionClick }) {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div 
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        scrollbarWidth: 'none'
      }}
    >
      {messages.map((msg, idx) => (
        <div key={idx} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          gap: '8px'
        }}>
          {/* Message Bubble */}
          <div style={{
            maxWidth: '85%',
            padding: '12px 16px',
            borderRadius: '16px',
            background: msg.role === 'user' ? 'var(--text-primary)' : 'var(--bg-inner)',
            color: msg.role === 'user' ? 'var(--bg-void)' : 'var(--text-primary)',
            fontSize: '14px',
            lineHeight: 1.5,
            border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)'
          }}>
            {msg.message}
          </div>

          {/* Product Cards (If AI returned any) */}
          {msg.products && msg.products.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              width: '100%',
              marginTop: '4px'
            }}>
              {msg.products.map(aiProd => {
                const p = localProductDB.find(x => x.id === aiProd.id);
                if (!p) return null;
                return (
                  <div key={p.id} style={{
                    display: 'flex',
                    background: 'var(--bg-inner)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '8px',
                    gap: '12px',
                    alignItems: 'center'
                  }}>
                    <img src={p.image} alt={p.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>₦{p.price.toLocaleString()}</div>
                      {aiProd.reason && (
                        <div style={{ fontSize: '11px', color: '#7C5CFF', marginTop: '2px' }}>✨ {aiProd.reason}</div>
                      )}
                    </div>
                    <button 
                      onClick={() => navigate(`/product/${p.id}`)}
                      style={{
                        background: 'var(--text-primary)',
                        color: 'var(--bg-void)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          {msg.actions && msg.actions.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              {msg.actions.map(action => (
                <button
                  key={action}
                  onClick={() => onActionClick(action)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    borderRadius: '100px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {isTyping && (
        <div style={{
          alignSelf: 'flex-start',
          padding: '12px 16px',
          borderRadius: '16px',
          background: 'var(--bg-inner)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          display: 'flex',
          gap: '4px'
        }}>
          <span className="dot-pulse">●</span>
          <span className="dot-pulse" style={{ animationDelay: '0.2s' }}>●</span>
          <span className="dot-pulse" style={{ animationDelay: '0.4s' }}>●</span>
        </div>
      )}
    </div>
  );
}
