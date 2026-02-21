// DetailPopup.jsx — Real ISP lookup via ip-api.com
import { useState, useEffect } from "react";
import { calculateThreatScore, scoreToLabel } from "../utils/threatScore";
import { lookupIP } from "../utils/ipLookup";

const orb  = "'Orbitron', monospace";
const mono = "'Share Tech Mono', monospace";

function Row({ label, value, color, monoFont }) {
  if (!value) return null;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      padding: "5px 0", borderBottom: "1px solid rgba(0,255,136,0.07)"
    }}>
      <span style={{ fontSize: 7, letterSpacing: 2, color: "#00ff88", opacity: 0.38, flexShrink: 0, marginRight: 12 }}>{label}</span>
      <span style={{ fontSize: 8, color: color || "#00ff88", opacity: 0.92, textAlign: "right", wordBreak: "break-all", fontFamily: monoFont ? mono : "inherit" }}>{value}</span>
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      display: "inline-block",
      background: color + "1a", border: `1px solid ${color}44`,
      color, fontSize: 6, letterSpacing: 2, padding: "2px 7px", borderRadius: 1,
    }}>{label}</span>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 2 }}>
      <div style={{ fontSize: 6, letterSpacing: 3, color: "#00ff88", opacity: 0.22, padding: "8px 0 3px" }}>{title}</div>
      {children}
    </div>
  );
}

function generateMaskedIP(seed) {
  const h = (s) => { let h = 5381; for (let c of s) h = (h * 33) ^ c.charCodeAt(0); return Math.abs(h); };
  const n = h(seed || "unknown");
  return `${(n % 200) + 20}.${(n >> 4) % 256}.${(n >> 8) % 256}.${(n >> 12) % 200 + 10}`;
}

// Fallback static geo by country code
const GEO_FALLBACK = {
  CN: { country: "China",         region: "Asia Pacific",   isp: "China Telecom"       },
  RU: { country: "Russia",        region: "Eastern Europe", isp: "Rostelecom"          },
  KP: { country: "North Korea",   region: "Asia Pacific",   isp: "Star Joint Venture"  },
  US: { country: "United States", region: "North America",  isp: "AS7922 Comcast"      },
  DE: { country: "Germany",       region: "W. Europe",      isp: "Deutsche Telekom"    },
  NL: { country: "Netherlands",   region: "W. Europe",      isp: "LeaseWeb"            },
  KR: { country: "South Korea",   region: "Asia Pacific",   isp: "Korea Telecom"       },
  BR: { country: "Brazil",        region: "South America",  isp: "Oi S.A."             },
  IN: { country: "India",         region: "South Asia",     isp: "BSNL"                },
  HK: { country: "Hong Kong",     region: "Asia Pacific",   isp: "HGC Global Comms"    },
  NG: { country: "Nigeria",       region: "West Africa",    isp: "MTN Nigeria"         },
  IR: { country: "Iran",          region: "Middle East",    isp: "TIC Net"             },
};

