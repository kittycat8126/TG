// Dashboard.jsx — Part 6: Live stats panel with charts
import { useState, useEffect, useRef } from "react";
import { ATTACK_TYPES } from "../attacks/attackData";

const orb  = "'Orbitron', monospace";
const mono = "'Share Tech Mono', monospace";

// ── MINI SPARKLINE CHART ─────────────────────────────────────
function Sparkline({ data, color, height = 40 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const max = Math.max(...data, 1);
    const min = 0;
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * W,
      y: H - ((v - min) / (max - min)) * H * 0.85 - 2,
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + "55");
    grad.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.moveTo(pts[0].x, H);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.stroke();
  }, [data, color]);

  return (
    <canvas
      ref={canvasRef}
      width={160} height={height}
      style={{ width: "100%", height, display: "block" }}
    />
  );
}

// ── ATTACK TYPE BAR ──────────────────────────────────────────
function AttackBar({ name, color, count, max }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 8, letterSpacing: 1 }}>
        <span style={{ color, opacity: 0.9 }}>{name}</span>
        <span style={{ opacity: 0.5 }}>{count}</span>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: pct + "%",
          background: color, borderRadius: 2,
          boxShadow: `0 0 6px ${color}`,
          transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

// ── THREAT METER ─────────────────────────────────────────────
function ThreatMeter({ level }) {
  const pct   = Math.min(100, level);
  const color = pct > 75 ? "#ff2244" : pct > 45 ? "#ff6600" : "#ffdd00";
  const label = pct > 75 ? "CRITICAL" : pct > 45 ? "ELEVATED" : pct > 20 ? "GUARDED" : "LOW";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 8, letterSpacing: 2 }}>
        <span style={{ opacity: 0.4 }}>THREAT LEVEL</span>
        <span style={{ color, fontFamily: orb, fontSize: 9 }}>{label}</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: pct + "%",
          background: `linear-gradient(90deg, #ffdd00, ${color})`,
          boxShadow: `0 0 10px ${color}`,
          borderRadius: 3,
          transition: "width 1s ease, background 1s ease",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 6, opacity: 0.25, letterSpacing: 1 }}>
        <span>LOW</span><span>GUARDED</span><span>ELEVATED</span><span>CRITICAL</span>
      </div>
    </div>
  );
}

