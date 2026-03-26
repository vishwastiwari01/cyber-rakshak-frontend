// Terminal-inspired stat card
export default function StatCard({ label, value, sub, accent = false, dim = false }) {
  return (
    <div style={{
      background: 'var(--bg-2)',
      border: `1px solid ${accent ? 'var(--accent-b)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Top accent bar */}
      {accent && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
      )}
      <div style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 12 }}>
        {label}
      </div>
      <div style={{
        fontSize: 30, fontWeight: 700, lineHeight: 1,
        fontFamily: 'var(--font-mono)',
        color: dim ? 'var(--text-2)' : accent ? 'var(--accent)' : 'var(--text-0)',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 8 }}>{sub}</div>
      )}
    </div>
  );
}
