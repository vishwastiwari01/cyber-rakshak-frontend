import { useEffect, useRef } from 'react';

// Three.js animated dotted wave background — converted from TS to JS
export default function DottedSurface() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    let THREE;
    try { THREE = require('three'); } catch { return; }

    const SEPARATION = 140, AMOUNTX = 35, AMOUNTY = 50;
    const W = window.innerWidth, H = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 1, 10000);
    camera.position.set(0, 320, 1100);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    const positions = [], colors = [];
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions.push(
          ix * SEPARATION - (AMOUNTX * SEPARATION) / 2,
          0,
          iy * SEPARATION - (AMOUNTY * SEPARATION) / 2
        );
        // Subtle cyan-tinted dots
        colors.push(0.1, 0.35, 0.55);
      }
    }

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.Float32BufferAttribute(positions, 3);
    geo.setAttribute('position', posAttr);
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 5, vertexColors: true,
      transparent: true, opacity: 0.45, sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let count = 0, animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const pos = posAttr.array;
      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          pos[i * 3 + 1] =
            Math.sin((ix + count) * 0.3) * 45 +
            Math.sin((iy + count) * 0.5) * 45;
          i++;
        }
      }
      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.07;
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      geo.dispose(); mat.dispose(); renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        try { containerRef.current.removeChild(renderer.domElement); } catch {}
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, zIndex: 0,
      pointerEvents: 'none', overflow: 'hidden',
    }} />
  );
}
