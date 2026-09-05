import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAssistant } from '../../hooks/useAssistant';
import ChatMessages from './ChatMessages';
import { X, MessageSquare, Send } from 'lucide-react';

export default function AssistantWidget() {
  const { isOpen, toggleAssistant, messages, sendMessage, isTyping } = useAssistant();
  const [input, setInput] = useState('');
  
  // Custom Resize State
  const initialWidth = typeof window !== 'undefined' ? Math.min(380, window.innerWidth - 48) : 380;
  const initialHeight = typeof window !== 'undefined' ? Math.min(600, window.innerHeight - 100) : 600;
  
  const panelRef = useRef(null);
  const isResizing = useRef(false);
  const activeHandle = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0, right: 24, bottom: 24 });

  const handlePointerDown = (e, handlePos) => {
    isResizing.current = true;
    activeHandle.current = handlePos;
    startPos.current = { x: e.clientX, y: e.clientY };
    if (panelRef.current) {
      startSize.current = { 
        width: panelRef.current.offsetWidth, 
        height: panelRef.current.offsetHeight,
        right: parseFloat(panelRef.current.style.right) || 24,
        bottom: parseFloat(panelRef.current.style.bottom) || 24
      };
    }
    document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e) => {
    if (!isResizing.current || !panelRef.current) return;
    
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    
    let { width: w, height: h, right: r, bottom: b } = startSize.current;
    
    if (activeHandle.current === 'tl') {
      w = w - dx;
      h = h - dy;
    } else if (activeHandle.current === 'tr') {
      w = w + dx;
      h = h - dy;
      r = r - dx;
    } else if (activeHandle.current === 'bl') {
      w = w - dx;
      h = h + dy;
      b = b - dy;
    } else if (activeHandle.current === 'br') {
      w = w + dx;
      h = h + dy;
      r = r - dx;
      b = b - dy;
    }

    // Apply min constraints
    if (w < 280) {
      if (activeHandle.current === 'tr' || activeHandle.current === 'br') r += (w - 280);
      w = 280;
    }
    if (h < 400) {
      if (activeHandle.current === 'bl' || activeHandle.current === 'br') b += (h - 400);
      h = 400;
    }
    
    // Apply max constraints to viewport
    if (w > window.innerWidth - 24) w = window.innerWidth - 24;
    if (h > window.innerHeight - 24) h = window.innerHeight - 24;

    // Direct DOM manipulation for buttery smooth resizing
    panelRef.current.style.width = `${w}px`;
    panelRef.current.style.height = `${h}px`;
    panelRef.current.style.right = `${r}px`;
    panelRef.current.style.bottom = `${b}px`;
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (isResizing.current) {
      isResizing.current = false;
      document.body.style.userSelect = '';
      if (e.target.releasePointerCapture) {
        e.target.releasePointerCapture(e.pointerId);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input);
    setInput('');
  };

  const handleActionClick = (action) => {
    sendMessage(action);
  };

  const ResizeHandle = ({ pos, cursor, svgRotate }) => (
    <div 
      onPointerDown={(e) => handlePointerDown(e, pos)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: 'absolute',
        ...(pos.includes('t') ? { top: 0 } : { bottom: 0 }),
        ...(pos.includes('l') ? { left: 0 } : { right: 0 }),
        width: '32px',
        height: '32px',
        cursor,
        zIndex: 10,
        background: 'transparent',
        display: 'flex',
        alignItems: pos.includes('t') ? 'flex-start' : 'flex-end',
        justifyContent: pos.includes('l') ? 'flex-start' : 'flex-end',
        padding: '6px',
        touchAction: 'none'
      }}
      title="Drag to resize"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.3, transform: `rotate(${svgRotate}deg)` }}>
        <path d="M2 1L1 2M5 1L1 5M8 1L1 8M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );

  return (
    <>
      {/* Floating Button */}
      <button 
        id="reavo-assistant-toggle"
        onClick={toggleAssistant}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isOpen ? 'scale(0)' : 'scale(1)',
          opacity: isOpen ? 0 : 1
        }}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Panel */}
      <div 
        ref={panelRef}
        className="assistant-widget-panel" 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: `${initialWidth}px`,
          height: `${initialHeight}px`,
          borderRadius: '24px',
          background: 'var(--bg-void)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 16px 64px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: isResizing.current ? 'none' : 'opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          willChange: 'width, height, right, bottom, transform, opacity'
        }}
      >
        
        {/* 4 Corner Resize Handles */}
        <ResizeHandle pos="tl" cursor="nwse-resize" svgRotate={0} />
        <ResizeHandle pos="tr" cursor="nesw-resize" svgRotate={90} />
        <ResizeHandle pos="bl" cursor="nesw-resize" svgRotate={-90} />
        <ResizeHandle pos="br" cursor="nwse-resize" svgRotate={180} />

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-void)' // Solid header to prevent blur overlap
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#B4FF39' }}></div>
            <span style={{ fontWeight: 600, fontSize: '15px' }}>REAVO Assistant</span>
          </div>
          <button 
            onClick={toggleAssistant}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <ChatMessages 
          messages={messages} 
          isTyping={isTyping} 
          onActionClick={handleActionClick}
        />

        {/* Input */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-void)'
        }}>
          <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              style={{
                width: '100%',
                background: 'var(--bg-inner)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '100px',
                padding: '12px 48px 12px 16px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: input.trim() ? 'var(--text-primary)' : 'transparent',
                color: input.trim() ? 'var(--bg-void)' : 'var(--text-secondary)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
