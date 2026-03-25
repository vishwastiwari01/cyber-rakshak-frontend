import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../utils/api';

const BAR_COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#f97316', '#a78bfa', '#ec4899', '#84cc16'];

const SCAM_LABELS = {
  otp_scam: 'OTP Scam', kyc_scam: 'KYC Scam', upi_fraud: 'UPI Fraud',
  investment_fraud: 'Investment', lottery_scam: 'Lottery',
  job_scam: 'Job Scam', phishing: 'Phishing', unknown: 'Unknown'
};

function BarChart({ data, label, colorKey }) {
  if (!data || Object.keys(data).length === 0) {
    return <div style={{ color: '#475569', fontSize: 12 }}>No data yet.</div>;
  }
  const max = Math.max(...Object.values(data)) || 1;
  return (
    <div>
      {Object.entries(data).map(([k, v], i) => (
        <div key={k} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{label ? (label[k] || k) : k}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: BAR_COLORS[i % BAR_COLORS.length] }}>{v}</span>
          </div>
          <div style={{ height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4,
              width: `${(v / max) * 100}%`,
              background: BAR_COLORS[i % BAR_COLORS.length],
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, size = 140 }) {
  if (!data || Object.keys(data).length === 0) return null;
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(data);
  let cumulative = 0;
  const segments = entries.map(([k, v], i) => {
    const pct = v / total;
    const start = cumulative;
    cumulative += pct;
    return { key: k, pct, start, color: BAR_COLORS[i % BAR_COLORS.length] };
  });

  const r = 50, cx = size / 2, cy = size / 2, stroke = 20;
  function arcPath(start, end) {
    const s = start * 2 * Math.PI - Math.PI / 2;
    const e = end * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = (end - start) > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((s, i) => (
        <path key={i} d={arcPath(s.start, s.start + s.pct)}
          fill="none" stroke={s.color} strokeWidth={stroke}
          strokeLinecap="butt" opacity={0.85} />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="700">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="9">TOTAL</text>
    </svg>
  );
}

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/api/analytics/overview')
      .then(d => { setOverview(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const s = overview?.summary || {};

  // Sort daily trend
  const dailyEntries = overview
    ? Object.entries(overview.daily_trend || {}).sort(([a], [b]) => a.localeCompare(b))
    : [];

  return (
    <Layout title="Analytics">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>📊 Analytics</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>Platform-wide statistics and trends</p>
      </div>

      {loading && <div style={{ color: '#475569', padding: 40 }}>Loading analytics…</div>}

      {!loading && overview && (
        <>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Total Cases',        value: s.total_cases || 0,         color: '#06b6d4', icon: '📁' },
              { label: 'Active',             value: s.active_cases || 0,        color: '#ef4444', icon: '🔴' },
              { label: 'Escalated',          value: s.escalated_cases || 0,     color: '#f97316', icon: '🚨' },
              { label: 'Reports Filed',      value: s.submitted_reports || 0,   color: '#10b981', icon: '⚖️' },
              { label: 'Avg Frustration',    value: `${s.avg_frustration_score || 0}%`, color: '#f59e0b', icon: '😤' },
            ].map(k => (
              <div key={k.label} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{k.icon} {k.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Scam type breakdown */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
              <h3 style={{ color: '#f1f5f9', margin: '0 0 6px', fontSize: 14 }}>Scam Type Breakdown</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18 }}>
                <DonutChart data={overview.cases_by_scam_type} />
                <div style={{ flex: 1 }}>
                  {Object.entries(overview.cases_by_scam_type || {}).slice(0, 4).map(([k, v], i) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: BAR_COLORS[i] }} />
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{SCAM_LABELS[k] || k}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginLeft: 'auto' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <BarChart data={overview.cases_by_scam_type} label={SCAM_LABELS} />
            </div>

            {/* Threat level distribution */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
              <h3 style={{ color: '#f1f5f9', margin: '0 0 18px', fontSize: 14 }}>Threat Level Distribution</h3>
              {Object.entries(overview.cases_by_threat_level || {}).map(([level, count]) => {
                const threatColors = { 1: '#10b981', 2: '#84cc16', 3: '#f59e0b', 4: '#f97316', 5: '#ef4444' };
                const labels = { 1: 'Low', 2: 'Guarded', 3: 'Elevated', 4: 'High', 5: 'Critical' };
                const total = s.total_cases || 1;
                const pct = Math.round((count / total) * 100);
                const color = threatColors[level];
                return (
                  <div key={level} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color }}>T{level} — {labels[level]}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 10, background: '#1e293b', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 5, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Intelligence by type */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
              <h3 style={{ color: '#f1f5f9', margin: '0 0 18px', fontSize: 14 }}>Intelligence by Type</h3>
              <BarChart data={overview.intelligence_by_type} />
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #1e293b' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>TOTAL ARTIFACTS</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{s.total_intelligence || 0}</div>
              </div>
            </div>
          </div>

          {/* 7-day trend */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 18px', fontSize: 14 }}>📈 Cases — Last 7 Days</h3>
            {dailyEntries.length === 0 ? (
              <p style={{ color: '#475569', fontSize: 13 }}>No cases in the last 7 days.</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                {dailyEntries.map(([date, count]) => {
                  const maxVal = Math.max(...dailyEntries.map(([, v]) => v)) || 1;
                  const heightPct = (count / maxVal) * 100;
                  return (
                    <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10, color: '#06b6d4', fontWeight: 700 }}>{count}</span>
                      <div style={{
                        width: '100%', background: 'linear-gradient(180deg,#06b6d4,#3b82f6)',
                        borderRadius: '4px 4px 0 0', height: `${heightPct}%`, minHeight: 4,
                        transition: 'height 0.5s'
                      }} />
                      <span style={{ fontSize: 9, color: '#475569' }}>{date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
