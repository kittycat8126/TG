// HeatmapOverlay.jsx — Part 5: Repositioned to not overlap filter controls
const orb  = "'Orbitron', monospace";
const mono = "'Share Tech Mono', monospace";

function HeatBar({ name, intensity }) {
  const pct   = Math.min(100, intensity * 100);
  const color = pct > 70 ? "#ff2244" : pct > 45 ? "#ff6600" : pct > 25 ? "#ffdd00" : "#00ff88";
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 7, letterSpacing: 1 }}>
        <span style={{ color, opacity: 0.9 }}>{name}</span>
        <span style={{ color, opacity: 0.6, fontFamily: orb, fontSize: 7 }}>{pct.toFixed(0)}%</span>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: pct + "%",
          background: `linear-gradient(90deg, #ffdd00, ${color})`,
          boxShadow: `0 0 6px ${color}`, borderRadius: 2,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

export default function HeatmapOverlay({ topCountries, visible, onToggle }) {
  return (
    <>
      {/* Toggle button — top center, below header */}
      <div style={{
        position: "absolute", top: 55, left: "50%",
        transform: "translateX(-50%)",
        zIndex: 55,
      }}>
        <button
          onClick={onToggle}
          style={{
            background: visible ? "rgba(255,34,68,0.15)" : "rgba(0,0,8,0.85)",
            border: `1px solid ${visible ? "#ff244466" : "rgba(0,255,136,0.15)"}`,
            color: visible ? "#ff2244" : "rgba(0,255,136,0.5)",
            fontFamily: orb, fontSize: 7, letterSpacing: 3,
            padding: "5px 14px", cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          🔥 HEATMAP {visible ? "ON" : "OFF"}
        </button>
      </div>

      {/* Country heat panel — left side, below dashboard toggle */}
      {visible && topCountries.length > 0 && (
        <div style={{
          position: "absolute", left: 14, bottom: 110,
          zIndex: 55, fontFamily: mono,
          background: "rgba(0,0,8,0.88)",
          border: "1px solid rgba(255,34,68,0.2)",
          borderTop: "2px solid #ff2244",
          padding: "10px 14px",
          minWidth: 180,
          animation: "fadeInUp 0.3s ease",
        }}>
          <div style={{ fontSize: 7, letterSpacing: 3, color: "#ff2244", opacity: 0.7, marginBottom: 10 }}>
            🔥 HEAT SOURCES
          </div>
          {topCountries.map(c => (
            <HeatBar key={c.code} name={c.name} intensity={c.intensity} />
          ))}
        </div>
      )}
    </>
  );
}