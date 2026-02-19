// cloudflareRadar.js — Part 3: Cloudflare Radar API
// Docs: https://developers.cloudflare.com/radar/
// Free tier available — get your token at https://dash.cloudflare.com/profile/api-tokens

const BASE_URL = "https://api.cloudflare.com/client/v4/radar";

// Fetch recent DDoS attack summary by country
// Returns array of { country, attacks, bandwidth }
export async function fetchDDoSSummary(apiToken, limit = 10) {
  if (!apiToken) return getMockDDoSData();

  try {
    const res = await fetch(
      `${BASE_URL}/attacks/layer3/summary/proto?limit=${limit}&format=json`,
      {
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type":  "application/json",
        },
      }
    );
    if (!res.ok) throw new Error(`Cloudflare API error: ${res.status}`);
    const data = await res.json();
    return data.result ?? getMockDDoSData();
  } catch (err) {
    console.warn("[CloudflareRadar] Falling back to mock data:", err.message);
    return getMockDDoSData();
  }
}

// Fetch top attacking countries (Layer 3/4)
export async function fetchTopAttackOrigins(apiToken, limit = 20) {
  if (!apiToken) return getMockOrigins();

  try {
    const res = await fetch(
      `${BASE_URL}/attacks/layer3/top/locations/origin?limit=${limit}&format=json`,
      {
        headers: { "Authorization": `Bearer ${apiToken}` },
      }
    );
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data.result?.top_0 ?? getMockOrigins();
  } catch (err) {
    console.warn("[CloudflareRadar] Origins fallback:", err.message);
    return getMockOrigins();
  }
}

// ── MOCK DATA (used when no API token or network unavailable) ──
function getMockDDoSData() {
  return [
    { proto: "TCP",  share: "48.5%" },
    { proto: "UDP",  share: "35.2%" },
    { proto: "ICMP", share: "12.1%" },
    { proto: "GRE",  share: "4.2%"  },
  ];
}

function getMockOrigins() {
  return [
    { clientCountryAlpha2: "CN", value: "28.4" },
    { clientCountryAlpha2: "US", value: "18.2" },
    { clientCountryAlpha2: "RU", value: "14.7" },
    { clientCountryAlpha2: "DE", value: "8.3"  },
    { clientCountryAlpha2: "KR", value: "6.1"  },
    { clientCountryAlpha2: "IN", value: "5.8"  },
    { clientCountryAlpha2: "BR", value: "4.2"  },
    { clientCountryAlpha2: "NL", value: "3.9"  },
  ];
}
