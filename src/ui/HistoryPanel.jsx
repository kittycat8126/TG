// HistoryPanel.jsx — #2: Full session attack history, scrollable
const orb  = "'Orbitron', monospace";
const mono = "'Share Tech Mono', monospace";

export default function HistoryPanel({ history, open, onClose }) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "absolute", inset: 0, zIndex: 210,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)",
      }} />

      {/* Panel */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 220, width: 480, maxHeight: "70vh",
        backgroundColor: "#040410",
        border: "1px solid rgba(0,255,136,0.2)",
        borderTop: "2px solid #00ff88",
        display: "flex", flexDirection: "column",
        fontFamily: mono,
        boxShadow: "0 0 60px rgba(0,255,136,0.1), 0 24px 80px rgba(0,0,0,0.97)",
        animation: "fadeInUp 0.25s ease",
      }}>
        {/* Header */}
        <div style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(0,255,136,0.1)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          backgroundColor: "rgba(0,255,136,0.04)",
        }}>
          <div>
            <div style={{ fontFamily: orb, fontSize: 10, letterSpacing: 4, color: "#00ff88" }}>ATTACK HISTORY</div>
            <div style={{ fontSize: 7, opacity: 0.35, marginTop: 2, letterSpacing: 2, color: "#00ff88" }}>
              {history.length} EVENTS THIS SESSION
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "transparent", border: "1px solid rgba(255,34,68,0.4)",
            color: "#ff2244", cursor: "pointer", fontSize: 14,
            width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: mono,
          }}>✕</button>
        </div>

        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "80px 1fr 1fr 70px",
          padding: "5px 16px", borderBottom: "1px solid rgba(0,255,136,0.08)",
          fontSize: 6, letterSpacing: 2, opacity: 0.3, color: "#00ff88",
        }}>
          <span>TYPE</span><span>ORIGIN</span><span>TARGET</span><span>TIME</span>
        </div>

        {/* Scrollable list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {history.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", opacity: 0.3, fontSize: 8, color: "#00ff88" }}>
              No attacks recorded yet...
            </div>
          ) : history.map((entry, i) => (
            <div key={entry.id || i} style={{
              display: "grid", gridTemplateColumns: "80px 1fr 1fr 70px",
              padding: "5px 16px",
              borderBottom: "1px solid rgba(0,255,136,0.04)",
              fontSize: 7, letterSpacing: 1,
              background: i % 2 === 0 ? "transparent" : "rgba(0,255,136,0.015)",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${entry.color}10`}
            onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(0,255,136,0.015)"}
            >
              <span style={{ color: entry.color, fontFamily: orb, fontSize: 6 }}>{entry.type}</span>
              <span style={{ color: "#ff6600", opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.src}</span>
              <span style={{ color: "#00ff88", opacity: 0.7,  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.dst}</span>
              <span style={{ opacity: 0.35, fontSize: 6 }}>{entry.time}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "8px 16px", borderTop: "1px solid rgba(0,255,136,0.08)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 7, opacity: 0.35, color: "#00ff88",
        }}>
          <span>MAX 500 EVENTS STORED PER SESSION</span>
          <button onClick={onClose} style={{
            background: "transparent", border: "1px solid rgba(0,255,136,0.2)",
            color: "#00ff88", fontSize: 7, letterSpacing: 2,
            padding: "4px 12px", cursor: "pointer", fontFamily: mono,
          }}>CLOSE</button>
        </div>
      </div>
    </>
  );
}