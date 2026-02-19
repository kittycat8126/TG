// abuseIPDB.js — Part 3: AbuseIPDB community threat feed
// Docs: https://www.abuseipdb.com/api.html
// Free tier: 1000 checks/day — get key at https://www.abuseipdb.com/account/api

const BASE_URL = "https://api.abuseipdb.com/api/v2";

// Fetch recently reported malicious IPs (blacklist endpoint)
// Returns array of { ipAddress, abuseConfidenceScore, countryCode, usageType, domain }
export async function fetchBlacklist(apiKey, limit = 50, minConfidence = 90) {
  if (!apiKey) return getMockBlacklist();

  try {
    const res = await fetch(
      `${BASE_URL}/blacklist?confidenceMinimum=${minConfidence}&limit=${limit}`,
      {
        headers: {
          "Key":    apiKey,
          "Accept": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error(`AbuseIPDB error: ${res.status}`);
    const data = await res.json();
    return data.data ?? getMockBlacklist();
  } catch (err) {
    console.warn("[AbuseIPDB] Falling back to mock data:", err.message);
    return getMockBlacklist();
  }
}

// Check a single IP address
export async function checkIP(apiKey, ip) {
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/check?ipAddress=${ip}&maxAgeInDays=90&verbose`,
      {
        headers: {
          "Key":    apiKey,
          "Accept": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn("[AbuseIPDB] checkIP failed:", err.message);
    return null;
  }
}

// ── MOCK DATA ────────────────────────────────────────────
function getMockBlacklist() {
  return [
    { ipAddress: "45.33.32.156",   abuseConfidenceScore: 98, countryCode: "US", usageType: "Data Center/Web Hosting/Transit" },
    { ipAddress: "192.99.4.218",   abuseConfidenceScore: 96, countryCode: "CA", usageType: "Data Center/Web Hosting/Transit" },
    { ipAddress: "194.165.16.11",  abuseConfidenceScore: 99, countryCode: "RU", usageType: "Data Center/Web Hosting/Transit" },
    { ipAddress: "221.181.185.19", abuseConfidenceScore: 97, countryCode: "CN", usageType: "Data Center/Web Hosting/Transit" },
    { ipAddress: "80.82.77.202",   abuseConfidenceScore: 95, countryCode: "NL", usageType: "Data Center/Web Hosting/Transit" },
    { ipAddress: "89.248.165.125", abuseConfidenceScore: 99, countryCode: "DE", usageType: "Data Center/Web Hosting/Transit" },
    { ipAddress: "5.188.206.16",   abuseConfidenceScore: 97, countryCode: "RU", usageType: "Data Center/Web Hosting/Transit" },
    { ipAddress: "185.220.101.21", abuseConfidenceScore: 95, countryCode: "DE", usageType: "Tor Exit Node"                  },
  ];
}
