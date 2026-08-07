// Purpose: AgentStatusBar — fixed top bar with TrustFlow branding and live intent badge
import React from 'react';
import useChatStore from '../store/chatStore';

const INTENT_LABELS = {
  GREETING:           '👋 Greeting',
  LOAN_ENQUIRY:       '🔍 Loan Enquiry',
  APPLICATION_STATUS: '📋 Status Check',
  DOCUMENT_UPLOAD:    '📎 Document Upload',
  EMI_CALCULATOR:     '📊 EMI Calculator',
  UNKNOWN:            '💬 General',
};

export default function AgentStatusBar() {
  const { currentIntent, user, clearSession } = useChatStore();

  return (
    <header className="glass-bar" style={{
      position:   'sticky',
      top:        0,
      height:     '56px',
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding:    '0 1.25rem',
      zIndex:     'var(--z-topbar)',
      flexShrink: 0,
    }}>
      {/* ── Left: Brand ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
          TrustFlow Finance
        </span>
        <span className="online-dot" aria-label="Agent online" />
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent-emerald)', marginLeft: '0.25rem' }}>Online</span>
      </div>

      {/* ── Center: Intent badge ─────────────────────────────────── */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {currentIntent && INTENT_LABELS[currentIntent] && (
          <span className="badge-indigo" style={{ fontSize: 'var(--text-xs)' }}>
            {INTENT_LABELS[currentIntent]}
          </span>
        )}
      </div>

      {/* ── Right: Security + Logout ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          🔒 256-bit Encrypted
        </span>
        {user && (
          <button
            className="btn-ghost glow-target"
            onClick={clearSession}
            style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.75rem' }}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
