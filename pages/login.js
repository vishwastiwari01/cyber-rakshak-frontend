import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('cr_token', data.token);
      router.push('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#020617',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ width: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 14px',
            background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32
          }}>🛡️</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>CYBER RAKSHAK AI</h1>
          <p style={{ fontSize: 12, color: '#475569', margin: '6px 0 0', letterSpacing: '0.1em' }}>
            SECURE OPERATIONS ACCESS
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14, padding: 32 }}>
          <h2 style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, margin: '0 0 22px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Analyst Login
          </h2>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="analyst@cyberrakshak.in"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #334155', background: '#0a0f1e',
                  color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #334155', background: '#0a0f1e',
                  color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', borderRadius: 8, border: 'none',
                background: loading ? '#1e293b' : 'linear-gradient(135deg,#06b6d4,#3b82f6)',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Authenticating…' : '🔐 Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#334155', marginTop: 20 }}>
          Authorized personnel only · Cyber Rakshak AI Platform v2.0
        </p>
      </div>
    </div>
  );
}
