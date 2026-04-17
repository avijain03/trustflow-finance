// Purpose: TypingIndicator — animated three-dot indicator shown while agents are processing
import React from 'react';

export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.25rem 0', animation: 'fade-in 200ms ease' }}>
      {/* Agent avatar */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--color-accent-indigo), var(--color-accent-indigo-dark))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', color: 'white', fontWeight: 600,
      }}>TF</div>

      <div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.35rem', fontStyle: 'italic' }}>
          TrustFlow is analysing...
        </p>
        <div className="glass-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '0.625rem 1rem' }}>
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
