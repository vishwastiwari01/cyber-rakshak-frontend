import { useState } from 'react';
import { useRouter } from 'next/router';

function ShieldIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('cr_token', data.token);
      router.push('/');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 6,
    border: '1px solid var(--border)', background: 'var(--bg-3)',
    color: 'var(--text-0)', fontSize: 13, outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

      {/* Subtle grid bg */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ width: 380, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, var(--accent-d), var(--accent-b))',
            border: '1px solid var(--accent-b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)',
          }}>
            <ShieldIcon />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-0)', letterSpacing: '0.06em' }}>CYBER RAKSHAK AI</div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4, letterSpacing: '0.12em' }}>SECURE OPERATIONS ACCESS</div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '28px 28px 24px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}>
          {/* Terminal top bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff3d57', opacity: 0.7 }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffb800', opacity: 0.7 }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00d68f', opacity: 0.7 }} />
            <span style={{ fontSize: 11, color: 'var(--text-2)', marginLeft: 6, fontFamily: 'var(--font-mono)' }}>analyst_auth.sh</span>
          </div>

          {error && (
            <div style={{ background: 'rgba(255,61,87,0.08)', border: '1px solid rgba(255,61,87,0.2)', borderRadius: 6, padding: '9px 12px', marginBottom: 16, color: 'var(--red)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              ERR: {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '0.08em', fontWeight: 600 }}>
                EMAIL
              </label>
              <input
                type="email" value={email} required
                onChange={e => setEmail(e.target.value)}
                placeholder="analyst@cyberrakshak.in"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-b)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 10, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '0.08em', fontWeight: 600 }}>
                PASSWORD
              </label>
              <input
                type="password" value={password} required
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent-b)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', borderRadius: 6, border: 'none',
              background: loading ? 'var(--bg-3)' : 'linear-gradient(135deg, #0090c8, #00c8ff)',
              color: loading ? 'var(--text-2)' : '#fff',
              fontWeight: 700, fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.06em', transition: 'opacity 0.2s',
            }}>
              {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-3)', marginTop: 16, letterSpacing: '0.05em' }}>
          Authorized personnel only · Cyber Rakshak AI Platform v2.0
        </div>
      </div>
    </div>
  );
}
