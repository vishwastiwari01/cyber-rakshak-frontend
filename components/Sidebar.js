import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV = [
  { href: '/',                label: 'SOC Dashboard',  icon: '📡' },
  { href: '/engage',          label: 'Engage',          icon: '💬' },
  { href: '/cases',           label: 'Cases',           icon: '📁' },
  { href: '/intelligence',    label: 'Intelligence',    icon: '🔍' },
  { href: '/network',         label: 'Network Graph',   icon: '🕸️'  },
  { href: '/reports',         label: 'Reports',         icon: '📋' },
  { href: '/analytics',       label: 'Analytics',       icon: '📊' },
];

export default function Sidebar() {
  const router = useRouter();
  return (
    <aside style={{
      width: 230,
      minHeight: '100vh',
      background: '#0f172a',
      borderRight: '1px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', letterSpacing: '0.03em' }}>
              CYBER RAKSHAK
            </div>
            <div style={{ fontSize: 10, color: '#06b6d4', letterSpacing: '0.08em' }}>
              AI PLATFORM v2.0
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#10b981' }}>
          <span className="pulse-dot" />
          SYSTEM ACTIVE
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {NAV.map(({ href, label, icon }) => {
          const active = router.pathname === href;
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px', margin: '2px 8px', borderRadius: 8,
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? '#06b6d4' : '#94a3b8',
                background: active ? 'rgba(6,182,212,0.1)' : 'transparent',
                borderLeft: active ? '2px solid #06b6d4' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s'
              }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid #1e293b', fontSize: 11, color: '#475569' }}>
        <div>© 2025 Cyber Rakshak AI</div>
        <div style={{ marginTop: 2 }}>For authorized use only</div>
      </div>
    </aside>
  );
}
