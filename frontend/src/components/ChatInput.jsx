// Purpose: ChatInput — fixed bottom bar with auto-resize textarea, send, file upload, char counter
import React, { useRef, useState, useCallback } from 'react';
import useChatStore from '../store/chatStore';

const MAX_CHARS   = 2000;
const WARN_CHARS  = 1800;
const DOC_TYPES   = ['SALARY_SLIP', 'BANK_STATEMENT', 'AADHAAR', 'PAN', 'ITR'];

export default function ChatInput() {
  const [text, setText]   = useState('');
  const textareaRef       = useRef(null);
  const fileInputRef      = useRef(null);
  const { sendMessage, uploadDocument, isTyping } = useChatStore();

  /* ── Auto-resize textarea ────────────────────────────────────── */
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 4 * 24 + 32) + 'px'; // max 4 lines
  }, []);

  const onChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setText(e.target.value);
      adjustHeight();
    }
  };

  /* ── Send message ────────────────────────────────────────────── */
  const onSend = useCallback(() => {
    if (!text.trim() || isTyping) return;
    sendMessage(text.trim());
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [text, isTyping, sendMessage]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  /* ── File upload ─────────────────────────────────────────────── */
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadDocument(file, 'SALARY_SLIP'); // Default to salary slip
    e.target.value = '';
  };

  const charWarn  = text.length >= WARN_CHARS;
  const canSend   = text.trim().length > 0 && !isTyping;

  return (
    <footer className="glass-bar" style={{
      position:    'fixed',
      bottom:      0,
      left:        0,
      right:       0,
      padding:     '0.75rem 1rem',
      zIndex:      'var(--z-topbar)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.625rem', maxWidth: '900px', margin: '0 auto' }}>
        {/* Attach button */}
        <button
          className="btn-ghost glow-target"
          onClick={() => fileInputRef.current?.click()}
          disabled={isTyping}
          style={{ flexShrink: 0, padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
          title="Upload document"
        >
          📎
        </button>
        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onFileChange} style={{ display: 'none' }} />

        {/* Textarea */}
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={isTyping}
            placeholder="Ask about loans, check status, or calculate EMI..."
            rows={1}
            className="input-glass"
            style={{
              resize:         'none',
              paddingRight:   '4rem',
              overflowY:      'auto',
              lineHeight:     '1.5',
              minHeight:      '44px',
            }}
          />
          {/* Char counter */}
          <span style={{
            position:   'absolute',
            bottom:     '0.5rem',
            right:      '0.75rem',
            fontSize:   'var(--text-xs)',
            color:      charWarn ? 'var(--color-danger)' : 'var(--color-text-muted)',
          }}>
            {text.length}/{MAX_CHARS}
          </span>
        </div>

        {/* Send button */}
        <button
          className={canSend ? 'btn-emerald glow-target' : 'btn-ghost'}
          onClick={onSend}
          disabled={!canSend}
          style={{ flexShrink: 0, padding: '0.625rem 1rem', minWidth: '56px' }}
          title="Send (Enter)"
        >
          {isTyping ? (
            <span style={{ display: 'inline-flex', gap: '3px' }}>
              <span className="typing-dot" style={{ width: 5, height: 5 }} />
              <span className="typing-dot" style={{ width: 5, height: 5, animationDelay: '150ms' }} />
              <span className="typing-dot" style={{ width: 5, height: 5, animationDelay: '300ms' }} />
            </span>
          ) : '▶'}
        </button>
      </div>
    </footer>
  );
}
