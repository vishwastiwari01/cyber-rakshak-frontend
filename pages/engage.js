import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import ThreatBadge from '../components/ThreatBadge';
import { api } from '../utils/api';

const PERSONAS = [
  { value: 'elderly',      label: '👴 Ramesh Uncle (Elderly)',    desc: 'Retired, confused, cooperative' },
  { value: 'student',      label: '👩‍🎓 Priya Sharma (Student)',    desc: 'Excited, naive, chatty' },
  { value: 'professional', label: '💼 Vikram Mehta (Professional)', desc: 'Analytical, demands docs' }
];

const CHANNELS = ['chat', 'whatsapp', 'telegram', 'sms', 'email'];

export default function Engage() {
  const [caseId, setCaseId]           = useState(null);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [persona, setPersona]         = useState('elderly');
  const [channel, setChannel]         = useState('chat');
  const [loading, setLoading]         = useState(false);
  const [creating, setCreating]       = useState(false);
  const [intelligence, setIntelligence] = useState([]);
  const [stats, setStats]             = useState({ threat_level: 1, scam_type: 'unknown', frustration: 0 });
  const chatEndRef                    = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function createCase() {
    setCreating(true);
    try {
      const { case: c } = await api.post('/api/cases', { persona_used: persona, channel });
      setCaseId(c.id);
      setMessages([{
        role: 'system',
        content: `Case ${c.id.slice(0, 8)} created. Persona: ${PERSONAS.find(p => p.value === persona)?.label}. Paste scammer messages below.`
      }]);
    } catch (e) {
      alert('Failed to create case: ' + e.message);
    } finally {
      setCreating(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || !caseId || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'scammer', content: userMsg }]);
    setLoading(true);

    try {
      const data = await api.post('/api/chat', { message: userMsg, case_id: caseId, persona });
      setMessages(m => [...m, { role: 'ai', content: data.reply }]);

      if (data.intelligence) {
        const { artifacts, scam_type, threat_level, frustration_score } = data.intelligence;
        setStats({ threat_level, scam_type, frustration: frustration_score });
        if (artifacts?.length > 0) {
          setIntelligence(prev => [...prev, ...artifacts]);
        }
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'system', content: '⚠️ Error: ' + e.message }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <Layout title="Engage">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>💬 Engagement Console</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>
            Paste scammer messages — AI persona responds to waste their time & extract intelligence
          </p>
        </div>
        {caseId && (
          <div style={{ fontSize: 12, color: '#475569', background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: '6px 12px' }}>
            Case: <span style={{ color: '#06b6d4', fontWeight: 600 }}>{caseId.slice(0, 12)}…</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Left — Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Setup (shown before case created) */}
          {!caseId && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
              <h3 style={{ color: '#f1f5f9', margin: '0 0 20px', fontSize: 15 }}>Configure Engagement</h3>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  AI Persona (Veshantar Engine)
                </label>
                {PERSONAS.map(p => (
                  <div key={p.value}
                    onClick={() => setPersona(p.value)}
                    style={{
                      padding: '12px 16px', borderRadius: 8, marginBottom: 8, cursor: 'pointer',
                      border: `1px solid ${persona === p.value ? '#06b6d4' : '#1e293b'}`,
                      background: persona === p.value ? 'rgba(6,182,212,0.08)' : '#0a0f1e',
                      transition: 'all 0.15s'
                    }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: persona === p.value ? '#06b6d4' : '#e2e8f0' }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{p.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Channel</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CHANNELS.map(ch => (
                    <button key={ch} onClick={() => setChannel(ch)} style={{
                      padding: '6px 14px', borderRadius: 6, border: `1px solid ${channel === ch ? '#06b6d4' : '#1e293b'}`,
                      background: channel === ch ? 'rgba(6,182,212,0.1)' : 'transparent',
                      color: channel === ch ? '#06b6d4' : '#64748b', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize'
                    }}>{ch}</button>
                  ))}
                </div>
              </div>

              <button onClick={createCase} disabled={creating} style={{
                width: '100%', padding: '12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: creating ? '#1e293b' : 'linear-gradient(135deg,#06b6d4,#3b82f6)',
                color: '#fff', fontWeight: 700, fontSize: 14
              }}>
                {creating ? 'Creating…' : '🚀 Start Engagement Session'}
              </button>
            </div>
          )}

          {/* Chat window */}
          {caseId && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: 12, alignItems: 'center' }}>
                <ThreatBadge level={stats.threat_level} />
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {stats.scam_type.replace(/_/g, ' ')} · Frustration: <span style={{ color: '#f59e0b', fontWeight: 600 }}>{stats.frustration}%</span>
                </span>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, maxHeight: 440, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'ai' ? 'flex-start' : m.role === 'scammer' ? 'flex-end' : 'center' }}>
                    {m.role === 'system' ? (
                      <div style={{ fontSize: 11, color: '#475569', background: '#1e293b', borderRadius: 4, padding: '4px 10px' }}>{m.content}</div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 10, color: '#475569', marginBottom: 3, textAlign: m.role === 'ai' ? 'left' : 'right' }}>
                          {m.role === 'ai' ? '🤖 AI Persona' : '⚠️ Scammer'}
                        </div>
                        <div style={{
                          maxWidth: 380, padding: '10px 14px', borderRadius: 10, fontSize: 13, lineHeight: 1.5,
                          background: m.role === 'ai' ? '#1e293b' : 'rgba(239,68,68,0.12)',
                          color: m.role === 'ai' ? '#e2e8f0' : '#fca5a5',
                          border: `1px solid ${m.role === 'ai' ? '#334155' : 'rgba(239,68,68,0.3)'}`,
                          borderTopLeftRadius: m.role === 'ai' ? 2 : 10,
                          borderTopRightRadius: m.role === 'scammer' ? 2 : 10,
                        }}>
                          {m.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 11, color: '#475569' }}>🤖 AI generating response…</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: 12, borderTop: '1px solid #1e293b', display: 'flex', gap: 10 }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Paste scammer's message here… (Enter to send)"
                  rows={2}
                  style={{
                    flex: 1, background: '#0a0f1e', border: '1px solid #334155', borderRadius: 8,
                    color: '#e2e8f0', padding: '10px 12px', fontSize: 13, resize: 'none',
                    fontFamily: 'inherit', outline: 'none'
                  }}
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
                  padding: '0 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: loading ? '#1e293b' : 'linear-gradient(135deg,#06b6d4,#3b82f6)',
                  color: '#fff', fontWeight: 700, fontSize: 20
                }}>➤</button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Live Intelligence Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 18, flex: 1 }}>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 14px', fontSize: 14 }}>🔍 Live Intelligence</h3>
            {intelligence.length === 0 && (
              <p style={{ color: '#475569', fontSize: 12 }}>Artifacts will appear here as they are extracted from scammer messages.</p>
            )}
            {intelligence.map((a, i) => (
              <div key={i} style={{ marginBottom: 10, padding: '10px 12px', background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  {a.type.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: 12, color: '#e2e8f0', wordBreak: 'break-all', fontFamily: 'monospace' }}>{a.value}</div>
                {a.enrichment && Object.keys(a.enrichment).length > 0 && (
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                    {a.enrichment.country && `📍 ${a.enrichment.city || ''} ${a.enrichment.country}`}
                    {a.enrichment.telecom && ` · ${a.enrichment.telecom}`}
                    {a.enrichment.safe === false && <span style={{ color: '#ef4444' }}> 🚨 UNSAFE URL</span>}
                    {a.enrichment.safe === true && <span style={{ color: '#10b981' }}> ✅ Safe URL</span>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {caseId && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 18 }}>
              <h3 style={{ color: '#f1f5f9', margin: '0 0 12px', fontSize: 14 }}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href={`/cases/${caseId}`} style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', padding: '9px', borderRadius: 7, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>
                    📁 View Full Case
                  </button>
                </a>
                <button
                  onClick={async () => {
                    try {
                      await api.post('/api/reports/generate', { case_id: caseId, report_type: 'fir_ready' });
                      alert('FIR-ready report generated! View in Reports section.');
                    } catch(e) { alert('Error: ' + e.message); }
                  }}
                  style={{ width: '100%', padding: '9px', borderRadius: 7, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>
                  📋 Generate FIR Report
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.patch(`/api/cases/${caseId}`, { status: 'escalated' });
                      alert('Case escalated!');
                    } catch(e) { alert('Error: ' + e.message); }
                  }}
                  style={{ width: '100%', padding: '9px', borderRadius: 7, border: '1px solid rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.08)', color: '#f97316', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  🚨 Escalate Case
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
