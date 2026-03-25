import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../utils/api';

const ARTIFACT_ICONS = {
  phone_number: '📞', upi_id: '💳', bank_account: '🏦',
  url: '🔗', email_address: '📧', ip_address: '🌐', name: '👤'
};

export default function Intelligence() {
  const [items, setItems]         = useState([]);
  const [stats, setStats]         = useState(null);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading]     = useState(true);
  const [enrichTarget, setEnrichTarget] = useState({ type: '', value: '' });
  const [enrichResult, setEnrichResult] = useState(null);
  const [enriching, setEnriching] = useState(false);

  useEffect(() => { loadData(); }, [filterType]);

  async function loadData() {
    setLoading(true);
    try {
      const path = filterType ? `/api/intelligence?artifact_type=${filterType}&limit=200` : '/api/intelligence?limit=200';
      const [intelRes, statsRes] = await Promise.all([
        api.get(path),
        api.get('/api/intelligence/stats')
      ]);
      setItems(intelRes.intelligence || []);
      setStats(statsRes);
    } finally {
      setLoading(false);
    }
  }

  async function runEnrichment() {
    if (!enrichTarget.type || !enrichTarget.value) return;
    setEnriching(true);
    setEnrichResult(null);
    try {
      const res = await api.post('/api/intelligence/enrich', enrichTarget);
      setEnrichResult(res.enrichment);
    } catch (e) {
      setEnrichResult({ error: e.message });
    } finally {
      setEnriching(false);
    }
  }

  return (
    <Layout title="Intelligence">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>🔍 Intelligence Database</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>All extracted artifacts across all cases</p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Artifacts', value: stats.total, icon: '🔹', color: '#06b6d4' },
            { label: 'Phone Numbers',   value: stats.by_type?.phone_number || 0, icon: '📞', color: '#10b981' },
            { label: 'UPI IDs',         value: stats.by_type?.upi_id || 0,       icon: '💳', color: '#f59e0b' },
            { label: 'URLs',            value: stats.by_type?.url || 0,          icon: '🔗', color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Main table */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', fontSize: 12 }}>
              <option value="">All Artifact Types</option>
              {Object.keys(ARTIFACT_ICONS).map(k => <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>)}
            </select>
            <span style={{ marginLeft: 10, fontSize: 12, color: '#475569' }}>{items.length} results</span>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  {['Type', 'Value', 'Confidence', 'Enrichment', 'Case', 'Extracted'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} style={{ padding: 24, color: '#475569', textAlign: 'center' }}>Loading…</td></tr>}
                {!loading && items.length === 0 && <tr><td colSpan={6} style={{ padding: 24, color: '#475569', textAlign: 'center' }}>No artifacts found.</td></tr>}
                {items.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: i < items.length - 1 ? '1px solid #0f172a' : 'none' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                        {ARTIFACT_ICONS[a.artifact_type]} {a.artifact_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.value}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#f59e0b' }}>
                      {Math.round((a.confidence || 1) * 100)}%
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#64748b' }}>
                      {a.enrichment?.country ? `📍 ${a.enrichment.country}` : ''}
                      {a.enrichment?.safe === false ? '🚨 Unsafe' : ''}
                      {a.enrichment?.telecom ? a.enrichment.telecom.split(' ')[0] : ''}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                      {a.case_id?.slice(0, 8)}…
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 11, color: '#475569' }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* OSINT Enrichment panel */}
        <div>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 16px', fontSize: 15 }}>🌐 On-demand OSINT</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 6 }}>TYPE</label>
              <select value={enrichTarget.type} onChange={e => setEnrichTarget(t => ({ ...t, type: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #334155', background: '#0a0f1e', color: '#94a3b8', fontSize: 12 }}>
                <option value="">Select type…</option>
                <option value="phone_number">Phone Number</option>
                <option value="ip_address">IP Address</option>
                <option value="url">URL</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 6 }}>VALUE</label>
              <input
                value={enrichTarget.value}
                onChange={e => setEnrichTarget(t => ({ ...t, value: e.target.value }))}
                placeholder="e.g. 9876543210"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #334155', background: '#0a0f1e', color: '#e2e8f0', fontSize: 12, boxSizing: 'border-box' }}
              />
            </div>
            <button onClick={runEnrichment} disabled={enriching || !enrichTarget.type || !enrichTarget.value}
              style={{ width: '100%', padding: '9px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              {enriching ? 'Looking up…' : '🔍 Run Enrichment'}
            </button>

            {enrichResult && (
              <div style={{ marginTop: 16, padding: 14, background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#06b6d4', marginBottom: 8, fontWeight: 600 }}>ENRICHMENT RESULT</div>
                <pre style={{ fontSize: 11, color: '#94a3b8', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {JSON.stringify(enrichResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
