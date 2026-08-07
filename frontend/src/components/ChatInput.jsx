// Purpose: ChatInput — bottom bar with quick-tap suggestion pills, auto-resize textarea, send + file upload
import React, { useRef, useState, useCallback } from 'react';
import useChatStore from '../store/chatStore';

const MAX_CHARS  = 2000;
const WARN_CHARS = 1800;

/* ── Quick-tap suggestion buttons ─────────────────────────────────────────── */
const QUICK_TAPS = [
  '₹2L – ₹5L',
  '₹5L – ₹10L',
  'Check Eligibility',
  'Calculate EMI',
];

export default function ChatInput() {
  const [text, setText]   = useState('');
  const textareaRef       = useRef(null);
  const fileInputRef      = useRef(null);
  const { sendMessage, uploadDocument, isTyping } = useChatStore();

  /* ── Auto-resize textarea ─────────────────────────────────────────────── */
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 4 * 24 + 32) + 'px';
  }, []);

  const onChange = (e) => {
    if (e.target.value.length <= MAX_CHARS) {
      setText(e.target.value);
      adjustHeight();
    }
  };

  /* ── Send message ─────────────────────────────────────────────────────── */
  const onSend = useCallback((msg) => {
    const payload = (typeof msg === 'string' ? msg : text).trim();
    if (!payload || isTyping) return;
    sendMessage(payload);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [text, isTyping, sendMessage]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  /* ── File upload ──────────────────────────────────────────────────────── */
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadDocument(file, 'SALARY_SLIP');
    e.target.value = '';
  };

  const charWarn = text.length >= WARN_CHARS;
  const canSend  = text.trim().length > 0 && !isTyping;

  return (
    <footer style={{
      padding:    '0.5rem 1rem 0.875rem',
      flexShrink: 0,
      borderTop:  '1px solid rgba(148,163,184,0.08)',
    }}>

      {/* ── Quick-tap suggestion pills ───────────────────────────────── */}
      <div style={{
        display:        'flex',
        flexWrap:       'wrap',
        gap:            '0.375rem',
        marginBottom:   '0.625rem',
      }}>
        {QUICK_TAPS.map((label) => (
          <button
            key={label}
            onClick={() => onSend(label)}
            disabled={isTyping}
            style={{
              padding:      '0.25rem 0.75rem',
              fontSize:     'var(--text-xs)',
              fontFamily:   'var(--font-body)',
              fontWeight:   500,
              color:        '#94a3b8',
              background:   'transparent',
              border:       '1px solid rgba(99,102,241,0.4)',
              borderRadius: '9999px',
              cursor:       'pointer',
              transition:   'all 150ms ease',
              lineHeight:   1.5,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.color       = '#f1f5f9';
              e.currentTarget.style.background  = 'rgba(99,102,241,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
              e.currentTarget.style.color       = '#94a3b8';
              e.currentTarget.style.background  = 'transparent';
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Input row ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.625rem' }}>

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
              resize:       'none',
              paddingRight: '4rem',
              overflowY:    'auto',
              lineHeight:   '1.5',
              minHeight:    '44px',
            }}
          />
          {/* Char counter */}
          <span style={{
            position:  'absolute',
            bottom:    '0.5rem',
            right:     '0.75rem',
            fontSize:  'var(--text-xs)',
            color:     charWarn ? 'var(--color-danger)' : 'var(--color-text-muted)',
          }}>
            {text.length}/{MAX_CHARS}
          </span>
        </div>

        {/* Send button */}
        <button
          className={canSend ? 'btn-emerald glow-target' : 'btn-ghost'}
          onClick={() => onSend()}
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
