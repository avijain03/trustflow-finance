// Purpose: LoanStatusCard — renders APPROVE / REJECT / MANUAL_REVIEW inside a chat bubble
import React from 'react';

export default function LoanStatusCard({ decision, reasonCode, reasonMessage, eligibleAmount, eligibleAmountFormatted }) {
  if (decision === 'APPROVE') {
    return (
      <div className="glass-success" style={{ padding: '1.25rem', marginTop: '0.625rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="badge-emerald">✓ Pre-Approved</span>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-accent-emerald)', marginBottom: '0.25rem' }}>
          {eligibleAmountFormatted || eligibleAmount}
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Subject to document verification
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-emerald glow-target">Proceed to Application →</button>
          <button className="btn-ghost glow-target">Learn More</button>
        </div>
      </div>
    );
  }

  if (decision === 'REJECT') {
    return (
      <div className="glass-danger" style={{ padding: '1.25rem', marginTop: '0.625rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="badge-danger">✕ Application Unsuccessful</span>
          {reasonCode && <span className="badge-danger" style={{ opacity: 0.7 }}>{reasonCode}</span>}
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
          {reasonMessage}
        </p>
        <button className="btn-indigo glow-target">Speak to Our Advisor</button>
      </div>
    );
  }

  if (decision === 'MANUAL_REVIEW') {
    return (
      <div className="glass-warning" style={{ padding: '1.25rem', marginTop: '0.625rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="badge-warning">⏳ Under Review</span>
        </div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
          {reasonMessage || 'Our team will contact you within 24 business hours with a decision.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {['Application Submitted', 'Under Manual Review', 'Decision (within 24h)'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: i === 1 ? 'var(--color-warning)' : 'var(--color-bg-elevated)', border: '2px solid', borderColor: i === 0 ? 'var(--color-accent-emerald)' : i === 1 ? 'var(--color-warning)' : 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>
                {i === 0 ? '✓' : i === 1 ? '⏳' : '○'}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: i === 1 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
