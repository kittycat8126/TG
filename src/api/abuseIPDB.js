// abuseIPDB.js — AbuseIPDB via Vite proxy (no CORS issues)
// Proxy: /api/abuse/* → https://api.abuseipdb.com/api/v2/*

const BASE = "/api/abuse";

export async function fetchBlacklist(apiKey, limit = 50, minConfidence = 90) {
  if (!apiKey) return getMockBlacklist();
  try {
    const res = await fetch(
      `${BASE}/blacklist?confidenceMinimum=${minConfidence}&limit=${limit}`,
      {
        headers: {
          "Key":    apiKey,
          "Accept": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error(`AbuseIPDB: ${res.status}`);
    const data = await res.json();
    console.log(`[AbuseIPDB] ✅ Got ${data.data?.length ?? 0} flagged IPs`);
    return data.data ?? getMockBlacklist();
  } catch (err) {
    console.warn("[AbuseIPDB] Error — using mock:", err.message);
    return getMockBlacklist();
  }
}

export async function checkIP(apiKey, ip) {
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `${BASE}/check?ipAddress=${ip}&maxAgeInDays=90&verbose`,
      {
        headers: {
          "Key":    apiKey,
          "Accept": "application/json",
        },
      }
    );
    return res.ok ? (await res.json()).data : null;
  } catch { return null; }
}

// ── MOCK DATA ─────────────────────────────────────────────────
function getMockBlacklist() {
  return [
    { ipAddress: "45.33.32.156",   abuseConfidenceScore: 98, countryCode: "US" },
    { ipAddress: "192.99.4.218",   abuseConfidenceScore: 96, countryCode: "CA" },
    { ipAddress: "194.165.16.11",  abuseConfidenceScore: 99, countryCode: "RU" },
    { ipAddress: "221.181.185.19", abuseConfidenceScore: 97, countryCode: "CN" },
    { ipAddress: "80.82.77.202",   abuseConfidenceScore: 95, countryCode: "NL" },
    { ipAddress: "89.248.165.125", abuseConfidenceScore: 99, countryCode: "DE" },
    { ipAddress: "5.188.206.16",   abuseConfidenceScore: 97, countryCode: "RU" },
    { ipAddress: "185.220.101.21", abuseConfidenceScore: 95, countryCode: "DE" },
  ];
}
