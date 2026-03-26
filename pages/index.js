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

const STATUS_STYLE = {
  active:    { color: '#00d68f', bg: 'rgba(0,214,143,0.08)',   border: 'rgba(0,214,143,0.2)' },
  escalated: { color: '#ff6b35', bg: 'rgba(255,107,53,0.08)', border: 'rgba(255,107,53,0.2)' },
  closed:    { color: '#4a5568', bg: 'rgba(74,85,104,0.08)',   border: 'rgba(74,85,104,0.2)' },
  reported:  { color: '#9b72ff', bg: 'rgba(155,114,255,0.08)', border: 'rgba(155,114,255,0.2)' },
};

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{title}</span>
      {action}
    </div>
  );
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [threats, setThreats]   = useState([]);
  const [cases, setCases]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    try {
      const [ov, th, cs] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get('/api/analytics/top-threats'),
        api.get('/api/cases?limit=5'),
      ]);
      setOverview(ov); setThreats(th.threats || []); setCases(cs.cases || []);
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const s = overview?.summary || {};

  return (
    <Layout>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.1em', marginBottom: 4 }}>SECURITY OPERATIONS CENTER</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-0)', margin: 0, lineHeight: 1.2 }}>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className="dot-live" />
            <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>LIVE</span>
          </div>
          <Link href="/engage">
            <button style={{
              padding: '8px 18px', borderRadius: 6, border: '1px solid var(--accent-b)',
              background: 'var(--accent-d)', color: 'var(--accent)',
              fontWeight: 600, fontSize: 12, cursor: 'pointer',
              letterSpacing: '0.04em', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-b)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-d)'; }}
            >
              + New Engagement
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,61,87,0.08)', border: '1px solid rgba(255,61,87,0.2)', borderRadius: 6, padding: '10px 14px', marginBottom: 20, color: 'var(--red)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          ERR: {error}
        </div>
      )}

      {/* Stats row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
        <StatCard label="Total Cases"     value={loading ? '—' : s.total_cases || 0}          accent />
        <StatCard label="Active"          value={loading ? '—' : s.active_cases || 0}         sub="Ongoing engagements" />
        <StatCard label="Intel Collected" value={loading ? '—' : s.total_intelligence || 0}   sub="Artifacts extracted" />
        <StatCard label="Avg Frustration" value={loading ? '—' : `${s.avg_frustration_score || 0}%`} sub="Scammer frustration score" />
      </div>

      {/* Stats row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Reports Generated" value={loading ? '—' : s.total_reports || 0}      dim />
        <StatCard label="Submitted to NCRP" value={loading ? '—' : s.submitted_reports || 0} dim />
        <StatCard label="Escalated"         value={loading ? '—' : s.escalated_cases || 0}   dim />
      </div>

      {/* Two column section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Top Threats */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
          <SectionHeader title="Active Threats" />
          {threats.length === 0 && !loading && (
            <div style={{ padding: '20px 0', color: 'var(--text-2)', fontSize: 12, textAlign: 'center' }}>No active threats detected</div>
          )}
          {threats.map((c, i) => (
            <Link key={c.id} href={`/cases/${c.id}`}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < threats.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-0)', fontWeight: 500, marginBottom: 2 }}>
                    {SCAM_LABELS[c.scam_type] || 'Unknown'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                    {c.channel} · {c.persona_used}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ThreatBadge level={c.threat_level} />
                  <span style={{ fontSize: 11, color: 'var(--text-2)' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Cases */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
          <SectionHeader
            title="Recent Cases"
            action={<Link href="/cases"><span style={{ fontSize: 11, color: 'var(--accent)', cursor: 'pointer' }}>View all →</span></Link>}
          />
          {cases.length === 0 && !loading && (
            <div style={{ padding: '20px 0', color: 'var(--text-2)', fontSize: 12, textAlign: 'center' }}>No cases yet — start an engagement</div>
          )}
          {cases.map((c, i) => (
            <Link key={c.id} href={`/cases/${c.id}`}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < cases.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-0)', fontWeight: 500, marginBottom: 2 }}>
                    {SCAM_LABELS[c.scam_type] || 'New Case'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                    {c.id.slice(0, 10)}…
                  </div>
                </div>
                {(() => {
                  const st = STATUS_STYLE[c.status] || STATUS_STYLE.closed;
                  return (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                      fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                      color: st.color, background: st.bg, border: `1px solid ${st.border}`,
                    }}>
                      {c.status.toUpperCase()}
                    </span>
                  );
                })()}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Scam distribution */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
          <SectionHeader title="Scam Type Distribution" />
          {overview && Object.entries(overview.cases_by_scam_type || {}).length === 0 && (
            <div style={{ color: 'var(--text-2)', fontSize: 12 }}>No data yet</div>
          )}
          {overview && Object.entries(overview.cases_by_scam_type || {}).map(([type, count]) => {
            const pct = Math.round((count / (s.total_cases || 1)) * 100);
            return (
              <div key={type} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-1)' }}>{SCAM_LABELS[type] || type}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{count} / {pct}%</span>
                </div>
                <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 2, opacity: 0.7, transition: 'width 0.6s' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Intel summary */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
          <SectionHeader title="Intelligence Collected" />
          {overview && Object.entries(overview.intelligence_by_type || {}).map(([type, count]) => (
            <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-1)', textTransform: 'capitalize' }}>
                {type.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                {count}
              </span>
            </div>
          ))}
          {(!overview || Object.keys(overview.intelligence_by_type || {}).length === 0) && (
            <div style={{ color: 'var(--text-2)', fontSize: 12 }}>No artifacts extracted yet</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
