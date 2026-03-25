import Sidebar from './Sidebar';

export default function Layout({ children, title = 'Cyber Rakshak AI' }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020617' }}>
      <Sidebar />
      <main style={{ marginLeft: 230, flex: 1, padding: '28px 32px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
