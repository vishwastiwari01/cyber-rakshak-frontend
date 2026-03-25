const LEVELS = {
  1: { label: 'LOW',      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  2: { label: 'GUARDED',  color: '#84cc16', bg: 'rgba(132,204,22,0.12)' },
  3: { label: 'ELEVATED', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  4: { label: 'HIGH',     color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  5: { label: 'CRITICAL', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
};

export default function ThreatBadge({ level = 1 }) {
  const { label, color, bg } = LEVELS[level] || LEVELS[1];
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
      color, background: bg, border: `1px solid ${color}`, letterSpacing: '0.05em'
    }}>
      T{level} {label}
    </span>
  );
}
