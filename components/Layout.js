import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import DottedSurface from './DottedSurface';

export default function Layout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('cr_token');
    if (!token) router.replace('/login');
    else setReady(true);
  }, []);

  if (!ready) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-2)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>Authenticating...</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-0)' }}>
      <DottedSurface />
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, padding: '28px 32px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}
