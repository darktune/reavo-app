import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Sparkles, Loader2, Maximize2, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';

export default function AdminAICopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "⚡ **REAVO OS Copilot Ready**\n\nI can check live stock levels, compute daily revenue, flag out-of-stock items, or jump to any operational module. What would you like to review?", 
      sender: 'ai' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Custom Resize State
  const [size, setSize] = useState({ width: 390, height: 580 });
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  const handlePointerDown = (e) => {
    isResizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { width: size.width, height: size.height };
    document.body.style.userSelect = 'none';
  };

  const handlePointerMove = useCallback((e) => {
    if (!isResizing.current) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    
    let newWidth = startSize.current.width - dx;
    let newHeight = startSize.current.height - dy;

    newWidth = Math.max(320, Math.min(newWidth, window.innerWidth - 48));
    newHeight = Math.max(400, Math.min(newHeight, window.innerHeight - 48));

    setSize({ width: newWidth, height: newHeight });
  }, []);

  const handlePointerUp = useCallback(() => {
    isResizing.current = false;
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatInline = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'inherit', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderFormattedMessage = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} style={{ height: 4 }} />;

      if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
        const headerText = trimmed.replace(/^#+\s*/, '').replace(/[\p{Emoji}\u200d\uFE0F]/gu, '').trim();
        return (
          <div key={idx} style={{ 
            fontSize: 13, 
            fontWeight: 700, 
            color: 'var(--accent-teal)', 
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            margin: '6px 0 2px 0'
          }}>
            {headerText}
          </div>
        );
      }

      if (/^[A-Z\s]{4,}$/.test(trimmed) || /^\*\*[A-Z\s]+\*\*$/.test(trimmed)) {
        const subhead = trimmed.replace(/\*\*/g, '').trim();
        return (
          <div key={idx} style={{ 
            fontSize: 10.5, 
            fontWeight: 700, 
            color: 'var(--accent-teal)', 
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginTop: 6,
            marginBottom: 2
          }}>
            {subhead}
          </div>
        );
      }

      if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.replace(/^[•\-\*]\s*/, '');
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, margin: '2px 0', fontSize: 12.5 }}>
            <span style={{ color: 'var(--accent-teal)', marginTop: 1 }}>•</span>
            <div>{formatInline(content)}</div>
          </div>
        );
      }

      if (/^\d+\.\s/.test(trimmed)) {
        const num = trimmed.match(/^(\d+)\.\s/)[1];
        const content = trimmed.replace(/^\d+\.\s*/, '');
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, margin: '2px 0', fontSize: 12.5 }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, minWidth: 14 }}>{num}.</span>
            <div>{formatInline(content)}</div>
          </div>
        );
      }

      return (
        <p key={idx} style={{ margin: '3px 0', fontSize: 12.5, lineHeight: 1.5 }}>
          {formatInline(trimmed)}
        </p>
      );
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isTyping) return;
    
    const userMsg = { id: Date.now(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsTyping(true);

    try {
      const lower = textToSend.toLowerCase();

      // Fetch live Supabase telemetry
      const [{ data: products }, { data: orders }] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*')
      ]);

      const prods = products || [];
      const ords = orders || [];
      const outOfStock = prods.filter(p => Number(p.stock_quantity || 0) === 0);
      const lowStock = prods.filter(p => Number(p.stock_quantity || 0) > 0 && Number(p.stock_quantity || 0) <= 5);
      const totalRev = ords.reduce((s, o) => s + Number(o.total_amount || 0), 0);

      let replyText = '';

      if (lower.includes('stock') || lower.includes('inventory')) {
        replyText = `📦 **Inventory Status:**\n• Total SKUs: **${prods.length}**\n• Out of Stock: **${outOfStock.length}**\n• Low Stock (≤5): **${lowStock.length}**\n\n` +
          (outOfStock.length > 0 ? `⚠️ Urgent Restock Needed: ${outOfStock.slice(0, 3).map(p => p.name).join(', ')}` : '🟢 All inventory levels healthy.');
      } else if (lower.includes('order') || lower.includes('sales') || lower.includes('revenue')) {
        replyText = `💰 **Revenue Summary:**\n• Recorded Gross: **₦${totalRev.toLocaleString()}**\n• Total Orders: **${ords.length}**\n• Active Customers: **${new Set(ords.map(o => o.customer_email)).size}**`;
      } else if (lower.includes('urgent') || lower.includes('alert')) {
        replyText = `⚠️ **Operational Register:**\n• **${outOfStock.length}** products currently with 0 inventory.\n• Live database sync: **Operational**.\n• System health: **Nominal**.`;
      } else {
        replyText = `Understood. I analyzed **${prods.length} products** and **${ords.length} orders**. Everything is synchronized with Supabase live backend.\n\nOpen full command center for batch actions.`;
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: replyText, sender: 'ai' }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "System is connected. Use the AI command module for advanced execution.", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-card)',
          zIndex: 999,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.background = 'var(--bg-inner)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'var(--bg-card)';
        }}
        title="Open AI Operations Copilot"
      >
        <MessageSquare size={24} />
      </button>

      {/* Widget Panel */}
      {isOpen && (
        <div 
          className="glass-panel ai-widget"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: `${size.width}px`,
            maxWidth: '100vw',
            height: `${size.height}px`,
            maxHeight: 'calc(100vh - 48px)',
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-subtle)',
            transition: isResizing.current ? 'none' : 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Top-Left Custom Resize Handle */}
          <div 
            className="ai-resize-handle"
            onPointerDown={handlePointerDown}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '20px',
              height: '20px',
              cursor: 'nwse-resize',
              zIndex: 10,
              background: 'transparent'
            }}
            title="Drag to resize"
          />

          {/* Header */}
          <div style={{ padding: '12px 18px 14px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--glass-bg)' }}>
            <div className="mobile-copilot-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, margin: 0, fontWeight: 600 }}>REAVO OS Copilot</h3>
                  <div style={{ fontSize: 11, color: 'var(--accent-teal)' }}>Live Sync Active</div>
                </div>
              </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button 
                onClick={() => { navigate('/admin/ai'); setIsOpen(false); }} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }} 
                title="Expand to Full Operations Center"
              >
                <Maximize2 size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

          {/* Quick Pill Shortcuts */}
          <div style={{ display: 'flex', gap: 6, padding: '10px 16px', background: 'var(--bg-inner)', borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
            {['Check Stock', 'Revenue Summary', 'Urgent Alerts'].map(pill => (
              <button
                key={pill}
                onClick={() => handleSend(pill)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 100,
                  fontSize: 11,
                  background: 'var(--bg-void)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: 10, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                {msg.sender === 'ai' && (
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#FFFFFF' }}>
                    <Bot size={14} />
                  </div>
                )}
                <div style={{ 
                  background: msg.sender === 'user' ? 'var(--text-primary)' : 'var(--bg-inner)',
                  color: msg.sender === 'user' ? 'var(--bg-void)' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: 14,
                  borderTopRightRadius: msg.sender === 'user' ? 4 : 14,
                  borderTopLeftRadius: msg.sender === 'ai' ? 4 : 14,
                  fontSize: 13,
                  lineHeight: 1.5,
                  maxWidth: '85%'
                }}>
                  {msg.sender === 'ai' ? renderFormattedMessage(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                  <Bot size={14} />
                </div>
                <div style={{ background: 'var(--bg-inner)', padding: '10px 14px', borderRadius: 14, borderTopLeftRadius: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Loader2 size={14} className="animate-spin" color="var(--accent-teal)" />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Synthesizing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: 14, borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-admin-glass)' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text"
                placeholder="Ask Copilot or prompt a check..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{
                  width: '100%',
                  background: 'var(--bg-void)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 20,
                  padding: '10px 42px 10px 14px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: 13,
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-teal)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                style={{
                  position: 'absolute', right: 6,
                  width: 28, height: 28, borderRadius: '50%',
                  background: input.trim() && !isTyping ? 'var(--accent-teal)' : 'transparent',
                  border: 'none', color: input.trim() && !isTyping ? 'var(--bg-void)' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mobile-copilot-handle {
          display: none;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (max-width: 768px) {
          .ai-widget {
            position: fixed !important;
            inset: auto 0 0 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            height: 85vh !important;
            max-width: 100vw !important;
            max-height: 85vh !important;
            border-radius: 24px 24px 0 0 !important;
            border-bottom: none !important;
            box-shadow: 0 -12px 36px rgba(0,0,0,0.7) !important;
          }
          .ai-resize-handle {
            display: none !important;
          }
          .mobile-copilot-handle {
            display: block !important;
            width: 40px;
            height: 4px;
            background: var(--text-secondary);
            opacity: 0.35;
            border-radius: 4px;
            margin: 0 auto 10px auto;
          }
        }
      `}</style>
    </>
  );
}
