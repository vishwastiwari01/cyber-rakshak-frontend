import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import ThreatBadge from '../components/ThreatBadge';
import { api } from '../utils/api';
import Link from 'next/link';

const SCAM_LABELS = {
  otp_scam: 'OTP Scam', kyc_scam: 'KYC Scam', upi_fraud: 'UPI Fraud',
  investment_fraud: 'Investment Fraud', lottery_scam: 'Lottery Scam',
  job_scam: 'Job Scam', phishing: 'Phishing', unknown: 'Unknown'
};

export default function Dashboard() {
  const [overview, setOverview]     = useState(null);
  const [threats, setThreats]       = useState([]);
  const [cases, setCases]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [ov, th, cs] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get('/api/analytics/top-threats'),
        api.get('/api/cases?limit=5')
      ]);
      setOverview(ov);
      setThreats(th.threats || []);
      setCases(cs.cases || []);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const s = overview?.summary || {};

  return (
    <Layout title="SOC Dashboard">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            🛡️ SOC Dashboard
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>
            Security Operations Center — Cyber Rakshak AI Platform
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="pulse-dot" />
          <span style={{ fontSize: 12, color: '#10b981' }}>LIVE</span>
          <Link href="/engage">
            <button style={{
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
              color: '#fff', fontWeight: 600, fontSize: 13
            }}>
              + New Engagement
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: 13 }}>
          ⚠️ {error} — Check your backend URL and JWT token.
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Cases"       value={loading ? '—' : s.total_cases || 0}      icon="📁" color="#06b6d4" />
        <StatCard label="Active Cases"      value={loading ? '—' : s.active_cases || 0}     icon="🔴" color="#ef4444" sub="Ongoing engagements" />
        <StatCard label="Intel Extracted"   value={loading ? '—' : s.total_intelligence || 0} icon="🔍" color="#10b981" sub="Artifacts collected" />
        <StatCard label="Avg Frustration"   value={loading ? '—' : `${s.avg_frustration_score || 0}%`} icon="😤" color="#f59e0b" sub="Scammer frustration" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Reports Generated" value={loading ? '—' : s.total_reports || 0}         icon="📋" color="#a78bfa" />
        <StatCard label="Submitted (NCRP)"  value={loading ? '—' : s.submitted_reports || 0}     icon="⚖️" color="#34d399" />
        <StatCard label="Escalated Cases"   value={loading ? '—' : s.escalated_cases || 0}       icon="🚨" color="#f97316" />
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Top Threats */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: '#f1f5f9', margin: '0 0 16px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            🚨 Top Active Threats
          </h3>
          {threats.length === 0 && !loading && (
            <p style={{ color: '#475569', fontSize: 13 }}>No active threats.</p>
          )}
          {threats.map((c, i) => (
            <Link key={c.id} href={`/cases/${c.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: i < threats.length - 1 ? '1px solid #1e293b' : 'none',
                cursor: 'pointer'
              }}>
                <div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>
                    {SCAM_LABELS[c.scam_type] || 'Unknown'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    {c.channel} · {c.persona_used}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ThreatBadge level={c.threat_level} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Cases */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: 15 }}>📁 Recent Cases</h3>
            <Link href="/cases" style={{ fontSize: 12, color: '#06b6d4', textDecoration: 'none' }}>View all →</Link>
          </div>
          {cases.length === 0 && !loading && (
            <p style={{ color: '#475569', fontSize: 13 }}>No cases yet. Start an engagement.</p>
          )}
          {cases.map((c, i) => (
            <Link key={c.id} href={`/cases/${c.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', borderBottom: i < cases.length - 1 ? '1px solid #1e293b' : 'none'
              }}>
                <div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>
                    {SCAM_LABELS[c.scam_type] || 'New Case'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    {c.id.slice(0, 8)}… · {c.persona_used}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    color: c.status === 'active' ? '#10b981' : '#94a3b8',
                    background: c.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.1)',
                    border: `1px solid ${c.status === 'active' ? '#10b981' : '#334155'}`
                  }}>
                    {c.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Scam Type Distribution */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: '#f1f5f9', margin: '0 0 16px', fontSize: 15 }}>📊 Scam Type Distribution</h3>
          {overview && Object.entries(overview.cases_by_scam_type || {}).map(([type, count]) => {
            const total = s.total_cases || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={type} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{SCAM_LABELS[type] || type}</span>
                  <span style={{ fontSize: 12, color: '#06b6d4', fontWeight: 600 }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#06b6d4,#3b82f6)', borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}
          {!overview && <p style={{ color: '#475569', fontSize: 13 }}>Loading…</p>}
        </div>

        {/* Intelligence Summary */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: '#f1f5f9', margin: '0 0 16px', fontSize: 15 }}>🔍 Intelligence Collected</h3>
          {overview && Object.entries(overview.intelligence_by_type || {}).map(([type, count]) => {
            const icons = {
              phone_number: '📞', upi_id: '💳', bank_account: '🏦',
              url: '🔗', email_address: '📧', ip_address: '🌐', name: '👤'
            };
            return (
              <div key={type} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: '1px solid #1e293b'
              }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>
                  {icons[type] || '🔹'} {type.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{count}</span>
              </div>
            );
          })}
          {!overview && <p style={{ color: '#475569', fontSize: 13 }}>Loading…</p>}
        </div>
      </div>
    </Layout>
  );
}
