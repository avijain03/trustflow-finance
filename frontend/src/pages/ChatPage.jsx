// Purpose: ChatPage — 60/40 split-screen layout
// Left 60%: hero heading + EMI calculator info panel
// Right 40%: chatbot ONLY (AgentStatusBar, ChatWindow, ChatInput)
import React, { useState, useCallback } from 'react';
import AgentStatusBar from '../components/AgentStatusBar';
import ChatWindow     from '../components/ChatWindow';
import ChatInput      from '../components/ChatInput';

/* ── EMI formula ──────────────────────────────────────────────────────────── */
const ANNUAL_RATE = 12; // fixed 12% p.a.

function calcEMI(principal, tenureMonths) {
  const r = ANNUAL_RATE / 12 / 100; // monthly rate
  const n = tenureMonths;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const fmt = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

/* ── Slider component ─────────────────────────────────────────────────────── */
function Slider({ label, value, min, max, step, display, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-accent-emerald)', fontWeight: 600 }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer', height: '4px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {label === 'Loan Amount' ? fmt(min) : `${min} mo`}
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {label === 'Loan Amount' ? fmt(max) : `${max} mo`}
        </span>
      </div>
    </div>
  );
}

/* ── Left panel — info + EMI calculator ──────────────────────────────────── */
function InfoPanel() {
  const [amount,  setAmount]  = useState(500000);   // ₹5,00,000
  const [tenure,  setTenure]  = useState(24);        // 24 months

  const emi          = calcEMI(amount, tenure);
  const totalPayable = emi * tenure;
  const totalInterest = totalPayable - amount;

  return (
    <div style={{
      width:      '60%',
      height:     '100%',
      overflowY:  'auto',
      padding:    '5rem 2.5rem 2.5rem',
      display:    'flex',
      flexDirection: 'column',
      gap:        '2rem',
      position:   'relative',
      zIndex:     1,
    }}>

      {/* ── Hero heading ─────────────────────────────────────────── */}
      <div>
        <h1 style={{
          fontFamily:   'var(--font-display)',
          fontSize:     'clamp(2.25rem, 4vw, 3.25rem)',
          fontWeight:   800,
          color:        '#f1f5f9',
          lineHeight:   1.15,
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
        }}>
          TrustFlow Finance
        </h1>
        <p style={{
          fontFamily:  'var(--font-body)',
          fontSize:    'var(--text-xl)',
          fontWeight:  500,
          color:       '#10b981',
          letterSpacing: '0.01em',
        }}>
          Smart. Secure. Instant.
        </p>
        <p style={{
          fontFamily:  'var(--font-body)',
          fontSize:    'var(--text-base)',
          color:       'var(--color-text-secondary)',
          marginTop:   '1rem',
          lineHeight:  1.65,
          maxWidth:    '480px',
        }}>
          India's AI-powered NBFC lending assistant. Check loan eligibility,
          calculate EMI, upload documents — all in one secure conversation.
        </p>
      </div>

      {/* ── Feature chips ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
        {['🔐 Argon2id Secured', '📊 RBI Compliant', '⚡ 60-second Approval', '🇮🇳 ₹ INR Native'].map(chip => (
          <span key={chip} className="badge-indigo" style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }}>
            {chip}
          </span>
        ))}
      </div>

      {/* ── EMI Calculator card ───────────────────────────────────── */}
      <div className="glass" style={{
        background:    'rgba(15,23,42,0.6)',
        backdropFilter:'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border:        '1px solid rgba(148,163,184,0.12)',
        borderRadius:  '16px',
        boxShadow:     '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        padding:       '1.75rem',
        display:       'flex',
        flexDirection: 'column',
        gap:           '1.5rem',
      }}>
        {/* Section heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '1.25rem' }}>📊</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            EMI Calculator
          </span>
        </div>

        {/* Sliders */}
        <Slider
          label="Loan Amount"
          value={amount}
          min={50000}
          max={2000000}
          step={10000}
          display={fmt(amount)}
          onChange={setAmount}
        />
        <Slider
          label="Tenure"
          value={tenure}
          min={6}
          max={60}
          step={6}
          display={`${tenure} months`}
          onChange={setTenure}
        />

        {/* EMI result */}
        <div style={{
          background:    'rgba(16,185,129,0.06)',
          border:        '1px solid rgba(16,185,129,0.2)',
          borderRadius:  '12px',
          padding:       '1.25rem 1.5rem',
          textAlign:     'center',
        }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: '#94a3b8', marginBottom: '0.375rem' }}>
            Monthly EMI
          </div>
          <div style={{
            fontFamily:  'var(--font-display)',
            fontSize:    'clamp(1.75rem, 3vw, 2.25rem)',
            fontWeight:  700,
            color:       '#10b981',
            lineHeight:  1,
          }}>
            {fmt(Math.round(emi))}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            at {ANNUAL_RATE}% p.a. · {tenure} months
          </div>
        </div>

        {/* Breakdown row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total Interest</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {fmt(Math.round(totalInterest))}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total Payable</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {fmt(Math.round(totalPayable))}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5, textAlign: 'center' }}>
          EMI = [P × R × (1+R)ᴺ] / [(1+R)ᴺ – 1] &nbsp;·&nbsp; R = 12% ÷ 12 monthly
        </p>
      </div>

      {/* ── RBI disclaimer ────────────────────────────────────────── */}
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6, paddingBottom: '1rem' }}>
        ¹ Indicative EMI at flat 12% p.a. Actual rate depends on credit profile.
        This platform is compliant with RBI NBFC guidelines and does not store
        PAN / Aadhaar in plaintext.
      </p>
    </div>
  );
}

/* ── Chat panel — right 40% ───────────────────────────────────────────────── */
function ChatPanel() {
  return (
    <div style={{
      width:       '40%',
      height:      '100%',
      display:     'flex',
      flexDirection: 'column',
      position:    'relative',
      zIndex:      1,
      /* Right border separator */
      borderLeft:  '1px solid rgba(148,163,184,0.08)',
    }}>
      {/* Glassmorphism wrapper for entire chat panel */}
      <div style={{
        flex:            1,
        display:         'flex',
        flexDirection:   'column',
        background:      'rgba(15, 23, 42, 0.6)',
        backdropFilter:  'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border:          '1px solid rgba(148, 163, 184, 0.12)',
        borderRadius:    '0 0 0 0',  /* full-height panel — no outer radius needed */
        boxShadow:       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        overflow:        'hidden',
      }}>
        <AgentStatusBar />
        <ChatWindow />
        <ChatInput />
      </div>
    </div>
  );
}

/* ── Page root ────────────────────────────────────────────────────────────── */
export default function ChatPage() {
  return (
    <div style={{
      display:         'flex',
      flexDirection:   'row',
      height:          '100vh',
      width:           '100vw',
      background:      'var(--color-bg-primary)',
      overflow:        'hidden',
      position:        'relative',
    }}>
      <InfoPanel />
      <ChatPanel />
    </div>
  );
}
