// Controls.jsx — DRAG/SCROLL hint overlay
export default function Controls() {
  return (
    <div style={{
      position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
      zIndex: 50, display: "flex", flexDirection: "column", gap: 8,
      fontFamily: "'Share Tech Mono', monospace", color: "#00ff88",
    }}>
      {[["DRAG", "ROTATE"], ["SCROLL", "ZOOM"]].map(([key, label]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 8, letterSpacing: 2, opacity: 0.28 }}>
          <span style={{ border: "1px solid currentColor", padding: "1px 4px", fontSize: 7 }}>{key}</span>
          {label}
        </div>
      ))}
    </div>
  );
}
