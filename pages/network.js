import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { api } from '../utils/api';

// Simple force-layout network graph (pure canvas, no external lib needed)
export default function Network() {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const canvasRef                 = useRef(null);
  const animRef                   = useRef(null);
  const nodesRef                  = useRef([]);
  const isDragging                = useRef(false);
  const dragNode                  = useRef(null);

  useEffect(() => {
    loadGraph();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  async function loadGraph() {
    try {
      const data = await api.get('/api/intelligence/network');
      setGraphData(data);
      initGraph(data);
    } finally {
      setLoading(false);
    }
  }

  function initGraph(data) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    // Build node list with physics
    const caseIds = [...new Set([...data.edges.map(e => e.source)])];
    const allNodes = [
      ...caseIds.map((id, i) => ({
        id, type: 'case', label: id.replace('case:', '').slice(0, 8),
        x: W / 2 + (Math.random() - 0.5) * 300,
        y: H / 2 + (Math.random() - 0.5) * 300,
        vx: 0, vy: 0, r: 12, color: '#06b6d4'
      })),
      ...data.nodes.map(n => ({
        id: n.id, type: n.type, label: n.label.slice(0, 18),
        x: W / 2 + (Math.random() - 0.5) * 400,
        y: H / 2 + (Math.random() - 0.5) * 400,
        vx: 0, vy: 0, r: 10,
        color: n.type === 'phone_number' ? '#10b981' : '#f59e0b'
      }))
    ];
    nodesRef.current = allNodes;

    const edges = data.edges.map(e => ({
      source: allNodes.findIndex(n => n.id === e.source),
      target: allNodes.findIndex(n => n.id === e.target)
    })).filter(e => e.source >= 0 && e.target >= 0);

    const ctx = canvas.getContext('2d');

    function tick() {
      const nodes = nodesRef.current;
      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1800 / (dist * dist);
          nodes[i].vx -= force * dx / dist;
          nodes[i].vy -= force * dy / dist;
          nodes[j].vx += force * dx / dist;
          nodes[j].vy += force * dy / dist;
        }
      }
      // Attraction along edges
      for (const e of edges) {
        const a = nodes[e.source], b = nodes[e.target];
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 120) * 0.04;
        a.vx += force * dx / dist; a.vy += force * dy / dist;
        b.vx -= force * dx / dist; b.vy -= force * dy / dist;
      }
      // Center gravity
      for (const n of nodes) {
        n.vx += (W / 2 - n.x) * 0.005;
        n.vy += (H / 2 - n.y) * 0.005;
        n.vx *= 0.85; n.vy *= 0.85;
        if (n !== dragNode.current) {
          n.x += n.vx; n.y += n.vy;
        }
        n.x = Math.max(n.r + 10, Math.min(W - n.r - 10, n.x));
        n.y = Math.max(n.r + 10, Math.min(H - n.r - 10, n.y));
      }

      // Draw
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      // Edges
      for (const e of edges) {
        const a = nodes[e.source], b = nodes[e.target];
        if (!a || !b) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(6,182,212,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color + '33';
        ctx.fill();
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + n.r + 12);
      }

      animRef.current = requestAnimationFrame(tick);
    }
    tick();

    // Mouse events
    canvas.onmousedown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const nodes = nodesRef.current;
      for (const n of nodes) {
        if (Math.hypot(mx - n.x, my - n.y) < n.r + 4) {
          isDragging.current = true;
          dragNode.current = n;
          setSelected(n);
          break;
        }
      }
    };
    canvas.onmousemove = (e) => {
      if (!isDragging.current || !dragNode.current) return;
      const rect = canvas.getBoundingClientRect();
      dragNode.current.x = e.clientX - rect.left;
      dragNode.current.y = e.clientY - rect.top;
    };
    canvas.onmouseup = () => { isDragging.current = false; dragNode.current = null; };
  }

  return (
    <Layout title="Network Graph">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>🕸️ Fraud Network Graph</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 13 }}>
            Relationship mapping — cases, phone numbers & UPI IDs
          </p>
        </div>
        {graphData && (
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b' }}>
            <span>📍 <b style={{ color: '#06b6d4' }}>{graphData.summary?.total_phone_numbers || 0}</b> phones</span>
            <span>💳 <b style={{ color: '#f59e0b' }}>{graphData.summary?.total_upi_ids || 0}</b> UPI IDs</span>
            <span>🔹 <b style={{ color: '#a78bfa' }}>{graphData.summary?.unique_entities || 0}</b> entities</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16 }}>
        {/* Canvas */}
        <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden', position: 'relative', height: 520 }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>
              Loading network data…
            </div>
          )}
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }} />
        </div>

        {/* Legend + Selected node */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 18 }}>
            <h4 style={{ color: '#f1f5f9', margin: '0 0 14px', fontSize: 13 }}>Legend</h4>
            {[
              { color: '#06b6d4', label: 'Case node' },
              { color: '#10b981', label: 'Phone number' },
              { color: '#f59e0b', label: 'UPI ID' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: color + '33', border: `2px solid ${color}` }} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{label}</span>
              </div>
            ))}
            <p style={{ fontSize: 11, color: '#475569', margin: '12px 0 0' }}>Drag nodes to rearrange. Click to inspect.</p>
          </div>

          {selected && (
            <div style={{ background: '#0f172a', border: '1px solid #06b6d4', borderRadius: 12, padding: 18 }}>
              <h4 style={{ color: '#06b6d4', margin: '0 0 12px', fontSize: 13 }}>Selected Node</h4>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>TYPE</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', marginBottom: 10, fontWeight: 600 }}>{selected.type}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>VALUE</div>
              <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace', wordBreak: 'break-all' }}>{selected.id}</div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
