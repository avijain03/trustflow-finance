// Purpose: GreetingBanner — opening message card with animated border and brand identity
import React from 'react';

export default function GreetingBanner({ userName }) {
  return (
    <div className="animated-border" style={{ borderRadius: 'var(--radius-lg)', marginTop: '0.625rem' }}>
      <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏦</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
          Welcome to TrustFlow Finance{userName && userName !== 'there' ? `, ${userName}` : ''}
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
          I'm your AI lending assistant. Ask me about loans, EMIs, or upload your documents.
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          "Where Trust Meets Capital"
        </p>
      </div>
    </div>
  );
}
