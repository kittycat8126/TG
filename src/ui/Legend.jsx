// Legend.jsx — Attack type color key (left side)
import { ATTACK_TYPES } from "../attacks/attackData";

export default function Legend() {
  return (
    <div style={{
      position: "absolute", left: 14, top: 58, zIndex: 50,
      display: "flex", flexDirection: "column", gap: 6,
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      <div style={{ fontSize: 7, letterSpacing: 3, opacity: 0.4, color: "#00ff88", marginBottom: 2 }}>
        ATTACK TYPES
      </div>
      {ATTACK_TYPES.map(t => (
        <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 8, letterSpacing: 1 }}>
          <div style={{
            width: 22, height: 2,
            background: t.color,
            boxShadow: `0 0 5px ${t.color}`,
            borderRadius: 1,
          }} />
          <span style={{ color: t.color, opacity: 0.9 }}>{t.name}</span>
        </div>
      ))}
    </div>
  );
}
