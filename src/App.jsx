// App.jsx — Part 8: Globe + Dashboard + Filters + Detail Popup
import { useState, useEffect, useRef } from "react";
import Globe          from "./globe/Globe";
import Header         from "./ui/Header";
import Footer         from "./ui/Footer";
import Controls       from "./ui/Controls";
import AttackLog      from "./ui/AttackLog";
import Legend         from "./ui/Legend";
import Dashboard      from "./ui/Dashboard";
import FilterControls from "./ui/FilterControls";
import DetailPopup    from "./ui/DetailPopup";
import { useGlobe }   from "./hooks/useGlobe";
import { useAttacks } from "./hooks/useAttacks";
import { useClock }   from "./hooks/useClock";

const CF_TOKEN       = import.meta.env.VITE_CLOUDFLARE_TOKEN || "";
const ABUSE_KEY      = import.meta.env.VITE_ABUSEIPDB_KEY    || "";
const ALIENVAULT_KEY = import.meta.env.VITE_ALIENVAULT_KEY   || "";

export default function App() {
  const { sceneRef, onSceneReady } = useGlobe();
  const {
    tickAttacks, log, total,
    filters, toggleFilter,
    paused, setPaused,
    speed,  setSpeed,
  } = useAttacks(sceneRef, {
    cloudflareToken: CF_TOKEN,
    abuseKey:        ABUSE_KEY,
    alienVaultKey:   ALIENVAULT_KEY,
  });
  const clock = useClock();

  const [aps,           setAps]           = useState(0);
  const [threats,       setThreats]       = useState(0);
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const totalRef    = useRef(0);
  const lastApsTime = useRef(Date.now());

  useEffect(() => {
    const iv = setInterval(() => {
      const now     = Date.now();
      const elapsed = (now - lastApsTime.current) / 1000;
      const diff    = total - totalRef.current;
      setAps(Math.max(0, Math.round(diff / elapsed)));
      setThreats(Math.floor(total * 1.4 + Math.random() * 20));
      totalRef.current    = total;
      lastApsTime.current = now;
    }, 2000);
    return () => clearInterval(iv);
  }, [total]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.code === "Space")   { e.preventDefault(); setPaused(p => !p); }
      if (e.key  === "Escape")  setSelectedEvent(null);
      if (e.key  === "1")       setSpeed(0.5);
      if (e.key  === "2")       setSpeed(1);
      if (e.key  === "3")       setSpeed(2);
      if (e.key  === "4")       setSpeed(5);
      if (e.key  === "d" || e.key === "D") setDashboardOpen(o => !o);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const rafRef = useRef(null);
  useEffect(() => {
    let last = performance.now();
    function loop(now) {
      const dt = (now - last) / 1000;
      last = now;
      tickAttacks(dt);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tickAttacks]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", background: "#000008" }}>
      <Globe onSceneReady={onSceneReady} />

      <Header aps={aps} threats={threats} total={total} paused={paused} />

      <Dashboard
        log={log} total={total} aps={aps} threats={threats}
        open={dashboardOpen}
        onToggle={() => setDashboardOpen(o => !o)}
      />
      {!dashboardOpen && <Legend />}

      <AttackLog
        log={log}
        onSelectEvent={setSelectedEvent}
      />

      <Controls />

      <FilterControls
        filters={filters}
        onFilterChange={toggleFilter}
        paused={paused}
        onPause={() => setPaused(p => !p)}
        speed={speed}
        onSpeed={setSpeed}
      />

      {/* Detail popup — shown when an attack is selected */}
      {selectedEvent && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSelectedEvent(null)}
            style={{
              position: "absolute", inset: 0, zIndex: 199,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(2px)",
            }}
          />
          <DetailPopup
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        </>
      )}

      <Footer
        clock={clock}
        part="8 OF 10 — DRILL-DOWN DETAIL"
        version="v0.8.0"
      />
    </div>
  );
}