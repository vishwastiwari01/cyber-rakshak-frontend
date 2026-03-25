import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import ThreatBadge from '../../components/ThreatBadge';
import { api } from '../../utils/api';
import Link from 'next/link';

const SCAM_LABELS = {
  otp_scam: 'OTP Scam', kyc_scam: 'KYC Scam', upi_fraud: 'UPI Fraud',
  investment_fraud: 'Investment Fraud', lottery_scam: 'Lottery Scam',
  job_scam: 'Job Scam', phishing: 'Phishing', unknown: 'Unknown'
};

const STATUS_COLORS = {
  active: '#10b981', closed: '#64748b', escalated: '#f97316', reported: '#a78bfa'
};

export default function CasesList() {
  const [cases, setCases]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]     = useState('');

  useEffect(() => { loadCases(); }, [filterStatus, filterType]);

  async function loadCases() {
    setLoading(true);
    try {
      let path = '/api/cases?limit=100';
      if (filterStatus) path += `&status=${filterStatus}`;
      if (filterType)   path += `&scam_type=${filterType}`;
      const { cases } = await api.get(path);
      setCases(cases || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Cases">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>📁 Cases</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>{cases.length} total cases</p>
        </div>
        <Link href="/engage">
          <button style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', color: '#fff', fontWeight: 600, fontSize: 13 }}>
            + New Engagement
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', fontSize: 12 }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="escalated">Escalated</option>
          <option value="closed">Closed</option>
          <option value="reported">Reported</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', fontSize: 12 }}>
          <option value="">All Scam Types</option>
          {Object.entries(SCAM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              {['Case ID', 'Scam Type', 'Status', 'Threat', 'Channel', 'Persona', 'Frustration', 'Created', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#475569' }}>Loading…</td></tr>
            )}
            {!loading && cases.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#475569' }}>No cases found.</td></tr>
            )}
            {cases.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < cases.length - 1 ? '1px solid #1e293b' : 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{c.id.slice(0, 10)}…</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0' }}>{SCAM_LABELS[c.scam_type] || 'Unknown'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[c.status] || '#94a3b8',
                    background: `${STATUS_COLORS[c.status]}22`, border: `1px solid ${STATUS_COLORS[c.status] || '#334155'}`,
                    padding: '2px 8px', borderRadius: 4 }}>
                    {c.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}><ThreatBadge level={c.threat_level} /></td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', textTransform: 'capitalize' }}>{c.channel}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8', textTransform: 'capitalize' }}>{c.persona_used}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ height: 4, width: 60, background: '#1e293b', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${c.scammer_frustration_score || 0}%`, background: '#f59e0b', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#f59e0b' }}>{c.scammer_frustration_score || 0}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 11, color: '#64748b' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/cases/${c.id}`}>
                    <button style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#06b6d4', cursor: 'pointer', fontSize: 12 }}>
                      View →
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
