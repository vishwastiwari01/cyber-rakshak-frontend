import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import ThreatBadge from '../components/ThreatBadge';
import { api } from '../utils/api';

const PERSONAS = [
  { value: 'elderly',      label: 'Ramesh Uncle',  desc: 'Elderly · Confused, cooperative, delays info' },
  { value: 'student',      label: 'Priya Sharma',  desc: 'Student · Excited, naive, chatty' },
  { value: 'professional', label: 'Vikram Mehta',  desc: 'Professional · Analytical, demands documentation' },
];
const CHANNELS = ['chat', 'whatsapp', 'telegram', 'sms', 'email'];

const ARTIFACT_ICONS = { phone_number: '📞', upi_id: '💳', bank_account: '🏦', url: '🔗', email_address: '✉', ip_address: '🌐' };

export default function Engage() {
  const [caseId, setCaseId]         = useState(null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [persona, setPersona]       = useState('elderly');
  const [channel, setChannel]       = useState('chat');
  const [loading, setLoading]       = useState(false);
  const [creating, setCreating]     = useState(false);
  const [intel, setIntel]           = useState([]);
  const [stats, setStats]           = useState({ threat_level: 1, scam_type: 'unknown', frustration: 0 });
  const chatEndRef                  = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function createCase() {
    setCreating(true);
    try {
      const { case: c } = await api.post('/api/cases', { persona_used: persona, channel });
      setCaseId(c.id);
      setMessages([{ role: 'system', content: `Session started · Case ${c.id.slice(0, 10)} · Persona: ${PERSONAS.find(p => p.value === persona)?.label}` }]);
    } catch (e) { alert(e.message); }
    finally { setCreating(false); }
  }

  async function send() {
    if (!input.trim() || !caseId || loading) return;
    const msg = input.trim(); setInput('');
    setMessages(m => [...m, { role: 'scammer', content: msg }]);
    setLoading(true);
    try {
      const data = await api.post('/api/chat', { message: msg, case_id: caseId, persona });
      setMessages(m => [...m, { role: 'ai', content: data.reply }]);
      if (data.intelligence) {
        const { artifacts, scam_type, threat_level, frustration_score } = data.intelligence;
        setStats({ threat_level, scam_type, frustration: frustration_score });
        if (artifacts?.length) setIntel(prev => [...prev, ...artifacts]);
      }
    } catch (e) { setMessages(m => [...m, { role: 'system', content: 'Error: ' + e.message }]); }
    finally { setLoading(false); }
  }

  const card = {
    background: 'var(--bg-2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '18px 20px',
  };
  const labelStyle = { display: 'block', fontSize: 10, color: 'var(--text-2)', marginBottom: 8, letterSpacing: '0.08em', fontWeight: 600 };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.1em', marginBottom: 4 }}>ENGAGEMENT ENGINE</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-0)', margin: 0 }}>Engage Console</h1>
        </div>
        {caseId && (
          <div style={{ fontSize: 11, color: 'var(--text-2)', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', fontFamily: 'var(--font-mono)' }}>
            CASE · {caseId.slice(0, 12)}…
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Setup */}
          {!caseId && (
            <div style={card}>
              <div style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.1em', marginBottom: 18, fontWeight: 600 }}>CONFIGURE SESSION</div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>PERSONA — VESHANTAR ENGINE</label>
                {PERSONAS.map(p => (
                  <div key={p.value} onClick={() => setPersona(p.value)} style={{
                    padding: '11px 14px', borderRadius: 6, marginBottom: 6, cursor: 'pointer',
                    border: `1px solid ${persona === p.value ? 'var(--accent-b)' : 'var(--border)'}`,
                    background: persona === p.value ? 'var(--accent-d)' : 'var(--bg-3)',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: persona === p.value ? 'var(--accent)' : 'var(--text-0)' }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{p.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>CHANNEL</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CHANNELS.map(ch => (
                    <button key={ch} onClick={() => setChannel(ch)} style={{
                      padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      border: `1px solid ${channel === ch ? 'var(--accent-b)' : 'var(--border)'}`,
                      background: channel === ch ? 'var(--accent-d)' : 'transparent',
                      color: channel === ch ? 'var(--accent)' : 'var(--text-2)',
                    }}>{ch}</button>
                  ))}
                </div>
              </div>

              <button onClick={createCase} disabled={creating} style={{
                width: '100%', padding: '11px', borderRadius: 6, border: 'none',
                background: creating ? 'var(--bg-3)' : 'linear-gradient(135deg, #0090c8, #00c8ff)',
                color: creating ? 'var(--text-2)' : '#fff',
                fontWeight: 700, fontSize: 12, cursor: creating ? 'not-allowed' : 'pointer', letterSpacing: '0.06em',
              }}>
                {creating ? 'INITIALIZING...' : 'START ENGAGEMENT SESSION'}
              </button>
            </div>
          )}

          {/* Chat */}
          {caseId && (
            <div style={{ ...card, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Status bar */}
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-3)' }}>
                <ThreatBadge level={stats.threat_level} />
                <span style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                  {stats.scam_type.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-2)', marginLeft: 'auto' }}>
                  frustration: <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>{stats.frustration}%</span>
                </span>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, maxHeight: 420, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'ai' ? 'flex-start' : m.role === 'scammer' ? 'flex-end' : 'center' }}>
                    {m.role === 'system' ? (
                      <div style={{ fontSize: 10, color: 'var(--text-2)', background: 'var(--bg-3)', borderRadius: 4, padding: '4px 10px', fontFamily: 'var(--font-mono)' }}>
                        {m.content}
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-2)', marginBottom: 3, fontFamily: 'var(--font-mono)', textAlign: m.role === 'ai' ? 'left' : 'right' }}>
                          {m.role === 'ai' ? 'AI PERSONA' : 'SCAMMER INPUT'}
                        </div>
                        <div style={{
                          maxWidth: 380, padding: '9px 13px', borderRadius: 8, fontSize: 13, lineHeight: 1.5,
                          background: m.role === 'ai' ? 'var(--bg-3)' : 'rgba(255,61,87,0.07)',
                          color: m.role === 'ai' ? 'var(--text-0)' : '#ff8591',
                          border: `1px solid ${m.role === 'ai' ? 'var(--border)' : 'rgba(255,61,87,0.2)'}`,
                        }}>
                          {m.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--font-mono)', padding: '4px 0' }}>
                    generating response...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Paste scammer message here… (Enter to send)"
                  rows={2}
                  style={{
                    flex: 1, background: 'var(--bg-3)', border: '1px solid var(--border)',
                    borderRadius: 6, color: 'var(--text-0)', padding: '8px 12px',
                    fontSize: 13, resize: 'none', fontFamily: 'inherit', outline: 'none',
                  }}
                />
                <button onClick={send} disabled={loading || !input.trim()} style={{
                  padding: '0 16px', borderRadius: 6, border: 'none',
                  background: loading ? 'var(--bg-3)' : 'var(--accent-d)',
                  color: loading ? 'var(--text-2)' : 'var(--accent)',
                  fontWeight: 700, cursor: 'pointer', fontSize: 16,
                  borderWidth: 1, borderStyle: 'solid',
                  borderColor: loading ? 'var(--border)' : 'var(--accent-b)',
                }}>→</button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...card, flex: 1 }}>
            <div style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.1em', marginBottom: 14, fontWeight: 600 }}>LIVE INTELLIGENCE</div>
            {intel.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
                Artifacts extracted from scammer messages will appear here in real-time.
              </div>
            )}
            {intel.map((a, i) => (
              <div key={i} style={{ marginBottom: 10, padding: '10px 12px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {a.type.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-0)', wordBreak: 'break-all', fontFamily: 'var(--font-mono)' }}>{a.value}</div>
                {a.enrichment?.country && <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 4 }}>{a.enrichment.city ? a.enrichment.city + ', ' : ''}{a.enrichment.country}</div>}
                {a.enrichment?.safe === false && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 4 }}>UNSAFE URL DETECTED</div>}
              </div>
            ))}
          </div>

          {caseId && (
            <div style={card}>
              <div style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.1em', marginBottom: 12, fontWeight: 600 }}>ACTIONS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { label: 'View Case', href: `/cases/${caseId}` },
                ].map(({ label, href }) => (
                  <a key={label} href={href}>
                    <button style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-1)', cursor: 'pointer', fontSize: 12 }}>
                      {label}
                    </button>
                  </a>
                ))}
                <button onClick={async () => { try { await api.post('/api/reports/generate', { case_id: caseId, report_type: 'fir_ready' }); alert('FIR report generated. View in Reports.'); } catch(e) { alert(e.message); } }}
                  style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-1)', cursor: 'pointer', fontSize: 12 }}>
                  Generate FIR Report
                </button>
                <button onClick={async () => { try { await api.patch(`/api/cases/${caseId}`, { status: 'escalated' }); alert('Case escalated.'); } catch(e) { alert(e.message); } }}
                  style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid rgba(255,107,53,0.3)', background: 'rgba(255,107,53,0.06)', color: 'var(--orange)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  Escalate Case
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
