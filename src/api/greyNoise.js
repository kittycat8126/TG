// greyNoise.js — Part 3: GreyNoise internet scanner feed
// Docs: https://docs.greynoise.io/
// Community (free) API key at https://www.greynoise.io/

const BASE_URL = "https://api.greynoise.io/v3";

// Fetch IPs currently scanning the internet (GNQL query)
export async function fetchActiveScanners(apiKey, limit = 30) {
  if (!apiKey) return getMockScanners();

  try {
    // GNQL: IPs seen in last 1 day classified as malicious
    const query = encodeURIComponent("last_seen:1d classification:malicious");
    const res   = await fetch(
      `${BASE_URL}/gnql?query=${query}&size=${limit}`,
      {
        headers: {
          "key":    apiKey,
          "Accept": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error(`GreyNoise error: ${res.status}`);
    const data = await res.json();
    return data.data ?? getMockScanners();
  } catch (err) {
    console.warn("[GreyNoise] Falling back to mock data:", err.message);
    return getMockScanners();
  }
}

// Check a single IP against GreyNoise
export async function checkIP(apiKey, ip) {
  if (!apiKey) return null;

  try {
    const res = await fetch(`${BASE_URL}/community/${ip}`, {
      headers: { "key": apiKey },
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[GreyNoise] checkIP failed:", err.message);
    return null;
  }
}

// ── MOCK DATA ────────────────────────────────────────────
function getMockScanners() {
  return [
    { ip: "45.146.164.110", classification: "malicious", country: "Russia",       tags: ["Mirai"],          last_seen: "2026-02-18" },
    { ip: "185.213.154.68", classification: "malicious", country: "Netherlands",  tags: ["Port Scanner"],   last_seen: "2026-02-18" },
    { ip: "162.142.125.11", classification: "malicious", country: "United States",tags: ["Shodan"],         last_seen: "2026-02-18" },
    { ip: "193.32.162.177", classification: "malicious", country: "Russia",       tags: ["Brute Forcer"],   last_seen: "2026-02-18" },
    { ip: "91.92.128.116",  classification: "malicious", country: "Netherlands",  tags: ["Cobalt Strike"],  last_seen: "2026-02-18" },
    { ip: "218.92.0.215",   classification: "malicious", country: "China",        tags: ["Mass Scanner"],   last_seen: "2026-02-18" },
  ];
}
