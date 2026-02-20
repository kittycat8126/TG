// AttackLog.jsx — Part 8: Clickable entries that open DetailPopup
const orb  = "'Orbitron', monospace";
const mono = "'Share Tech Mono', monospace";

export default function AttackLog({ log, onSelectEvent }) {
  return (
    <div style={{
      position: "absolute", right: 14, top: 55, zIndex: 50,
      width: 210, display: "flex", flexDirection: "column", gap: 4,
      fontFamily: mono,
    }}>
      <div style={{ fontSize: 7, letterSpacing: 3, opacity: 0.4, color: "#00ff88", marginBottom: 2 }}>
        LIVE ATTACK FEED — <span style={{ opacity: 0.6 }}>CLICK TO INSPECT</span>
      </div>

      {log.map(entry => (
        <div
          key={entry.id}
          onClick={() => onSelectEvent?.(entry)}
          style={{
            background: "rgba(0,0,8,0.80)",
            border: `1px solid ${entry.color}33`,
            borderLeft: `2px solid ${entry.color}`,
            padding: "5px 8px",
            fontSize: 7, letterSpacing: 1,
            animation: "slideIn 0.3s ease",
            lineHeight: 1.6,
            cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${entry.color}11`;
            e.currentTarget.style.borderColor = entry.color;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(0,0,8,0.80)";
            e.currentTarget.style.borderColor = `${entry.color}33`;
            e.currentTarget.style.borderLeftColor = entry.color;
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
          <div style={{ opacity: 0.35, fontSize: 6, color: "#00ff88" }}>
            {entry.time} UTC
          </div>
        </div>
      ))}
    </div>
  );
}