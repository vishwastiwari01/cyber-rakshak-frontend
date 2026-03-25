import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ThreatBadge from '../../components/ThreatBadge';
import { api } from '../../utils/api';

const SCAM_LABELS = {
  otp_scam: 'OTP Scam', kyc_scam: 'KYC Scam', upi_fraud: 'UPI Fraud',
  investment_fraud: 'Investment Fraud', lottery_scam: 'Lottery Scam',
  job_scam: 'Job Scam', phishing: 'Phishing', unknown: 'Unknown'
};

const ARTIFACT_ICONS = {
  phone_number: '📞', upi_id: '💳', bank_account: '🏦',
  url: '🔗', email_address: '📧', ip_address: '🌐', name: '👤'
};

export default function CaseDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('messages');
  const [generating, setGenerating] = useState(false);

  useEffect(() => { if (id) loadCase(); }, [id]);

  async function loadCase() {
    try {
      const d = await api.get(`/api/cases/${id}`);
      setData(d);
    } finally {
      setLoading(false);
    }
  }

  async function generateReport(type) {
    setGenerating(true);
    try {
      await api.post('/api/reports/generate', { case_id: id, report_type: type });
      alert(`${type} report generated! Check the Reports section.`);
      loadCase();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function updateStatus(status) {
    await api.patch(`/api/cases/${id}`, { status });
    loadCase();
  }

  if (loading) return <Layout><div style={{ color: '#64748b', padding: 40 }}>Loading case…</div></Layout>;
  if (!data) return <Layout><div style={{ color: '#ef4444', padding: 40 }}>Case not found.</div></Layout>;

  const { case: c, messages, intelligence, reports } = data;
  const TABS = [
    { id: 'messages',     label: `💬 Messages (${messages.length})` },
    { id: 'intelligence', label: `🔍 Intelligence (${intelligence.length})` },
    { id: 'reports',      label: `📋 Reports (${reports.length})` },
    { id: 'raw',          label: '{}  Raw JSON' }
  ];

  return (
    <Layout title={`Case ${id?.slice(0, 8)}`}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
          <button onClick={() => router.push('/cases')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>
            ← Cases
          </button>
          <span style={{ color: '#334155' }}>/</span>
          <span style={{ color: '#94a3b8', fontSize: 13, fontFamily: 'monospace' }}>{id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
              {SCAM_LABELS[c.scam_type] || 'Unknown Scam'} Case
            </h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
              <ThreatBadge level={c.threat_level} />
              <span style={{ fontSize: 12, color: '#64748b' }}>{c.channel} · {c.persona_used} · Created {new Date(c.created_at).toLocaleString()}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {c.status !== 'escalated' && (
              <button onClick={() => updateStatus('escalated')} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.08)', color: '#f97316', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                🚨 Escalate
              </button>
            )}
            {c.status !== 'closed' && (
              <button onClick={() => updateStatus('closed')} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid #334155', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 12 }}>
                Close
              </button>
            )}
            <button onClick={() => generateReport('fir_ready')} disabled={generating} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              {generating ? 'Generating…' : '📋 Generate FIR Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Messages', value: messages.length, icon: '💬' },
          { label: 'Artifacts', value: intelligence.length, icon: '🔍' },
          { label: 'Frustration', value: `${c.scammer_frustration_score || 0}%`, icon: '😤' },
          { label: 'Reports', value: reports.length, icon: '📋' }
        ].map(s => (
          <div key={s.label} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#06b6d4' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #1e293b', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 16px', border: 'none', borderBottom: `2px solid ${tab === t.id ? '#06b6d4' : 'transparent'}`,
            background: 'transparent', color: tab === t.id ? '#06b6d4' : '#64748b', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 600 : 400
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>

        {tab === 'messages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && <p style={{ color: '#475569' }}>No messages yet.</p>}
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 70, fontSize: 10, color: m.role === 'scammer' ? '#fca5a5' : m.role === 'ai' ? '#06b6d4' : '#64748b', textAlign: 'right', marginTop: 3 }}>
                  {m.role === 'scammer' ? '⚠️ SCAMMER' : m.role === 'ai' ? '🤖 AI' : 'SYS'}
                </div>
                <div style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8, fontSize: 13, lineHeight: 1.6,
                  background: m.role === 'scammer' ? 'rgba(239,68,68,0.08)' : m.role === 'ai' ? '#1e293b' : '#0a0f1e',
                  border: `1px solid ${m.role === 'scammer' ? 'rgba(239,68,68,0.2)' : '#1e293b'}`,
                  color: '#e2e8f0'
                }}>
                  {m.content}
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>
                    {new Date(m.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'intelligence' && (
          <div>
            {intelligence.length === 0 && <p style={{ color: '#475569' }}>No artifacts extracted yet.</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {intelligence.map((a, i) => (
                <div key={i} style={{ padding: '14px 16px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{ARTIFACT_ICONS[a.artifact_type] || '🔹'}</span>
                    <span style={{ fontSize: 11, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      {a.artifact_type.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: 10, color: '#64748b', marginLeft: 'auto' }}>
                      {Math.round(a.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 6 }}>
                    {a.value}
                  </div>
                  {a.enrichment && Object.keys(a.enrichment).length > 0 && (
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {a.enrichment.country && `📍 ${a.enrichment.city ? a.enrichment.city + ', ' : ''}${a.enrichment.country}`}
                      {a.enrichment.telecom && ` · ${a.enrichment.telecom}`}
                      {a.enrichment.safe === false && <span style={{ color: '#ef4444' }}> 🚨 UNSAFE</span>}
                      {a.enrichment.safe === true && <span style={{ color: '#10b981' }}> ✅ Safe</span>}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{new Date(a.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'reports' && (
          <div>
            {reports.length === 0 && (
              <div>
                <p style={{ color: '#475569', marginBottom: 16 }}>No reports generated yet.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['standard', 'fir_ready', 'ncrp', 'summary'].map(t => (
                    <button key={t} onClick={() => generateReport(t)} disabled={generating} style={{
                      padding: '8px 16px', borderRadius: 7, border: '1px solid #334155',
                      background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 12
                    }}>Generate {t.replace(/_/g, ' ')} →</button>
                  ))}
                </div>
              </div>
            )}
            {reports.map((r, i) => (
              <div key={i} style={{ padding: '14px 16px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                      {r.report_type.replace(/_/g, ' ').toUpperCase()} Report
                    </span>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {r.submitted && <span style={{ fontSize: 11, color: '#10b981' }}>✅ Submitted</span>}
                    <span style={{ fontSize: 11, color: '#06b6d4', fontFamily: 'monospace' }}>{r.id.slice(0, 10)}…</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'raw' && (
          <pre style={{ fontSize: 11, color: '#94a3b8', overflow: 'auto', maxHeight: 500, background: '#0a0f1e', padding: 16, borderRadius: 8, lineHeight: 1.6 }}>
            {JSON.stringify({ case: c, intelligence, reports }, null, 2)}
          </pre>
        )}
      </div>
    </Layout>
  );
}
