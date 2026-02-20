// FilterControls.jsx — Part 7: Attack type filters, pause, speed control
import { ATTACK_TYPES } from "../attacks/attackData";

const orb  = "'Orbitron', monospace";
const mono = "'Share Tech Mono', monospace";

function IconBtn({ label, active, color = "#00ff88", onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? `${color}22` : "transparent",
        border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
        color: active ? color : "rgba(255,255,255,0.3)",
        fontFamily: mono, fontSize: 8, letterSpacing: 2,
        padding: "5px 10px", cursor: "pointer", borderRadius: 1,
        boxShadow: active ? `0 0 8px ${color}44` : "none",
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </button>
  );
}

export default function FilterControls({ filters, onFilterChange, paused, onPause, speed, onSpeed }) {
  return (
    <div style={{
      position: "absolute", bottom: 38, left: "50%", transform: "translateX(-50%)",
      zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      fontFamily: mono,
    }}>

      {/* ── ATTACK TYPE TOGGLES ── */}
      <div style={{
        display: "flex", gap: 5, alignItems: "center",
        background: "rgba(0,0,8,0.88)",
        border: "1px solid rgba(0,255,136,0.12)",
        padding: "7px 12px", borderRadius: 2,
      }}>
        <span style={{ fontSize: 7, letterSpacing: 3, opacity: 0.3, marginRight: 4 }}>FILTER</span>
        {ATTACK_TYPES.map(t => (
          <button
            key={t.name}
            onClick={() => onFilterChange(t.name)}
            title={`Toggle ${t.name}`}
            style={{
              background: filters[t.name] ? `${t.color}22` : "transparent",
              border: `1px solid ${filters[t.name] ? t.color : "rgba(255,255,255,0.1)"}`,
              color: filters[t.name] ? t.color : "rgba(255,255,255,0.25)",
              fontFamily: mono, fontSize: 7, letterSpacing: 1,
              padding: "4px 8px", cursor: "pointer", borderRadius: 1,
              boxShadow: filters[t.name] ? `0 0 6px ${t.color}44` : "none",
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: filters[t.name] ? t.color : "rgba(255,255,255,0.15)",
              boxShadow: filters[t.name] ? `0 0 4px ${t.color}` : "none",
              display: "inline-block", flexShrink: 0,
            }} />
            {t.name}
          </button>
        ))}
      </div>

      {/* ── PLAYBACK CONTROLS ── */}
      <div style={{
        display: "flex", gap: 5, alignItems: "center",
        background: "rgba(0,0,8,0.88)",
        border: "1px solid rgba(0,255,136,0.12)",
        padding: "7px 12px", borderRadius: 2,
      }}>
        <span style={{ fontSize: 7, letterSpacing: 3, opacity: 0.3, marginRight: 4 }}>PLAYBACK</span>

        {/* Pause/Resume */}
        <button
          onClick={onPause}
          style={{
            background: paused ? "rgba(255,34,68,0.2)" : "rgba(0,255,136,0.08)",
            border: `1px solid ${paused ? "#ff2244" : "rgba(0,255,136,0.3)"}`,
            color: paused ? "#ff2244" : "#00ff88",
            fontFamily: mono, fontSize: 8, letterSpacing: 2,
            padding: "4px 12px", cursor: "pointer", borderRadius: 1,
            transition: "all 0.2s",
          }}
        >
          {paused ? "▶ RESUME" : "⏸ PAUSE"}
        </button>

        {/* Speed controls */}
        <span style={{ fontSize: 7, letterSpacing: 3, opacity: 0.3, marginLeft: 6 }}>SPEED</span>
        {[
          { label: "0.5×", value: 0.5 },
          { label: "1×",   value: 1   },
          { label: "2×",   value: 2   },
          { label: "5×",   value: 5   },
        ].map(s => (
          <button
            key={s.value}
            onClick={() => onSpeed(s.value)}
            style={{
              background: speed === s.value ? "rgba(0,170,255,0.18)" : "transparent",
              border: `1px solid ${speed === s.value ? "#00aaff" : "rgba(255,255,255,0.1)"}`,
              color: speed === s.value ? "#00aaff" : "rgba(255,255,255,0.3)",
              fontFamily: orb, fontSize: 7,
              padding: "4px 8px", cursor: "pointer", borderRadius: 1,
              transition: "all 0.2s",
            }}
          >
            {s.label}
          </button>
        ))}

        {/* Clear / Reset */}
        <button
          onClick={() => window.location.reload()}
          title="Reset all"
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.2)",
            fontFamily: mono, fontSize: 7, letterSpacing: 2,
            padding: "4px 10px", cursor: "pointer", borderRadius: 1,
            marginLeft: 4, transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.target.style.color = "#ff6600"; e.target.style.borderColor = "#ff6600"; }}
          onMouseLeave={e => { e.target.style.color = "rgba(255,255,255,0.2)"; e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
        >
          ↺ RESET
        </button>
      </div>
    </div>
  );
}