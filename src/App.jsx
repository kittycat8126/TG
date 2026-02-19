// App.jsx — Top-level: wires Globe + AttackArcs + UI together
import { useState, useEffect, useRef } from "react";
import Globe      from "./globe/Globe";
import Header     from "./ui/Header";
import Footer     from "./ui/Footer";
import Controls   from "./ui/Controls";
import AttackLog  from "./ui/AttackLog";
import Legend     from "./ui/Legend";
import { useGlobe }   from "./hooks/useGlobe";
import { useAttacks } from "./hooks/useAttacks";
import { useClock }   from "./hooks/useClock";

export default function App() {
  const { sceneRef, onSceneReady } = useGlobe();
  const { tickAttacks, log, total } = useAttacks(sceneRef);
  const clock = useClock();

  const [aps,     setAps]     = useState(187);
  const [threats, setThreats] = useState(341);

  // Simulated live counters (Part 3 will wire these to real API data)
  useEffect(() => {
    const iv = setInterval(() => {
      setAps(Math.floor(Math.random() * 60 + 155));
      setThreats(Math.floor(Math.random() * 30 + 320));
    }, 1400);
    return () => clearInterval(iv);
  }, []);

  // Attack tick — runs every frame via requestAnimationFrame
  const rafRef = useRef(null);
  useEffect(() => {
    let last = performance.now();
    function loop(now) {
      const dt = (now - last) / 1000; // seconds
      last = now;
      tickAttacks(dt);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tickAttacks]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", background: "#000008" }}>
      {/* Three.js Globe (Part 1) */}
      <Globe onSceneReady={onSceneReady} />

      {/* UI Overlay (Parts 1 + 2) */}
      <Header aps={aps} threats={threats} total={total} />
      <Legend />
      <AttackLog log={log} />
      <Controls />
      <Footer
        clock={clock}
        part="2 OF 10 — ATTACK ARC ANIMATIONS"
        version="v0.2.0"
      />
    </div>
  );
}
