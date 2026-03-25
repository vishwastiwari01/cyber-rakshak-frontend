import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { api } from '../utils/api';

const TYPE_COLORS = {
  fir_ready: '#ef4444', ncrp: '#f97316', standard: '#06b6d4', summary: '#a78bfa'
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refInput, setRefInput] = useState('');

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    try {
      const { reports } = await api.get('/api/reports');
      setReports(reports || []);
    } finally {
      setLoading(false);
    }
  }

  async function viewReport(r) {
    const full = await api.get(`/api/reports/${r.id}`);
    setSelected(full.report);
  }

  async function submitReport(id) {
    setSubmitting(true);
    try {
      await api.patch(`/api/reports/${id}/submit`, { submission_ref: refInput || `NCRP-${Date.now()}` });
      loadReports();
      if (selected?.id === id) {
        const full = await api.get(`/api/reports/${id}`);
        setSelected(full.report);
      }
      setRefInput('');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function downloadJSON(report) {
    const blob = new Blob([JSON.stringify(report.content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.content?.report_id || report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout title="Reports">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>📋 Evidence Reports</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>FIR-ready and NCRP-compatible evidence packages</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
        {/* Report list */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e293b' }}>
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{reports.length} Reports</span>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 580 }}>
            {loading && <div style={{ padding: 24, color: '#475569', fontSize: 13 }}>Loading…</div>}
            {!loading && reports.length === 0 && (
              <div style={{ padding: 24, color: '#475569', fontSize: 13 }}>
                No reports yet. Generate reports from individual cases.
              </div>
            )}
            {reports.map((r, i) => (
              <div key={r.id}
                onClick={() => viewReport(r)}
                style={{
                  padding: '14px 18px',
                  borderBottom: i < reports.length - 1 ? '1px solid #1e293b' : 'none',
                  cursor: 'pointer',
                  background: selected?.id === r.id ? 'rgba(6,182,212,0.07)' : 'transparent',
                  borderLeft: selected?.id === r.id ? '2px solid #06b6d4' : '2px solid transparent',
                  transition: 'all 0.1s'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                      color: TYPE_COLORS[r.report_type] || '#94a3b8',
                      background: (TYPE_COLORS[r.report_type] || '#94a3b8') + '22',
                      border: `1px solid ${TYPE_COLORS[r.report_type] || '#334155'}`
                    }}>
                      {r.report_type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, fontFamily: 'monospace' }}>
                      {r.id.slice(0, 14)}…
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {r.submitted
                      ? <span style={{ fontSize: 10, color: '#10b981' }}>✅ Submitted</span>
                      : <span style={{ fontSize: 10, color: '#475569' }}>Pending</span>}
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report viewer */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ padding: 40, color: '#475569', textAlign: 'center', fontSize: 13 }}>
              Select a report to view its contents
            </div>
          ) : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>
                    {selected.content?.report_id || selected.id}
                  </span>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    Generated {new Date(selected.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => downloadJSON(selected)}
                    style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>
                    ⬇️ Download JSON
                  </button>
                  {!selected.submitted && (
                    <button onClick={() => submitReport(selected.id)} disabled={submitting}
                      style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      {submitting ? 'Submitting…' : '⚖️ Mark as Submitted'}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ padding: 20, overflowY: 'auto', maxHeight: 520 }}>
                {/* Case summary section */}
                {selected.content?.case && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ color: '#06b6d4', margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Case Summary
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {Object.entries(selected.content.case).slice(0, 9).map(([k, v]) => (
                        <div key={k} style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ fontSize: 10, color: '#64748b', marginBottom: 3 }}>{k.replace(/_/g, ' ')}</div>
                          <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                            {String(v).slice(0, 40)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Intelligence extracted */}
                {selected.content?.intelligence_extracted && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ color: '#10b981', margin: '0 0 12px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Intelligence Extracted
                    </h4>
                    {Object.entries(selected.content.intelligence_extracted).map(([type, values]) => (
                      <div key={type} style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{type.replace(/_/g, ' ')}:</span>
                        <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {values.map((v, i) => (
                            <span key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(6,182,212,0.2)' }}>
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Legal section */}
                {selected.content?.legal && (
                  <div style={{ marginBottom: 20, padding: 16, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
                    <h4 style={{ color: '#ef4444', margin: '0 0 12px', fontSize: 13 }}>⚖️ Legal Reference</h4>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>APPLICABLE SECTIONS</div>
                      {selected.content.legal.applicable_sections.map((s, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#fca5a5', marginBottom: 2 }}>• {s}</div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>NCRP CATEGORY</div>
                      <div style={{ fontSize: 12, color: '#e2e8f0' }}>{selected.content.legal.ncrp_category}</div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>HELPLINE</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#f97316' }}>{selected.content.legal.helpline}</div>
                    </div>
                  </div>
                )}

                {/* Raw JSON toggle */}
                <details>
                  <summary style={{ color: '#64748b', fontSize: 12, cursor: 'pointer', marginBottom: 8 }}>
                    {} View raw JSON
                  </summary>
                  <pre style={{ fontSize: 10, color: '#64748b', background: '#0a0f1e', padding: 14, borderRadius: 8, overflow: 'auto', maxHeight: 300, lineHeight: 1.5 }}>
                    {JSON.stringify(selected.content, null, 2)}
                  </pre>
                </details>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
