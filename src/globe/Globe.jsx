// Globe.jsx — Part 10: Polished — single THREE instance, proper cleanup, smooth loading
import { useEffect, useRef, useState } from "react";
import { loadTextures } from "./textures";
import { createLatLonGrid } from "./grid";

const RADIUS = 1;

// Load Three.js only once globally
let threePromise = null;
function loadThree() {
  if (threePromise) return threePromise;
  if (window.THREE) { threePromise = Promise.resolve(window.THREE); return threePromise; }
  threePromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    s.onload = () => resolve(window.THREE);
    document.head.appendChild(s);
  });
  return threePromise;
}

const LOAD_MSGS = [
  "INITIALIZING SENTINEL SYSTEMS...",
  "LOADING SATELLITE IMAGERY...",
  "LOADING TERRAIN ELEVATION DATA...",
  "LOADING CITY LIGHTS MAP...",
  "ONLINE — MONITORING GLOBAL THREATS",
];

export default function Globe({ onSceneReady }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const cleanRef  = useRef([]);
  const stateRef  = useRef({ dragging: false, prev: { x: 0, y: 0 }, vx: 0, vy: 0, auto: true, t: 0 });
  const [loadPct,  setLoadPct]  = useState(0);
  const [loadMsg,  setLoadMsg]  = useState(LOAD_MSGS[0]);
  const [ready,    setReady]    = useState(false);
  const [fadeOut,  setFadeOut]  = useState(false);

  useEffect(() => {
    setLoadMsg(LOAD_MSGS[Math.min(4, Math.floor(loadPct / 25))]);
  }, [loadPct]);

  useEffect(() => {
    let cancelled = false;
    loadThree().then(THREE => {
      if (cancelled) return;
      init(THREE);
    });
    return () => {
      cancelled = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      cleanRef.current.forEach(fn => fn());
    };
  }, []);

  async function init(THREE) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.clientWidth  || window.innerWidth;
    const H = canvas.clientHeight || window.innerHeight;

    // ── RENDERER ─────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000008, 1);
    cleanRef.current.push(() => renderer.dispose());

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 1000);
    camera.position.z = 2.8;

    // ── TEXTURES ─────────────────────────────────
    setLoadPct(5);
    const { dayTex, nightTex, bumpTex, cloudTex } = await loadTextures(
      THREE,
      (count) => setLoadPct(10 + Math.round(count / 4 * 75))
    );

    // ── EARTH ─────────────────────────────────────
    const earthMat = new THREE.MeshPhongMaterial({
      map: dayTex, bumpMap: bumpTex, bumpScale: 0.015,
      specular: new THREE.Color(0x333355), shininess: 20,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 80, 80), earthMat);
    earth.rotation.y = -Math.PI * 0.3; // Start facing Europe/Asia
    scene.add(earth);

    // Night lights
    if (nightTex) {
      earth.add(new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS + 0.001, 64, 64),
        new THREE.MeshBasicMaterial({
          map: nightTex, transparent: true, opacity: 0.8,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      ));
    }

    // Clouds
    let cloudMesh = null;
    if (cloudTex) {
      cloudMesh = new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS * 1.009, 64, 64),
        new THREE.MeshPhongMaterial({ map: cloudTex, transparent: true, opacity: 0.4, depthWrite: false })
      );
      earth.add(cloudMesh);
    }

    // ── ATMOSPHERE ────────────────────────────────
    const atmOuter = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.1, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x1155ee, transparent: true, opacity: 0.09, side: THREE.BackSide, depthWrite: false })
    );
    scene.add(atmOuter);
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.02, 64, 64),
      new THREE.MeshLambertMaterial({ color: 0x2255cc, transparent: true, opacity: 0.04, depthWrite: false })
    ));
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.003, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.012, blending: THREE.AdditiveBlending, depthWrite: false })
    ));

    // ── TACTICAL GRID ─────────────────────────────
    earth.add(createLatLonGrid(THREE, RADIUS));

    // ── STARS ─────────────────────────────────────
    const sp = [], sc = [];
    for (let i = 0; i < 4000; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const sr = 80 + Math.random() * 80;
      sp.push(sr * Math.sin(ph) * Math.cos(th), sr * Math.cos(ph), sr * Math.sin(ph) * Math.sin(th));
      const t2 = Math.random();
      if (t2 < 0.08)      sc.push(0.7, 0.8, 1.0);
      else if (t2 < 0.14) sc.push(1.0, 0.85, 0.65);
      else                sc.push(1.0, 1.0, 1.0);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    sg.setAttribute("color",    new THREE.Float32BufferAttribute(sc, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.85 })));

    // ── ORBIT RINGS ───────────────────────────────
    function mkRing(ir, or, op, rx, ry) {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(ir, or, 128),
        new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false })
      );
      m.rotation.x = rx; m.rotation.y = ry; return m;
    }
    const ring1 = mkRing(RADIUS * 1.38, RADIUS * 1.385, 0.04, Math.PI / 2, 0);
    const ring2 = mkRing(RADIUS * 1.52, RADIUS * 1.523, 0.022, Math.PI / 3, 0.5);
    scene.add(ring1, ring2);

    // ── LIGHTING ──────────────────────────────────
    const sun = new THREE.DirectionalLight(0xffeedd, 2.4);
    sun.position.set(5, 2, 4);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x223344, 0.5));
    const rim = new THREE.DirectionalLight(0x2244aa, 0.2);
    rim.position.set(-5, -1, -3);
    scene.add(rim);

    // ── INTERACTION ───────────────────────────────
    const s = stateRef.current;
    const onMouseDown = e => { s.dragging = true; s.auto = false; s.prev = { x: e.clientX, y: e.clientY }; };
    const onMouseMove = e => {
      if (!s.dragging) return;
      s.vy = (e.clientX - s.prev.x) * 0.005;
      s.vx = (e.clientY - s.prev.y) * 0.003;
      earth.rotation.y += s.vy;
      earth.rotation.x = Math.max(-1.2, Math.min(1.2, earth.rotation.x + s.vx));
      s.prev = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp   = () => { s.dragging = false; setTimeout(() => s.auto = true, 4000); };
    const onWheel     = e  => { camera.position.z = Math.max(1.4, Math.min(7, camera.position.z + e.deltaY * 0.002)); };
    const onTouchStart = e => { s.dragging = true; s.auto = false; s.prev = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onTouchMove  = e => {
      if (!s.dragging) return;
      s.vy = (e.touches[0].clientX - s.prev.x) * 0.005;
      s.vx = (e.touches[0].clientY - s.prev.y) * 0.003;
      earth.rotation.y += s.vy;
      earth.rotation.x = Math.max(-1.2, Math.min(1.2, earth.rotation.x + s.vx));
      s.prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => { s.dragging = false; setTimeout(() => s.auto = true, 4000); };

    canvas.addEventListener("mousedown",  onMouseDown);
    canvas.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseup",    onMouseUp);
    canvas.addEventListener("wheel",      onWheel, { passive: true });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: true });
    window.addEventListener("touchend",   onTouchEnd);

    cleanRef.current.push(() => {
      canvas.removeEventListener("mousedown",  onMouseDown);
      canvas.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseup",    onMouseUp);
      canvas.removeEventListener("wheel",      onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      window.removeEventListener("touchend",   onTouchEnd);
    });

    // ── RESIZE ────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    });
    ro.observe(canvas);
    cleanRef.current.push(() => ro.disconnect());

    // ── READY — fade out loading screen ───────────
    setLoadPct(100);
    setLoadMsg(LOAD_MSGS[4]);
    setTimeout(() => { setFadeOut(true); setTimeout(() => setReady(true), 600); }, 400);

    onSceneReady?.({ scene, earth, camera, renderer, THREE, RADIUS });

    // ── RENDER LOOP ───────────────────────────────
    function animate() {
      animRef.current = requestAnimationFrame(animate);
      s.t += 0.005;
      if (s.auto && !s.dragging) {
        earth.rotation.y += 0.0013;
      } else if (!s.dragging) {
        s.vx *= 0.88; s.vy *= 0.88;
        earth.rotation.y += s.vy;
        earth.rotation.x = Math.max(-1.2, Math.min(1.2, earth.rotation.x + s.vx));
      }
      if (cloudMesh) cloudMesh.rotation.y += 0.00025;
      atmOuter.material.opacity = 0.07 + Math.sin(s.t * 0.5) * 0.012;
      ring1.rotation.z += 0.0003;
      ring2.rotation.z -= 0.00025;
      sun.position.x = Math.cos(s.t * 0.03) * 5;
      sun.position.z = Math.sin(s.t * 0.03) * 4;
      renderer.render(scene, camera);
    }
    animate();
  }

  return (
    <>
      {/* Polished loading screen with fade-out */}
      {!ready && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 300,
          background: "#000008",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 20,
          fontFamily: "'Share Tech Mono', monospace",
          transition: "opacity 0.6s ease",
          opacity: fadeOut ? 0 : 1,
          pointerEvents: fadeOut ? "none" : "all",
        }}>
          {/* Animated scanning ring */}
          <div style={{ position: "relative", width: 80, height: 80, marginBottom: 10 }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "1px solid rgba(0,255,136,0.15)",
            }} />
            <div style={{
              position: "absolute", inset: 6, borderRadius: "50%",
              border: "2px solid transparent",
              borderTopColor: "#00ff88",
              animation: "spin 1.2s linear infinite",
            }} />
            <div style={{
              position: "absolute", inset: 16, borderRadius: "50%",
              border: "1px solid transparent",
              borderTopColor: "rgba(0,255,136,0.4)",
              animation: "spin 2s linear infinite reverse",
            }} />
            <div style={{
              position: "absolute", inset: "50%", width: 6, height: 6,
              marginLeft: -3, marginTop: -3,
              background: "#00ff88", borderRadius: "50%",
              boxShadow: "0 0 12px #00ff88",
            }} />
          </div>

          <div style={{
            fontFamily: "'Orbitron', monospace", fontWeight: 900,
            fontSize: 24, letterSpacing: 10, color: "#00ff88",
            textShadow: "0 0 40px rgba(0,255,136,0.5)",
          }}>
            SENTINEL<span style={{ color: "#ff2244" }}>//</span>GRID
          </div>

          <div style={{ width: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 7, letterSpacing: 2, opacity: 0.4, color: "#00ff88" }}>
              <span>{loadMsg}</span>
              <span>{loadPct}%</span>
            </div>
            <div style={{ height: 2, background: "rgba(0,255,136,0.1)", borderRadius: 2 }}>
              <div style={{
                height: "100%", width: loadPct + "%",
                background: "linear-gradient(90deg, #00aa55, #00ff88)",
                boxShadow: "0 0 10px #00ff88",
                borderRadius: 2, transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          <div style={{ fontSize: 7, letterSpacing: 4, opacity: 0.2, color: "#00ff88", marginTop: 4 }}>
            GLOBAL THREAT INTELLIGENCE SYSTEM
          </div>

          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </>
  );
}