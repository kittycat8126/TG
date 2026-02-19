// Globe.jsx — Part 1: Three.js globe with real NASA textures (Google Earth look)
import { useEffect, useRef, useState } from "react";
import { loadTextures } from "./textures";
import { createLatLonGrid } from "./grid";

const RADIUS = 1;

export default function Globe({ onSceneReady }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const stateRef  = useRef({ dragging: false, prev: { x: 0, y: 0 }, vx: 0, vy: 0, auto: true, t: 0 });
  const [loadPct, setLoadPct] = useState(0);
  const [ready,   setReady]   = useState(false);

  const LOAD_MSGS = [
    "LOADING SATELLITE IMAGERY...",
    "LOADING TERRAIN ELEVATION DATA...",
    "LOADING CITY LIGHTS MAP...",
    "LOADING CLOUD LAYER...",
    "CALIBRATING SENSORS...",
  ];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => setTimeout(init, 100);
    document.head.appendChild(script);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  async function init() {
    const THREE  = window.THREE;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.clientWidth  || 800;
    const H = canvas.clientHeight || 600;

    // ── RENDERER ────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.setClearColor(0x000008, 1);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 1000);
    camera.position.z = 2.8;

    // ── LOAD REAL NASA TEXTURES ──────────────────
    const { dayTex, nightTex, bumpTex, cloudTex } = await loadTextures(
      THREE,
      (count) => setLoadPct(Math.round(count / 4 * 100))
    );
    setReady(true);

    // ── EARTH — Google Earth style ───────────────
    const earthMat = new THREE.MeshPhongMaterial({
      map:       dayTex,
      bumpMap:   bumpTex,
      bumpScale: 0.015,
      specular:  new THREE.Color(0x333355),
      shininess: 20,
    });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(RADIUS, 80, 80), earthMat);
    scene.add(earth);

    // ── NIGHT CITY LIGHTS ───────────────────────
    if (nightTex) {
      earth.add(new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS + 0.001, 80, 80),
        new THREE.MeshBasicMaterial({
          map: nightTex, transparent: true, opacity: 0.8,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      ));
    }

    // ── CLOUDS ───────────────────────────────────
    let cloudMesh = null;
    if (cloudTex) {
      cloudMesh = new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS * 1.009, 64, 64),
        new THREE.MeshPhongMaterial({
          map: cloudTex, transparent: true, opacity: 0.4, depthWrite: false,
        })
      );
      earth.add(cloudMesh);
    }

    // ── ATMOSPHERE ───────────────────────────────
    const atmOuter = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.1, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x1155ee, transparent: true, opacity: 0.09,
        side: THREE.BackSide, depthWrite: false,
      })
    );
    scene.add(atmOuter);

    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.02, 64, 64),
      new THREE.MeshLambertMaterial({
        color: 0x2255cc, transparent: true, opacity: 0.04, depthWrite: false,
      })
    ));

    // Subtle green tactical tint
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.003, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x00ff88, transparent: true, opacity: 0.012,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    ));

    // ── TACTICAL GRID ────────────────────────────
    earth.add(createLatLonGrid(THREE, RADIUS));

    // ── STARS ────────────────────────────────────
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
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({
      size: 0.055, vertexColors: true, transparent: true, opacity: 0.85,
    })));

    // ── ORBIT RINGS ──────────────────────────────
    function mkRing(ir, or, op, rx, ry) {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(ir, or, 128),
        new THREE.MeshBasicMaterial({
          color: 0x00ff88, transparent: true, opacity: op,
          side: THREE.DoubleSide, depthWrite: false,
        })
      );
      m.rotation.x = rx; m.rotation.y = ry; return m;
    }
    const ring1 = mkRing(RADIUS * 1.38, RADIUS * 1.385, 0.04,  Math.PI / 2, 0);
    const ring2 = mkRing(RADIUS * 1.52, RADIUS * 1.523, 0.022, Math.PI / 3, 0.5);
    scene.add(ring1, ring2);

    // ── LIGHTING ─────────────────────────────────
    const sun = new THREE.DirectionalLight(0xffeedd, 2.4);
    sun.position.set(5, 2, 4);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x223344, 0.5));
    const rim = new THREE.DirectionalLight(0x2244aa, 0.2);
    rim.position.set(-5, -1, -3);
    scene.add(rim);

    // ── MOUSE INTERACTION ────────────────────────
    const s = stateRef.current;
    canvas.addEventListener("mousedown", e => {
      s.dragging = true; s.auto = false;
      s.prev = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("mousemove", e => {
      if (!s.dragging) return;
      s.vy = (e.clientX - s.prev.x) * 0.005;
      s.vx = (e.clientY - s.prev.y) * 0.003;
      earth.rotation.y += s.vy;
      earth.rotation.x = Math.max(-1.2, Math.min(1.2, earth.rotation.x + s.vx));
      s.prev = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener("mouseup", () => {
      s.dragging = false; setTimeout(() => s.auto = true, 4000);
    });
    canvas.addEventListener("wheel", e => {
      camera.position.z = Math.max(1.4, Math.min(7, camera.position.z + e.deltaY * 0.002));
    }, { passive: true });
    canvas.addEventListener("touchstart", e => {
      s.dragging = true; s.auto = false;
      s.prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener("touchmove", e => {
      if (!s.dragging) return;
      s.vy = (e.touches[0].clientX - s.prev.x) * 0.005;
      s.vx = (e.touches[0].clientY - s.prev.y) * 0.003;
      earth.rotation.y += s.vy;
      earth.rotation.x = Math.max(-1.2, Math.min(1.2, earth.rotation.x + s.vx));
      s.prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    window.addEventListener("touchend", () => {
      s.dragging = false; setTimeout(() => s.auto = true, 4000);
    });

    // ── RESIZE ───────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(canvas);

    // Expose scene to parent (for attack arcs)
    onSceneReady?.({ scene, earth, camera, renderer, THREE, RADIUS });

    // ── RENDER LOOP ──────────────────────────────
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
      {/* Loading screen */}
      {!ready && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 300,
          background: "#000008",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 18,
          fontFamily: "'Share Tech Mono', monospace",
        }}>
          <div style={{
            fontFamily: "'Orbitron', monospace", fontWeight: 900,
            fontSize: 22, letterSpacing: 8, color: "#00ff88",
            textShadow: "0 0 30px rgba(0,255,136,0.6)",
          }}>
            SENTINEL<span style={{ color: "#ff2244" }}>//</span>GRID
          </div>
          <div style={{ width: 260, height: 1, background: "rgba(0,255,136,0.12)" }}>
            <div style={{
              height: "100%", width: loadPct + "%",
              background: "#00ff88", boxShadow: "0 0 12px #00ff88",
              transition: "width 0.4s ease",
            }} />
          </div>
          <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.4, color: "#00ff88" }}>
            {LOAD_MSGS[Math.floor(loadPct / 25)] || "CALIBRATING SENSORS..."}
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </>
  );
}
