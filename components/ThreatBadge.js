const LEVELS = {
  1: { label: 'LOW',      color: '#00d68f', bg: 'rgba(0,214,143,0.08)',  border: 'rgba(0,214,143,0.25)' },
  2: { label: 'GUARDED',  color: '#7ed321', bg: 'rgba(126,211,33,0.08)', border: 'rgba(126,211,33,0.25)' },
  3: { label: 'ELEVATED', color: '#ffb800', bg: 'rgba(255,184,0,0.08)',  border: 'rgba(255,184,0,0.25)' },
  4: { label: 'HIGH',     color: '#ff6b35', bg: 'rgba(255,107,53,0.08)', border: 'rgba(255,107,53,0.25)' },
  5: { label: 'CRITICAL', color: '#ff3d57', bg: 'rgba(255,61,87,0.08)',  border: 'rgba(255,61,87,0.25)' },
};

export default function ThreatBadge({ level = 1 }) {
  const { label, color, bg, border } = LEVELS[level] || LEVELS[1];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 4, fontSize: 10,
      fontWeight: 700, letterSpacing: '0.08em',
      fontFamily: 'var(--font-mono)',
      color, background: bg, border: `1px solid ${border}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }} />
      T{level} · {label}
    </span>
  );
}
