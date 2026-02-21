// AttackLog.jsx — #2 + #4: View All button + click flash effect
import { useState } from "react";

const orb  = "'Orbitron', monospace";
const mono = "'Share Tech Mono', monospace";

export default function AttackLog({ log, onSelectEvent, onViewAll, historyCount }) {
  const [flashId, setFlashId] = useState(null);

  function handleClick(entry) {
    // #4 — flash effect
    setFlashId(entry.id);
    setTimeout(() => setFlashId(null), 400);
    onSelectEvent?.(entry);
  }

  return (
    <div style={{
      position: "absolute", right: 14, top: 55, zIndex: 50,
      width: 215, display: "flex", flexDirection: "column", gap: 3,
      fontFamily: mono,
    }}>
      {/* Header row with View All button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
        <div style={{ fontSize: 7, letterSpacing: 2, opacity: 0.4, color: "#00ff88" }}>
          LIVE ATTACK FEED
        </div>
        {historyCount > 0 && (
          <button
            onClick={onViewAll}
            style={{
              background: "transparent",
              border: "1px solid rgba(0,255,136,0.2)",
              color: "#00ff88", opacity: 0.5,
              fontSize: 6, letterSpacing: 2, padding: "2px 7px",
              cursor: "pointer", fontFamily: mono,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.opacity = 1; e.target.style.borderColor = "#00ff88"; }}
            onMouseLeave={e => { e.target.style.opacity = 0.5; e.target.style.borderColor = "rgba(0,255,136,0.2)"; }}
          >
            ALL {historyCount} ↗
          </button>
        )}
      </div>

      {log.map(entry => {
        const isFlashing = flashId === entry.id;
        return (
          <div
            key={entry.id}
            onClick={() => handleClick(entry)}
            style={{
              background: isFlashing ? `${entry.color}22` : "rgba(0,0,8,0.82)",
              border: `1px solid ${isFlashing ? entry.color : entry.color + "33"}`,
              borderLeft: `2px solid ${entry.color}`,
              padding: "5px 8px",
              fontSize: 7, letterSpacing: 1,
              animation: "slideIn 0.3s ease",
              lineHeight: 1.6,
              cursor: "pointer",
              transform: isFlashing ? "scale(1.01)" : "scale(1)",
              boxShadow: isFlashing ? `0 0 12px ${entry.color}44` : "none",
              transition: "background 0.15s, border-color 0.15s, transform 0.1s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              if (!isFlashing) {
                e.currentTarget.style.background = `${entry.color}11`;
                e.currentTarget.style.borderColor = entry.color;
              }
            }}
            onMouseLeave={e => {
              if (!isFlashing) {
                e.currentTarget.style.background = "rgba(0,0,8,0.82)";
                e.currentTarget.style.borderColor = `${entry.color}33`;
                e.currentTarget.style.borderLeftColor = entry.color;
              }
            }}
          >
            <div style={{ color: entry.color, fontFamily: orb, fontSize: 7, letterSpacing: 2 }}>
              {entry.type}
            </div>
            <div style={{ opacity: 0.75, color: "#00ff88" }}>
              {entry.src} → {entry.dst}
            </div>
            {entry.ip && (
              <div style={{ opacity: 0.4, fontSize: 6, color: "#00aaff", fontFamily: mono }}>
                {entry.ip}
              </div>
            )}
            <div style={{ opacity: 0.3, fontSize: 6, color: "#00ff88" }}>
              {entry.time} UTC · CLICK TO INSPECT
            </div>
          </div>
        );
      })}
    </div>
  );
}