export default function DetailPopup({ event, onClose }) {
  if (!event) return null;

  const { dstName, type, ip, time, pulse_name, tags = [] } = event;
  const srcName     = event.srcName || "Unknown";
  const accentColor = type?.color || "#00ff88";
  const displayIP   = ip || generateMaskedIP(srcName + time);
  const isRealIP    = !!ip;

  // Real IP lookup state
  const [ipData,      setIpData]      = useState(null);
  const [ipLoading,   setIpLoading]   = useState(isRealIP);

  // Fetch real ISP/geo when popup opens with a real IP
  useEffect(() => {
    if (!isRealIP) return;
    setIpLoading(true);
    lookupIP(displayIP).then(data => {
      setIpData(data);
      setIpLoading(false);
    });
  }, [displayIP]);

  // Build geo — real data first, fallback to static map
  const cc         = srcName.split(",").pop().trim().toUpperCase();
  const fallback   = GEO_FALLBACK[cc] || { country: srcName, region: "Unknown Region", isp: "Unknown ISP" };
  const geo = {
    country: ipData?.country  || fallback.country,
    region:  ipData?.region   || fallback.region,
    city:    ipData?.city     || "",
    isp:     ipData?.isp      || (ipLoading ? "Resolving..." : fallback.isp),
    asn:     ipData?.asn      || "",
  };

  const { score, breakdown } = calculateThreatScore(event);
  const { label: scoreLabel, color: scoreColor } = scoreToLabel(score);

  const protocolInfo = {
    "DDoS":        { proto: "UDP / TCP",    port: "Any / 80 / 443", method: "Volumetric Flood",       layer: "L3 / L4" },
    "SQL Inject":  { proto: "HTTP / HTTPS", port: "80 / 443",       method: "Injection via GET/POST",  layer: "L7"      },
    "Ransomware":  { proto: "SMB / RDP",    port: "445 / 3389",     method: "Lateral Movement",        layer: "L7"      },
    "Port Scan":   { proto: "TCP SYN",      port: "1–65535",        method: "SYN Stealth Scan",        layer: "L4"      },
    "Brute Force": { proto: "SSH / RDP",    port: "22 / 3389",      method: "Credential Stuffing",     layer: "L7"      },
  };
  const pinfo = protocolInfo[type?.name] || { proto: "TCP/IP", port: "Various", method: "Unknown", layer: "L3–L7" };

  const mitreMap = {
    "DDoS":        "T1498 — Network DoS",
    "Brute Force": "T1110 — Brute Force",
    "SQL Inject":  "T1190 — Exploit Public App",
    "Port Scan":   "T1046 — Network Service Scan",
    "Ransomware":  "T1486 — Data Encrypted for Impact",
  };

  return (
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 200, width: 340,
      backgroundColor: "#040410",
      border: `1px solid ${accentColor}44`,
      borderTop: `2px solid ${accentColor}`,
      color: "#00ff88", fontFamily: mono,
      boxShadow: `0 0 60px ${accentColor}18, 0 24px 80px rgba(0,0,0,0.97)`,
      overflow: "hidden",
    }}>

      {/* ── HEADER ── */}
      <div style={{
        padding: "10px 14px",
        backgroundColor: accentColor + "0a",
        borderBottom: `1px solid ${accentColor}22`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontFamily: orb, fontSize: 10, letterSpacing: 4, color: accentColor }}>THREAT DETAIL</div>
          <div style={{ fontSize: 7, color: "#00ff88", opacity: 0.3, marginTop: 2, letterSpacing: 2 }}>{time ? `${time} UTC` : "LIVE"}</div>
        </div>
        <button onClick={onClose} style={{
          background: "transparent", border: "1px solid rgba(255,34,68,0.4)",
          color: "#ff2244", cursor: "pointer", fontSize: 14,
          width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
      </div>

      {/* ── THREAT SCORE ── */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(0,255,136,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <span style={{ fontSize: 7, letterSpacing: 2, opacity: 0.38 }}>THREAT SCORE</span>
            <div style={{ fontFamily: orb, fontSize: 9, color: scoreColor, letterSpacing: 3, marginTop: 2 }}>{scoreLabel}</div>
          </div>
          <span style={{ fontFamily: orb, fontSize: 22, color: scoreColor, textShadow: `0 0 14px ${scoreColor}` }}>
            {score}<span style={{ fontSize: 10, opacity: 0.4 }}>/99</span>
          </span>
        </div>
        <div style={{ height: 5, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
          <div style={{
            height: "100%", width: score + "%",
            background: `linear-gradient(90deg, #00ff88 0%, #ffdd00 40%, #ff6600 70%, ${scoreColor} 100%)`,
            boxShadow: `0 0 10px ${scoreColor}`, borderRadius: 3,
          }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px" }}>
          {Object.entries(breakdown).map(([factor, pts]) => (
            <div key={factor}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 6, opacity: 0.3, marginBottom: 1 }}>
                <span>{factor}</span><span style={{ color: scoreColor }}>{pts}pt</span>
              </div>
              <div style={{ height: 2, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
                <div style={{ height: "100%", width: (pts / 30 * 100) + "%", background: scoreColor, borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BADGES ── */}
      <div style={{ padding: "8px 14px", display: "flex", gap: 5, flexWrap: "wrap", borderBottom: "1px solid rgba(0,255,136,0.07)" }}>
        {type?.name && <Badge label={type.name.toUpperCase()} color={accentColor} />}
        {tags.slice(0, 3).map(tag => <Badge key={tag} label={tag.toUpperCase()} color="#00aaff" />)}
        <Badge label="ACTIVE" color="#ff2244" />
        {isRealIP  && <Badge label="VERIFIED IP"  color="#00ff88" />}
        {!isRealIP && <Badge label="IP ESTIMATED" color="#888888" />}
      </div>

      <div style={{ padding: "2px 14px 10px" }}>

        {/* ── NETWORK INFO ── */}
        <Section title="━━ NETWORK INTELLIGENCE">
          <Row label="SOURCE IP"  value={displayIP}                                                        color={isRealIP ? "#ff2244" : "#888"} monoFont />
          <Row label="IP STATUS"  value={isRealIP ? "Confirmed Malicious IOC" : "Estimated — Not Verified"} color={isRealIP ? "#ff2244" : "#888"} />
          <Row label="ISP / ORG"  value={geo.isp}                                                          color={ipLoading ? "#ffdd00" : "#00aaff"} />
          <Row label="ASN"        value={geo.asn || "—"}                                                    color="#00aaff" />
          <Row label="ORIGIN"     value={srcName}          color="#ff6600" />
          <Row label="COUNTRY"    value={geo.country}      color="#ff8800" />
          <Row label="REGION"     value={geo.city ? `${geo.city}, ${geo.region}` : geo.region} />
          <Row label="TARGET"     value={dstName}          color="#00ff88" />
        </Section>

        {/* ── PROTOCOL INFO ── */}
        <Section title="━━ PROTOCOL ANALYSIS">
          <Row label="PROTOCOL"    value={pinfo.proto}  color="#00aaff" />
          <Row label="TARGET PORT" value={pinfo.port}   color="#00aaff" />
          <Row label="TECHNIQUE"   value={pinfo.method}                 />
          <Row label="OSI LAYER"   value={pinfo.layer}                  />
        </Section>

        {/* ── THREAT INTEL ── */}
        <Section title="━━ THREAT INTELLIGENCE">
          <Row label="FEED SOURCE"  value={pulse_name || "Cloudflare Radar"}                                                       />
          <Row label="CONFIDENCE"   value={isRealIP ? "HIGH — Verified IOC" : "MEDIUM — Radar Origin"} color={isRealIP ? "#00ff88" : "#ffdd00"} />
          <Row label="MITRE ATT&CK" value={mitreMap[type?.name] || "T1071 — App Layer Protocol"}       color="#ff88ff"            />
          <Row label="STATUS"       value="⬤  ACTIVE THREAT"                                            color="#ff2244"            />
        </Section>

      </div>

      {/* ── ACTION BUTTONS ── */}
      <div style={{
        padding: "10px 14px", borderTop: "1px solid rgba(0,255,136,0.08)",
        display: "flex", gap: 6, backgroundColor: "#040410",
      }}>
        {isRealIP && <>
          <a href={`https://www.abuseipdb.com/check/${displayIP}`} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, padding: "7px 0", textAlign: "center",
            backgroundColor: "rgba(255,34,68,0.1)", border: "1px solid rgba(255,34,68,0.3)",
            color: "#ff2244", fontSize: 7, letterSpacing: 1, textDecoration: "none", fontFamily: mono,
          }}>ABUSEIPDB ↗</a>
          <a href={`https://otx.alienvault.com/indicator/ip/${displayIP}`} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, padding: "7px 0", textAlign: "center",
            backgroundColor: "rgba(0,170,255,0.1)", border: "1px solid rgba(0,170,255,0.3)",
            color: "#00aaff", fontSize: 7, letterSpacing: 1, textDecoration: "none", fontFamily: mono,
          }}>OTX ↗</a>
        </>}
        <button onClick={onClose} style={{
          flex: 1, padding: "7px 0", backgroundColor: "transparent",
          border: `1px solid ${accentColor}33`, color: accentColor,
          fontSize: 7, letterSpacing: 2, cursor: "pointer", fontFamily: mono,
        }}>DISMISS</button>
      </div>

      {/* Corner brackets */}
      {[
        { top: -1,    left:  -1, borderTop:    `2px solid ${accentColor}`, borderLeft:  `2px solid ${accentColor}` },
        { top: -1,    right: -1, borderTop:    `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` },
        { bottom: -1, left:  -1, borderBottom: `2px solid ${accentColor}`, borderLeft:  `2px solid ${accentColor}` },
        { bottom: -1, right: -1, borderBottom: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` },
      ].map((s, i) => <div key={i} style={{ position: "absolute", width: 10, height: 10, ...s }} />)}
    </div>
  );
}