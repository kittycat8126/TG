// AttackLog.jsx — Live scrolling attack feed panel (right side)
export default function AttackLog({ log }) {
  const orb  = "'Orbitron', monospace";
  const mono = "'Share Tech Mono', monospace";

  return (
    <div style={{
      position: "absolute", right: 14, top: 55, zIndex: 50,
      width: 210, display: "flex", flexDirection: "column", gap: 4,
      fontFamily: mono,
    }}>
      <div style={{ fontSize: 7, letterSpacing: 3, opacity: 0.4, color: "#00ff88", marginBottom: 2 }}>
        LIVE ATTACK FEED
      </div>

      {log.map(entry => (
        <div key={entry.id} style={{
          background: "rgba(0,0,8,0.80)",
          border: `1px solid ${entry.color}33`,
          borderLeft: `2px solid ${entry.color}`,
          padding: "5px 8px",
          fontSize: 7, letterSpacing: 1,
          animation: "slideIn 0.3s ease",
          lineHeight: 1.6,
        }}>
          <div style={{ color: entry.color, fontFamily: orb, fontSize: 7, letterSpacing: 2 }}>
            {entry.type}
          </div>
          <div style={{ opacity: 0.75, color: "#00ff88" }}>
            {entry.src} → {entry.dst}
          </div>
          <div style={{ opacity: 0.35, fontSize: 6, color: "#00ff88" }}>
            {entry.time} UTC
          </div>
        </div>
      ))}
    </div>
  );
}
