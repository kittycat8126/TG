// Footer.jsx — Part 10: Polished footer with keyboard hints
const orb  = "'Orbitron', monospace";
const mono = "'Share Tech Mono', monospace";

export default function Footer({ clock, part, version }) {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 100,
      height: 32,
      background: "linear-gradient(0deg, rgba(0,0,8,0.98) 0%, rgba(0,0,8,0.0) 100%)",
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      padding: "0 16px 6px",
      fontFamily: mono, fontSize: 7, letterSpacing: 2,
    }}>
      {/* Left — version + part */}
      <div style={{ opacity: 0.3, color: "#00ff88" }}>
        SENTINEL//GRID {version} — {part}
      </div>

      {/* Center — keyboard hints */}
      <div style={{ display: "flex", gap: 12, opacity: 0.2, color: "#00ff88" }}>
        {[
          ["SPACE", "PAUSE"],
          ["D", "DASHBOARD"],
          ["H", "HEATMAP"],
          ["B", "BOTNETS"],
          ["ESC", "CLOSE"],
        ].map(([key, label]) => (
          <span key={key}>
            <span style={{ border: "1px solid rgba(0,255,136,0.3)", padding: "1px 4px", borderRadius: 1, marginRight: 3 }}>{key}</span>
            {label}
          </span>
        ))}
      </div>

      {/* Right — clock */}
      <div style={{ opacity: 0.45, color: "#00ff88", fontFamily: orb, fontSize: 8 }}>
        {clock} UTC
      </div>
    </div>
  );
}