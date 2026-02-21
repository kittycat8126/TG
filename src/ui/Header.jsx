// Header.jsx — Part 10: Polished header with paused indicator
const orb  = "'Orbitron', monospace";
const mono = "'Share Tech Mono', monospace";

export default function Header({ aps, threats, total, paused }) {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
      height: 48,
      background: "linear-gradient(180deg, rgba(0,0,8,0.98) 0%, rgba(0,0,8,0.0) 100%)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px",
      fontFamily: mono,
    }}>
      {/* Logo */}
      <div style={{ fontFamily: orb, fontWeight: 900, fontSize: 16, letterSpacing: 6, color: "#00ff88", textShadow: "0 0 20px rgba(0,255,136,0.4)" }}>
        SENTINEL<span style={{ color: "#ff2244" }}>//</span>GRID
      </div>

      {/* Center — paused indicator */}
      {paused && (
        <div style={{
          fontFamily: orb, fontSize: 9, letterSpacing: 6,
          color: "#ff2244", animation: "blink 1s step-end infinite",
          textShadow: "0 0 12px #ff2244",
        }}>
          ⏸ PAUSED — PRESS SPACE TO RESUME
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        {[
          { label: "ATK/SEC", value: aps,     color: "#ff2244" },
          { label: "ACTIVE",  value: threats,  color: "#ff6600" },
          { label: "TOTAL",   value: total,    color: "#00ff88" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 6, letterSpacing: 3, opacity: 0.35, color: "#00ff88" }}>{label}</div>
            <div style={{ fontFamily: orb, fontSize: 14, color, textShadow: `0 0 8px ${color}88` }}>{value}</div>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff2244", boxShadow: "0 0 8px #ff2244", animation: "blink 1.5s ease-in-out infinite" }} />
          <span style={{ fontSize: 7, letterSpacing: 3, color: "#ff2244", opacity: 0.8 }}>LIVE FEED</span>
        </div>
      </div>
    </div>
  );
}