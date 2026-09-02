// Purpose: AuthForm — glassmorphism login/register page with client-side Zod validation
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, register } from '../api/auth.api';
import useChatStore from '../store/chatStore';

function validatePhone(p) { return /^\d{10}$/.test(p); }
function validatePassword(p) { return p.length >= 8; }
function getPasswordStrength(p) {
  if (p.length === 0) return null;
  if (p.length < 6)  return { label: 'Weak',   color: 'var(--color-danger)' };
  if (p.length < 10) return { label: 'Fair',   color: 'var(--color-warning)' };
  return                    { label: 'Strong', color: 'var(--color-success)' };
}

export default function AuthForm({ mode = 'login' }) {
  const navigate  = useNavigate();
  const setUser   = useChatStore(s => s.setUser);

  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [fields,   setFields]   = useState({});

  const isRegister = mode === 'register';
  const pwStrength = getPasswordStrength(password);

  const validate = () => {
    const errs = {};
    if (isRegister && name.trim().length < 2)  errs.name     = 'Name must be at least 2 characters';
    if (!validatePhone(phone))                  errs.phone    = 'Phone must be exactly 10 digits';
    if (!validatePassword(password))            errs.password = 'Password must be at least 8 characters';
    setFields(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const data = isRegister
        ? await register(name.trim(), phone, password)
        : await login(phone, password);
      setUser(data);
      navigate('/chat');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '0.25rem' }}>
            TrustFlow Finance
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            {isRegister ? 'Create your lending account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', overflow: 'hidden' }}>
          {[['login', 'Login'], ['register', 'Register']].map(([m, label]) => (
            <Link key={m} to={`/${m}`} replace style={{
              flex: 1, textAlign: 'center', padding: '0.5rem',
              background:  mode === m ? 'var(--color-bg-elevated)' : 'transparent',
              color:       mode === m ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              fontWeight:  mode === m ? 600 : 400,
              fontSize:    'var(--text-sm)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            }}>{label}</Link>
          ))}
        </div>

        {/* Error alert */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem', fontSize: 'var(--text-sm)', color: 'var(--color-danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} noValidate>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>Full Name</label>
              <input className="input-glass" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aarav Sharma" autoComplete="name" />
              {fields.name && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: '0.25rem' }}>{fields.name}</p>}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>Mobile Number</label>
            <input className="input-glass" type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" maxLength={10} autoComplete="tel" />
            {fields.phone && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: '0.25rem' }}>{fields.phone}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>Password</label>
            <input className="input-glass" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete={isRegister ? 'new-password' : 'current-password'} />
            {isRegister && pwStrength && (
              <p style={{ fontSize: 'var(--text-xs)', color: pwStrength.color, marginTop: '0.25rem' }}>
                Strength: {pwStrength.label}
              </p>
            )}
            {fields.password && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: '0.25rem' }}>{fields.password}</p>}
          </div>

          <button className="btn-emerald glow-target" type="submit" disabled={loading} style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {!isRegister && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--color-border)', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              ⚡ Demo Access (Instant Login):
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-glass"
                style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.75rem' }}
                onClick={() => { setPhone('9876543201'); setPassword('Password123!'); }}
              >
                Aarav (9876543201)
              </button>
              <button
                type="button"
                className="btn-glass"
                style={{ fontSize: 'var(--text-xs)', padding: '0.35rem 0.75rem' }}
                onClick={() => { setPhone('9876543202'); setPassword('Password123!'); }}
              >
                Priya (9876543202)
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {isRegister ? 'Already have an account? ' : 'New to TrustFlow? '}
          <Link to={isRegister ? '/login' : '/register'} style={{ color: 'var(--color-accent-indigo)', textDecoration: 'none' }}>
            {isRegister ? 'Sign in' : 'Create Account'}
          </Link>
        </p>
      </div>
    </div>
  );
}
