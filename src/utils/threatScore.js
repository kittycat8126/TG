// threatScore.js — Dynamic threat score calculation based on real factors

// Factor weights (must sum to 100)
const WEIGHTS = {
  attackType:   30,  // type severity
  sourceReputation: 25, // known bad country/ISP
  isRealIP:     20,  // confirmed malicious IP vs estimated
  targetValue:  15,  // high-value target (NYC, London etc)
  tags:         10,  // OTX pulse tags severity
};

// Base severity per attack type
const TYPE_SEVERITY = {
  "Ransomware":  100,
  "DDoS":         85,
  "SQL Inject":   75,
  "Brute Force":  60,
  "Port Scan":    35,
};

// Country threat reputation score (0-100)
const COUNTRY_REPUTATION = {
  "CN": 88, "RU": 92, "KP": 99, "IR": 90, "NG": 72,
  "BR": 58, "IN": 52, "UA": 65, "RO": 68, "VN": 62,
  "US": 40, "DE": 35, "NL": 45, "FR": 30, "GB": 28,
  "CA": 25, "AU": 22, "JP": 20, "SG": 38, "HK": 55,
  "XX": 50, // unknown
};

// High-value targets score (0-100)
const TARGET_VALUE = {
  "New York":    95, "London":      92, "Frankfurt":   88,
  "Washington":  99, "Tokyo":       85, "Singapore":   82,
  "Los Angeles": 78, "Sydney":      72, "Toronto":     70,
  "Amsterdam":   80, "São Paulo":   68, "Chicago":     75,
  "Paris":       85, "Berlin":      80, "Seoul":       78,
  "Mumbai":      70, "Moscow":      75, "Beijing":     72,
};

// Tag severity multipliers
const TAG_SEVERITY = {
  "apt":           1.0,
  "ransomware":    1.0,
  "c2":            0.95,
  "cobalt-strike": 0.95,
  "botnet":        0.85,
  "ddos":          0.80,
  "malware":       0.85,
  "emotet":        0.90,
  "mirai":         0.80,
  "brute-force":   0.65,
  "scanner":       0.45,
  "phishing":      0.70,
  "fraud":         0.60,
  "ssh":           0.55,
  "rdp":           0.60,
};

export function calculateThreatScore(event) {
  const { type, ip, srcName, dstName, tags = [], pulse_name } = event;

  // ── 1. Attack type severity (0-100) ─────────────────────
  const typeSeverity = TYPE_SEVERITY[type?.name] ?? 50;
  const typeScore    = typeSeverity * (WEIGHTS.attackType / 100);

  // ── 2. Source country reputation (0-100) ─────────────────
  const cc              = (srcName || "").split(",").pop().trim().toUpperCase();
  const countryScore_raw = COUNTRY_REPUTATION[cc] ?? COUNTRY_REPUTATION["XX"];
  const countryScore    = countryScore_raw * (WEIGHTS.sourceReputation / 100);

  // ── 3. IP verification bonus (0-100) ─────────────────────
  // Real confirmed malicious IP = max score
  const ipScore = (!!ip ? 100 : 30) * (WEIGHTS.isRealIP / 100);

  // ── 4. Target value (0-100) ──────────────────────────────
  const targetCity  = (dstName || "").split(",")[0].trim();
  const targetRaw   = TARGET_VALUE[targetCity] ?? 60;
  const targetScore = targetRaw * (WEIGHTS.targetValue / 100);

  // ── 5. Tag severity (0-100) ──────────────────────────────
  let tagMax = 0;
  for (const tag of tags) {
    const t = tag.toLowerCase();
    for (const [key, val] of Object.entries(TAG_SEVERITY)) {
      if (t.includes(key)) tagMax = Math.max(tagMax, val * 100);
    }
  }
  // Bonus for known APT pulse names
  if (pulse_name) {
    const p = pulse_name.toLowerCase();
    if (p.includes("apt") || p.includes("cobalt") || p.includes("lazarus")) tagMax = Math.max(tagMax, 95);
    if (p.includes("ransom") || p.includes("emotet"))                        tagMax = Math.max(tagMax, 90);
    if (p.includes("mirai") || p.includes("botnet"))                         tagMax = Math.max(tagMax, 80);
  }
  if (tagMax === 0) tagMax = 50; // neutral default
  const tagScore = tagMax * (WEIGHTS.tags / 100);

  // ── TOTAL ────────────────────────────────────────────────
  const raw   = typeScore + countryScore + ipScore + targetScore + tagScore;
  const final = Math.min(99, Math.max(1, Math.round(raw)));

  // ── BREAKDOWN for display ────────────────────────────────
  return {
    score: final,
    breakdown: {
      "Attack Severity":    Math.round(typeScore),
      "Source Reputation":  Math.round(countryScore),
      "IP Verification":    Math.round(ipScore),
      "Target Value":       Math.round(targetScore),
      "Threat Intel Tags":  Math.round(tagScore),
    },
  };
}

export function scoreToLabel(score) {
  if (score >= 90) return { label: "CRITICAL",  color: "#ff0033" };
  if (score >= 75) return { label: "HIGH",       color: "#ff2244" };
  if (score >= 55) return { label: "ELEVATED",   color: "#ff6600" };
  if (score >= 35) return { label: "GUARDED",    color: "#ffdd00" };
  return              { label: "LOW",        color: "#00ff88" };
}