// App.jsx — Part 10: All 5 high-impact improvements
import { useState, useEffect, useRef } from "react";
import Globe           from "./globe/Globe";
import Header          from "./ui/Header";
import Footer          from "./ui/Footer";
import Controls        from "./ui/Controls";
import AttackLog       from "./ui/AttackLog";
import Legend          from "./ui/Legend";
import Dashboard       from "./ui/Dashboard";
import FilterControls  from "./ui/FilterControls";
import DetailPopup     from "./ui/DetailPopup";
import HeatmapOverlay  from "./ui/HeatmapOverlay";
import BotnetPanel     from "./ui/BotnetPanel";
import HistoryPanel    from "./ui/HistoryPanel";
import { useGlobe }    from "./hooks/useGlobe";
import { useAttacks }  from "./hooks/useAttacks";
import { useHeatmap }  from "./hooks/useHeatmap";
import { useBotnet }   from "./hooks/useBotnet";
import { useClock }    from "./hooks/useClock";

const CF_TOKEN       = import.meta.env.VITE_CLOUDFLARE_TOKEN || "";
const ABUSE_KEY      = import.meta.env.VITE_ABUSEIPDB_KEY    || "";
const ALIENVAULT_KEY = import.meta.env.VITE_ALIENVAULT_KEY   || "";

export default function App() {
  const { sceneRef, onSceneReady } = useGlobe();
  const {
    tickAttacks, log, total, history,
    filters, toggleFilter,
    paused, setPaused,
    speed,  setSpeed,
    resetTotal,
  } = useAttacks(sceneRef, {
    cloudflareToken: CF_TOKEN,
    abuseKey:        ABUSE_KEY,
    alienVaultKey:   ALIENVAULT_KEY,
  });
  const {
    initHeatmap, tickHeatmap,
    registerAttack: heatRegister,
    topCountries, visible: heatVisible, toggleHeatmap,
  } = useHeatmap(sceneRef);
  const {
    initBotnet, tickBotnet,
    registerAttack: botnetRegister,
    activeClusters, visible: botnetVisible, toggleBotnet,
  } = useBotnet(sceneRef);

  const clock = useClock();

  const [aps,           setAps]           = useState(0);
  const [threats,       setThreats]       = useState(0);
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [historyOpen,   setHistoryOpen]   = useState(false); // #2

  const liveTotalRef = useRef(0);
  const snapTotalRef = useRef(0);
  const prevLogLen   = useRef(0);
  liveTotalRef.current = total;

  // #1 — Stable APS interval (no stale closure)
  useEffect(() => {
    const iv = setInterval(() => {
      const diff   = liveTotalRef.current - snapTotalRef.current;
      const newAps = Math.max(0, parseFloat((diff / 3).toFixed(1)));
      setAps(newAps);
      setThreats(Math.floor(liveTotalRef.current * 1.4 + Math.random() * 20));
      snapTotalRef.current = liveTotalRef.current;
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  function handleSceneReady(sceneData) {
    onSceneReady(sceneData);
    initHeatmap(sceneData);
    initBotnet(sceneData);
  }

  // Feed log entries into heatmap + botnet
  useEffect(() => {
    if (log.length > prevLogLen.current) {
      const newEntries = log.slice(0, log.length - prevLogLen.current);
      newEntries.forEach(e => {
        heatRegister(e.src);
        botnetRegister({ srcName: e.src, src: e.srcCoords, type: { name: e.type } });
      });
    }
    prevLogLen.current = log.length;
  }, [log]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.code === "Space")              { e.preventDefault(); setPaused(p => !p); }
      if (e.key  === "Escape")             { setSelectedEvent(null); setHistoryOpen(false); }
      if (e.key  === "h" || e.key === "H") toggleHeatmap();
      if (e.key  === "b" || e.key === "B") toggleBotnet();
      if (e.key  === "d" || e.key === "D") setDashboardOpen(o => !o);
      if (e.key  === "1")                  setSpeed(0.5);
      if (e.key  === "2")                  setSpeed(1);
      if (e.key  === "3")                  setSpeed(2);
      if (e.key  === "4")                  setSpeed(5);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleHeatmap, toggleBotnet]);

  const rafRef = useRef(null);
  useEffect(() => {
    let last = performance.now();
    function loop(now) {
      const dt = (now - last) / 1000;
      last = now;
      tickAttacks(dt);
      tickHeatmap();
      tickBotnet();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tickAttacks, tickHeatmap, tickBotnet]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", background: "#000008" }}>
      <Globe onSceneReady={handleSceneReady} />

      <Header aps={aps} threats={threats} total={total} paused={paused} />

      <Dashboard
        log={log} total={total} aps={aps} threats={threats}
        open={dashboardOpen}
        onToggle={() => setDashboardOpen(o => !o)}
      />
      {!dashboardOpen && <Legend />}

      {/* #2 — AttackLog with View All + #4 flash */}
      <AttackLog
        log={log}
        onSelectEvent={setSelectedEvent}
        onViewAll={() => setHistoryOpen(true)}
        historyCount={history.length}
      />

      <HeatmapOverlay topCountries={topCountries} visible={heatVisible}     onToggle={toggleHeatmap} />
      <BotnetPanel    activeClusters={activeClusters} visible={botnetVisible} onToggle={toggleBotnet} />
      <Controls />

      <FilterControls
        filters={filters} onFilterChange={toggleFilter}
        paused={paused}   onPause={() => setPaused(p => !p)}
        speed={speed}     onSpeed={setSpeed}
      />

      {/* #2 — History panel */}
      <HistoryPanel
        history={history}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      {/* Detail popup */}
      {selectedEvent && !historyOpen && (
        <>
          <div onClick={() => setSelectedEvent(null)} style={{
            position: "absolute", inset: 0, zIndex: 199,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)",
          }} />
          <DetailPopup event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </>
      )}

      <Footer clock={clock} part="10 OF 10 — COMPLETE" version="v1.0.0" />
    </div>
  );
}