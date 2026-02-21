// BotnetPanel.jsx — Part 9: Shows active botnet clusters
const orb  = "'Orbitron', monospace";
const mono = "'Share Tech Mono', monospace";

function ClusterCard({ cluster }) {
  const heat = Math.min(1, cluster.count / 12);
  const color = heat > 0.7 ? "#ff0033" : heat > 0.4 ? "#ff4400" : "#ff8800";

  return (
    <div style={{
      background: `${color}08`,
      border: `1px solid ${color}33`,
      borderLeft: `2px solid ${color}`,
      padding: "7px 10px", marginBottom: 5,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: orb, fontSize: 8, color, letterSpacing: 2 }}>
          CLUSTER
        </span>
        <span style={{
          fontFamily: orb, fontSize: 11, color,
          textShadow: `0 0 8px ${color}`,
        }}>
          {cluster.count} <span style={{ fontSize: 7, opacity: 0.5 }}>nodes</span>
        </span>
      </div>
      <div style={{ fontSize: 7, opacity: 0.6, marginBottom: 2, color: "#00ff88" }}>
        {cluster.srcNames.length > 30
          ? cluster.srcNames.slice(0, 30) + "..."
          : cluster.srcNames}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 6, opacity: 0.4, color: "#00aaff" }}>{cluster.types}</span>
        <span style={{ fontSize: 6, opacity: 0.35 }}>
          {cluster.age < 2 ? "JUST NOW" : `${cluster.age}s ago`}
        </span>
      </div>
      {/* Activity bar */}
      <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1, marginTop: 5 }}>
        <div style={{
          height: "100%", width: (heat * 100) + "%",
          background: color, borderRadius: 1,
          boxShadow: `0 0 4px ${color}`,
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

export default function BotnetPanel({ activeClusters, visible, onToggle }) {
  return (
    <>
      {/* Toggle button — top right area */}
      <div style={{
        position: "absolute", top: 55, right: 240,
        zIndex: 55,
      }}>
        <button
          onClick={onToggle}
          style={{
            background: visible ? "rgba(255,68,0,0.15)" : "rgba(0,0,8,0.85)",
            border: `1px solid ${visible ? "#ff440066" : "rgba(0,255,136,0.15)"}`,
            color: visible ? "#ff4400" : "rgba(0,255,136,0.5)",
            fontFamily: orb, fontSize: 7, letterSpacing: 3,
            padding: "5px 14px", cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          ⬡ BOTNETS {visible ? "ON" : "OFF"}
        </button>
      </div>

      {/* Active clusters panel — bottom right above log */}
      {visible && activeClusters.length > 0 && (
        <div style={{
          position: "absolute", right: 14, bottom: 110,
          zIndex: 55, width: 210,
          fontFamily: mono, color: "#00ff88",
        }}>
          <div style={{
            background: "rgba(0,0,8,0.9)",
            border: "1px solid rgba(255,68,0,0.25)",
            borderTop: "2px solid #ff4400",
            padding: "10px 12px",
          }}>
            <div style={{ fontSize: 7, letterSpacing: 3, color: "#ff4400", opacity: 0.8, marginBottom: 8 }}>
              ⬡ BOTNET CLUSTERS — LIVE
            </div>
            {activeClusters.map(c => (
              <ClusterCard key={c.key} cluster={c} />
            ))}
          </div>
        </div>
      )}

      {/* No clusters yet */}
      {visible && activeClusters.length === 0 && (
        <div style={{
          position: "absolute", right: 14, bottom: 110,
          zIndex: 55, width: 210, fontFamily: mono,
        }}>
          <div style={{
            background: "rgba(0,0,8,0.85)",
            border: "1px solid rgba(255,68,0,0.15)",
            borderTop: "2px solid rgba(255,68,0,0.4)",
            padding: "10px 12px",
          }}>
            <div style={{ fontSize: 7, letterSpacing: 3, color: "#ff4400", opacity: 0.6, marginBottom: 6 }}>
              ⬡ BOTNET CLUSTERS
            </div>
            <div style={{ fontSize: 7, opacity: 0.25, textAlign: "center", padding: "8px 0" }}>
              Monitoring for clusters...<br />
              <span style={{ fontSize: 6 }}>(3+ attacks from same region)</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}