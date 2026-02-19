// Header.jsx — SENTINEL//GRID logo + live stats bar
export default function Header({ aps, threats, total, nodes = 247 }) {
  const orb  = "'Orbitron', monospace";
  const mono = "'Share Tech Mono', monospace";

  const stats = [
    { label: "ATK/SEC",  value: aps,     color: "#ff2244" },
    { label: "ACTIVE",   value: threats, color: "#ff6600" },
    { label: "TOTAL",    value: total,   color: "#ff88ff" },
    { label: "NODES",    value: nodes,   color: "#00ff88" },
  ];

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 20px",
      borderBottom: "1px solid rgba(0,255,136,0.15)",
      background: "linear-gradient(180deg, rgba(0,0,8,0.96) 0%, transparent 100%)",
      fontFamily: mono,
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: orb, fontWeight: 900, fontSize: 16, letterSpacing: 6,
        color: "#00ff88", textShadow: "0 0 20px rgba(0,255,136,0.5)",
      }}>
        SENTINEL<span style={{ color: "#ff2244" }}>//</span>GRID
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, letterSpacing: 3, color: "#00ff88" }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#ff2244", boxShadow: "0 0 7px #ff2244",
            animation: "blink 1s ease-in-out infinite",
          }} />
          LIVE FEED
        </div>

        {stats.map(s => (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            <div style={{ fontSize: 7, letterSpacing: 3, opacity: 0.4, color: "#00ff88" }}>{s.label}</div>
            <div style={{
              fontFamily: orb, fontWeight: 700, fontSize: 13,
              color: s.color, textShadow: `0 0 8px ${s.color}88`,
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
