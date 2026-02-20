// DetailPopup.jsx — Part 8: Click arc popup with IP info & threat details
const orb  = "'Orbitron', monospace";
const mono = "'Share Tech Mono', monospace";

function Row({ label, value, color }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "5px 0", borderBottom: "1px solid rgba(0,255,136,0.06)" }}>
      <span style={{ fontSize: 7, letterSpacing: 2, opacity: 0.4, flexShrink: 0, marginRight: 12 }}>{label}</span>
      <span style={{ fontSize: 8, color: color || "#00ff88", opacity: 0.9, textAlign: "right", wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      background: `${color}22`, border: `1px solid ${color}55`,
      color, fontSize: 7, letterSpacing: 2, padding: "2px 7px", borderRadius: 1,
    }}>{label}</span>
  );
}

export default function DetailPopup({ event, onClose }) {
  if (!event) return null;

  const { srcName, dstName, type, ip, time, pulse_name, tags = [] } = event;

  // Threat score based on attack type
  const scoreMap = { "DDoS": 92, "Ransomware": 97, "SQL Inject": 78, "Port Scan": 45, "Brute Force": 65 };
  const score = scoreMap[type?.name] ?? 70;
  const scoreColor = score > 85 ? "#ff2244" : score > 60 ? "#ff6600" : "#ffdd00";

  return (
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 200, width: 320,
      background: "rgba(0,0,10,0.97)",
      border: `1px solid ${type?.color || "#00ff88"}44`,
      borderTop: `2px solid ${type?.color || "#00ff88"}`,
      fontFamily: mono, color: "#00ff88",
      animation: "fadeInUp 0.25s ease",
      boxShadow: `0 0 40px ${type?.color || "#00ff88"}22, 0 20px 60px rgba(0,0,0,0.8)`,
    }}>

      {/* Header */}
      <div style={{
        padding: "10px 14px",
        borderBottom: `1px solid ${type?.color || "#00ff88"}22`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: `${type?.color || "#00ff88"}08`,
      }}>
        <div>
          <div style={{ fontFamily: orb, fontSize: 9, letterSpacing: 4, color: type?.color || "#00ff88" }}>
            THREAT DETAIL
          </div>
          <div style={{ fontSize: 7, opacity: 0.35, marginTop: 2, letterSpacing: 2 }}>{time} UTC</div>
        </div>
        <button onClick={onClose} style={{
          background: "none", border: "1px solid rgba(255,34,68,0.3)",
          color: "#ff2244", cursor: "pointer", fontSize: 11,
          width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 1,
        }}>✕</button>
      </div>

      {/* Threat score bar */}
      <div style={{ padding: "10px 14px", borderBottom: `1px solid rgba(0,255,136,0.06)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 7, letterSpacing: 2, opacity: 0.4 }}>THREAT SCORE</span>
          <span style={{ fontFamily: orb, fontSize: 13, color: scoreColor, textShadow: `0 0 8px ${scoreColor}` }}>
            {score}<span style={{ fontSize: 8, opacity: 0.5 }}>/100</span>
          </span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
          <div style={{
            height: "100%", width: score + "%",
            background: `linear-gradient(90deg, #ffdd00, ${scoreColor})`,
            borderRadius: 2, boxShadow: `0 0 8px ${scoreColor}`,
          }} />
        </div>
      </div>

      {/* Attack info */}
      <div style={{ padding: "8px 14px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {type && <Badge label={type.name.toUpperCase()} color={type.color} />}
          {tags.slice(0, 3).map(tag => (
            <Badge key={tag} label={tag.toUpperCase()} color="#00aaff" />
          ))}
        </div>

        <Row label="SOURCE IP"     value={ip || "Masked / Proxied"}  color="#ff2244" />
        <Row label="ORIGIN"        value={srcName}                    color="#ff6600" />
        <Row label="TARGET"        value={dstName}                    color="#00ff88" />
        <Row label="ATTACK TYPE"   value={type?.name}                 color={type?.color} />
        <Row label="PULSE / FEED"  value={pulse_name || "Cloudflare Radar"} />
        <Row label="DETECTED"      value={time ? `${time} UTC` : "--"} />
        <Row label="PROTOCOL"      value={type?.name === "DDoS" ? "UDP / TCP Flood" : type?.name === "Port Scan" ? "TCP SYN" : type?.name === "Brute Force" ? "SSH / RDP" : type?.name === "SQL Inject" ? "HTTP/S" : "Multiple"} />
        <Row label="STATUS"        value="ACTIVE THREAT"              color="#ff2244" />
      </div>

      {/* Action buttons */}
      <div style={{
        padding: "10px 14px",
        borderTop: `1px solid rgba(0,255,136,0.08)`,
        display: "flex", gap: 6,
      }}>
        {ip && (
          <a
            href={`https://www.abuseipdb.com/check/${ip}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, padding: "6px 0", textAlign: "center",
              background: "rgba(255,34,68,0.1)", border: "1px solid rgba(255,34,68,0.3)",
              color: "#ff2244", fontSize: 7, letterSpacing: 2,
              textDecoration: "none", fontFamily: mono,
              transition: "all 0.2s",
            }}
          >
            CHECK ABUSEIPDB ↗
          </a>
        )}
        {ip && (
          <a
            href={`https://otx.alienvault.com/indicator/ip/${ip}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, padding: "6px 0", textAlign: "center",
              background: "rgba(0,170,255,0.1)", border: "1px solid rgba(0,170,255,0.3)",
              color: "#00aaff", fontSize: 7, letterSpacing: 2,
              textDecoration: "none", fontFamily: mono,
              transition: "all 0.2s",
            }}
          >
            CHECK OTX ↗
          </a>
        )}
        <button
          onClick={onClose}
          style={{
            flex: ip ? 0 : 1, padding: "6px 14px",
            background: "transparent", border: "1px solid rgba(0,255,136,0.2)",
            color: "#00ff88", fontSize: 7, letterSpacing: 2,
            cursor: "pointer", fontFamily: mono,
          }}
        >
          DISMISS
        </button>
      </div>

      {/* Corner decorations */}
      {["topLeft","topRight","bottomLeft","bottomRight"].map(pos => (
        <div key={pos} style={{
          position: "absolute",
          top:    pos.includes("top")    ? -1 : "auto",
          bottom: pos.includes("bottom") ? -1 : "auto",
          left:   pos.includes("Left")   ? -1 : "auto",
          right:  pos.includes("Right")  ? -1 : "auto",
          width: 8, height: 8,
          borderTop:    pos.includes("top")    ? `2px solid ${type?.color || "#00ff88"}` : "none",
          borderBottom: pos.includes("bottom") ? `2px solid ${type?.color || "#00ff88"}` : "none",
          borderLeft:   pos.includes("Left")   ? `2px solid ${type?.color || "#00ff88"}` : "none",
          borderRight:  pos.includes("Right")  ? `2px solid ${type?.color || "#00ff88"}` : "none",
        }} />
      ))}
    </div>
  );
}