// ── STAT CARD ────────────────────────────────────────────────
function StatCard({ label, value, sub, color = "#00ff88", flash }) {
  return (
    <div style={{
      background: "rgba(0,255,136,0.03)",
      border: `1px solid ${color}22`,
      borderLeft: `2px solid ${color}`,
      padding: "8px 10px",
      borderRadius: 2,
    }}>
      <div style={{ fontSize: 6, letterSpacing: 3, opacity: 0.4, marginBottom: 3 }}>{label}</div>
      <div style={{
        fontFamily: orb, fontWeight: 700, fontSize: 18, color,
        textShadow: `0 0 12px ${color}88`,
        transition: "color 0.3s",
      }}>{value}</div>
      {sub && <div style={{ fontSize: 7, opacity: 0.35, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── MAIN DASHBOARD ───────────────────────────────────────────
export default function Dashboard({ log, total, aps, threats, open, onToggle }) {
  const [apsHistory,  setApsHistory]  = useState(Array(30).fill(0).map((_,i) => i < 25 ? 0 : Math.random() * 0.3));
  const [typeCounts,  setTypeCounts]  = useState({});
  const [topSources,  setTopSources]  = useState({});
  const [peakAps,     setPeakAps]     = useState(0);
  const [threatLevel, setThreatLevel] = useState(20);

  // Track APS history
  useEffect(() => {
    setApsHistory(prev => {
      const next = [...prev.slice(1), aps];
      return next;
    });
    setPeakAps(prev => Math.max(prev, aps));
    setThreatLevel(Math.min(100, 20 + aps * 0.8 + threats * 0.05));
  }, [aps, threats]);

  // Count attack types and sources from log
  useEffect(() => {
    if (!log.length) return;
    setTypeCounts(prev => {
      const next = { ...prev };
      const latest = log[0];
      if (latest) next[latest.type] = (next[latest.type] || 0) + 1;
      return next;
    });
    setTopSources(prev => {
      const next = { ...prev };
      const latest = log[0];
      if (latest) {
        const src = latest.src.split(",")[0].trim();
        next[src] = (next[src] || 0) + 1;
      }
      return next;
    });
  }, [log]);

  const maxTypeCount = Math.max(...Object.values(typeCounts), 1);
  const topSourceList = Object.entries(topSources)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxSrcCount = topSourceList[0]?.[1] || 1;

  if (!open) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: "absolute", left: 14, bottom: 80, zIndex: 60,
          background: "rgba(0,0,8,0.9)", border: "1px solid rgba(0,255,136,0.3)",
          color: "#00ff88", fontFamily: orb, fontSize: 8, letterSpacing: 3,
          padding: "8px 14px", cursor: "pointer",
          boxShadow: "0 0 12px rgba(0,255,136,0.1)",
        }}
      >
        ▶ DASHBOARD
      </button>
    );
  }

  return (
    <div style={{
      position: "absolute", left: 14, top: 55, bottom: 40, zIndex: 60,
      width: 220,
      background: "rgba(0,0,8,0.92)",
      border: "1px solid rgba(0,255,136,0.15)",
      borderTop: "2px solid #00ff88",
      display: "flex", flexDirection: "column",
      fontFamily: mono, color: "#00ff88",
      overflow: "hidden",
      animation: "fadeInUp 0.3s ease",
    }}>
      {/* Header */}
      <div style={{
        padding: "8px 12px",
        borderBottom: "1px solid rgba(0,255,136,0.1)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: orb, fontSize: 9, letterSpacing: 4 }}>DASHBOARD</span>
        <button onClick={onToggle} style={{
          background: "none", border: "none", color: "#ff2244",
          cursor: "pointer", fontSize: 12, lineHeight: 1,
        }}>✕</button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <StatCard label="TOTAL ATTACKS" value={total}    color="#00ff88" />
          <StatCard label="ATTACK/SEC"    value={aps}      color="#ff2244" />
          <StatCard label="ACTIVE THREATS"value={threats}  color="#ff6600" />
          <StatCard label="PEAK APS"      value={peakAps}  color="#ff88ff" />
        </div>

        {/* ── THREAT METER ── */}
        <div style={{ padding: "8px 0", borderTop: "1px solid rgba(0,255,136,0.08)" }}>
          <ThreatMeter level={threatLevel} />
        </div>

        {/* ── APS SPARKLINE ── */}
        <div style={{ borderTop: "1px solid rgba(0,255,136,0.08)", paddingTop: 10 }}>
          <div style={{ fontSize: 7, letterSpacing: 3, opacity: 0.4, marginBottom: 6 }}>
            ATTACKS / SEC — LIVE
          </div>
          <Sparkline data={apsHistory} color="#00ff88" height={42} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 6, opacity: 0.25, marginTop: 2 }}>
            <span>30s ago</span><span>now</span>
          </div>
        </div>

        {/* ── ATTACK TYPE BREAKDOWN ── */}
        <div style={{ borderTop: "1px solid rgba(0,255,136,0.08)", paddingTop: 10 }}>
          <div style={{ fontSize: 7, letterSpacing: 3, opacity: 0.4, marginBottom: 8 }}>
            ATTACK BREAKDOWN
          </div>
          {ATTACK_TYPES.map(t => (
            <AttackBar
              key={t.name}
              name={t.name}
              color={t.color}
              count={typeCounts[t.name] || 0}
              max={maxTypeCount}
            />
          ))}
        </div>

        {/* ── TOP SOURCE COUNTRIES ── */}
        {topSourceList.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(0,255,136,0.08)", paddingTop: 10 }}>
            <div style={{ fontSize: 7, letterSpacing: 3, opacity: 0.4, marginBottom: 8 }}>
              TOP ATTACK SOURCES
            </div>
            {topSourceList.map(([src, count]) => (
              <div key={src} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 8 }}>
                  <span style={{ opacity: 0.8 }}>{src}</span>
                  <span style={{ opacity: 0.45 }}>{count}</span>
                </div>
                <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
                  <div style={{
                    height: "100%",
                    width: ((count / maxSrcCount) * 100) + "%",
                    background: "linear-gradient(90deg, #00ff88, #00aaff)",
                    borderRadius: 1,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SESSION INFO ── */}
        <div style={{ borderTop: "1px solid rgba(0,255,136,0.08)", paddingTop: 10 }}>
          <div style={{ fontSize: 7, letterSpacing: 3, opacity: 0.4, marginBottom: 8 }}>SESSION INFO</div>
          {[
            { label: "DATA SOURCES", value: "CF + OTX + ABUSE" },
            { label: "REFRESH RATE", value: "5 MIN"            },
            { label: "NODES ONLINE", value: "247"              },
            { label: "UPTIME",       value: "LIVE"             },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 7 }}>
              <span style={{ opacity: 0.35, letterSpacing: 1 }}>{label}</span>
              <span style={{ opacity: 0.7 }}>{value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}