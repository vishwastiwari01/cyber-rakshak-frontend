export default function StatCard({ label, value, icon, color = '#06b6d4', sub }) {
  return (
    <div style={{
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#64748b' }}>{sub}</div>}
    </div>
  );
}
