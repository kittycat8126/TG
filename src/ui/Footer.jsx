// Footer.jsx — version string, UTC clock, part label
export default function Footer({ clock, part = "1 OF 10 — GLOBE FOUNDATION", version = "v0.1.0" }) {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 50,
      padding: "9px 20px",
      borderTop: "1px solid rgba(0,255,136,0.15)",
      background: "linear-gradient(0deg, rgba(0,0,8,0.96) 0%, transparent 100%)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      fontSize: 8, letterSpacing: 2, opacity: 0.5,
      fontFamily: "'Share Tech Mono', monospace",
      color: "#00ff88",
    }}>
      <span>SENTINEL GLOBAL THREAT INTELLIGENCE {version}</span>
      <span>{clock}</span>
      <span>PART {part}</span>
    </div>
  );
}
