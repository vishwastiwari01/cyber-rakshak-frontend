import Link from 'next/link';
import { useRouter } from 'next/router';

const NAV = [
  { href: '/',             label: 'Dashboard',    icon: <GridIcon /> },
  { href: '/engage',       label: 'Engage',       icon: <TerminalIcon /> },
  { href: '/cases',        label: 'Cases',        icon: <FolderIcon /> },
  { href: '/intelligence', label: 'Intelligence', icon: <ScanIcon /> },
  { href: '/network',      label: 'Network',      icon: <NetworkIcon /> },
  { href: '/reports',      label: 'Reports',      icon: <FileIcon /> },
  { href: '/analytics',    label: 'Analytics',    icon: <ChartIcon /> },
];

// Inline SVG icons — no emojis
function GridIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function TerminalIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;
}
function FolderIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
}
function ScanIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function NetworkIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><line x1="12" y1="7" x2="5" y2="17"/><line x1="12" y1="7" x2="19" y2="17"/></svg>;
}
function FileIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function ChartIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function ShieldIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}

export default function Sidebar() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem('cr_token');
    router.replace('/login');
  }

  return (
    <aside style={{
      width: 220, minHeight: '100vh',
      background: 'var(--bg-1)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 7, flexShrink: 0,
            background: 'linear-gradient(135deg, #00c8ff22, #00c8ff44)',
            border: '1px solid var(--accent-b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)',
          }}>
            <ShieldIcon />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-0)', letterSpacing: '0.04em' }}>
              CYBER RAKSHAK
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.06em', marginTop: 1 }}>
              AI PLATFORM v2.0
            </div>
          </div>
        </div>
      </div>

      {/* Live status */}
      <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dot-live" />
          <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            SYSTEM ACTIVE
          </span>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ padding: '16px 18px 6px', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', fontWeight: 600 }}>
        NAVIGATION
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
        {NAV.map(({ href, label, icon }) => {
          const active = router.pathname === href || (href !== '/' && router.pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 6, marginBottom: 2,
                fontSize: 13, fontWeight: active ? 500 : 400,
                color: active ? 'var(--accent)' : 'var(--text-2)',
                background: active ? 'var(--accent-d)' : 'transparent',
                border: `1px solid ${active ? 'var(--accent-b)' : 'transparent'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = active ? 'var(--accent-d)' : 'var(--bg-3)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = active ? 'var(--accent)' : 'var(--text-2)'; e.currentTarget.style.background = active ? 'var(--accent-d)' : 'transparent'; }}
              >
                <span style={{ opacity: active ? 1 : 0.6 }}>{icon}</span>
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px 16px', borderTop: '1px solid var(--border)' }}>
        <button onClick={logout} style={{
          width: '100%', padding: '8px 10px', borderRadius: 6,
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-2)', cursor: 'pointer', fontSize: 12,
          display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
        >
          <LogoutIcon /> Sign out
        </button>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 10, paddingLeft: 2 }}>
          © 2025 Cyber Rakshak AI
        </div>
      </div>
    </aside>
  );
}
