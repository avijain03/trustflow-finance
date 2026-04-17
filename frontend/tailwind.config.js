// Purpose: Tailwind CSS v3 config — extends with TrustFlow Finance design tokens
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        trustflow: {
          'bg-primary':    '#020617',
          'bg-surface':    '#0f172a',
          'bg-elevated':   '#1e293b',
          'emerald':       '#10b981',
          'emerald-dark':  '#059669',
          'indigo':        '#6366f1',
          'indigo-dark':   '#4f46e5',
          'danger':        '#ef4444',
          'warning':       '#f59e0b',
          'success':       '#10b981',
        },
        text: {
          'primary':   '#f1f5f9',
          'secondary': '#94a3b8',
          'muted':     '#475569',
        },
      },
      fontFamily: {
        display: ['Syne',           'sans-serif'],
        body:    ['DM Sans',        'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
        sans:    ['DM Sans',        'sans-serif'],
      },
      fontSize: {
        'display': ['3rem',     { lineHeight: '1.15' }],
        '3xl':     ['1.875rem', { lineHeight: '1.25' }],
        '2xl':     ['1.5rem',   { lineHeight: '1.25' }],
        'xl':      ['1.25rem',  { lineHeight: '1.35' }],
        'lg':      ['1.125rem', { lineHeight: '1.45' }],
        'base':    ['1rem',     { lineHeight: '1.5'  }],
        'sm':      ['0.875rem', { lineHeight: '1.5'  }],
        'xs':      ['0.75rem',  { lineHeight: '1.5'  }],
      },
      borderRadius: {
        'sm':   '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '20px',
        '2xl':  '24px',
        'full': '9999px',
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'glass':       '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-hover': '0 8px 32px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
        'emerald':     '0 4px 14px rgba(16,185,129,0.3)',
        'indigo':      '0 4px 14px rgba(99,102,241,0.3)',
        'glow-emerald':'0 0 20px rgba(16,185,129,0.2)',
        'glow-indigo': '0 0 20px rgba(99,102,241,0.2)',
      },
      backgroundImage: {
        'gradient-emerald': 'linear-gradient(135deg, #10b981, #059669)',
        'gradient-indigo':  'linear-gradient(135deg, #6366f1, #4f46e5)',
        'gradient-user-bubble': 'linear-gradient(135deg, #10b981, #059669)',
      },
      animation: {
        'typing-bounce': 'typing-bounce 1.2s ease-in-out infinite',
        'pulse-ring':    'pulse-ring 1.5s ease-out infinite',
        'rotate-gradient': 'rotate-gradient 4s linear infinite',
        'fade-in':       'fade-in 200ms ease',
        'slide-up':      'slide-up 200ms ease',
      },
      keyframes: {
        'typing-bounce': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%':           { transform: 'translateY(-6px)', opacity: '1' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',   opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0'   },
        },
        'rotate-gradient': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
