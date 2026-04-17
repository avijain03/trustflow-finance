// Purpose: MessageBubble — renders user and agent messages with glassmorphism UI component support
import React, { useState } from 'react';
import LoanStatusCard    from './LoanStatusCard';
import EMIBreakdownTable from './EMIBreakdownTable';
import GreetingBanner    from './GreetingBanner';

const UI_COMPONENTS = {
  LoanStatusCard,
  EMIBreakdownTable,
  GreetingBanner,
};

export default function MessageBubble({ message }) {
  const [showTime, setShowTime] = useState(false);
  const { role, content, uiComponent, uiProps = {}, agentUsed = [], timestamp } = message;

  const isUser  = role === 'user';
  const UiComp  = uiComponent ? UI_COMPONENTS[uiComponent] : null;
  const agentName = agentUsed?.[0] || 'TrustFlow';

  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  isUser ? 'row-reverse' : 'row',
        alignItems:     'flex-start',
        gap:            '0.625rem',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animation:      'slide-up 200ms ease',
      }}
      onMouseEnter={() => setShowTime(true)}
      onMouseLeave={() => setShowTime(false)}
    >
      {/* ── Avatar ─────────────────────────────────────────────── */}
      {!isUser && (
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--color-accent-indigo), var(--color-accent-indigo-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.65rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)',
        }}>TF</div>
      )}

      <div style={{ maxWidth: isUser ? '70%' : '75%', display: 'flex', flexDirection: 'column' }}>
        {/* ── Agent label ─────────────────────────────────────── */}
        {!isUser && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.3rem', fontFamily: 'var(--font-body)' }}>
            TrustFlow · {agentName}
          </p>
        )}

        {/* ── Bubble ──────────────────────────────────────────── */}
        {isUser ? (
          <div style={{
            background:   'var(--gradient-user-bubble, linear-gradient(135deg, #10b981, #059669))',
            borderRadius: '18px 18px 4px 18px',
            padding:      '0.625rem 1rem',
            color:        'white',
            fontFamily:   'var(--font-body)',
            fontSize:     '0.9rem',
            lineHeight:   1.5,
            wordBreak:    'break-word',
            boxShadow:    '0 4px 12px rgba(16,185,129,0.2)',
          }}>
            {content}
          </div>
        ) : (
          <div className="glass-indigo" style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', lineHeight: 1.6, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
            {/* Render markdown-lite bold */}
            {content.split(/\*\*([^*]+)\*\*/g).map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
            {/* UI Component below text */}
            {UiComp && <UiComp {...uiProps} />}
          </div>
        )}

        {/* ── Timestamp on hover ───────────────────────────────── */}
        {showTime && timestamp && (
          <p style={{
            fontSize:  '0.7rem',
            color:     'var(--color-text-muted)',
            marginTop: '0.25rem',
            textAlign: isUser ? 'right' : 'left',
            fontFamily:'var(--font-body)',
          }}>
            {new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}
