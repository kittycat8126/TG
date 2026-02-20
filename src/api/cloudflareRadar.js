// cloudflareRadar.js — Cloudflare Radar via Vite proxy
// NOTE: Requires token with "Cloudflare Radar — Read" permission
// dash.cloudflare.com → My Profile → API Tokens → Edit → Add: Radar Read

const BASE = "/api/cloudflare";

export async function fetchTopAttackOrigins(apiToken, limit = 20) {
  if (!apiToken) return getMockOrigins();
  try {
    // Try the correct Radar v1 endpoint for Layer 3 attack origins
    const res = await fetch(
      `${BASE}/attacks/layer3/top/locations/origin?limit=${limit}&format=json&dateRange=1d`,
      {
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type":  "application/json",
        },
      }
    );

    if (res.status === 400) {
      console.warn("[Cloudflare] 400 — token may be missing 'Radar Read' permission");
      console.warn("[Cloudflare] Fix: dash.cloudflare.com → API Tokens → Edit → Add Radar:Read");
      return getMockOrigins();
    }
    if (res.status === 403) {
      console.warn("[Cloudflare] 403 — token doesn't have access to Radar API");
      return getMockOrigins();
    }
    if (!res.ok) throw new Error(`Cloudflare: ${res.status}`);

    const data    = await res.json();
    const origins = data.result?.top_0 ?? [];
    console.log(`[Cloudflare] ✅ Real data: ${origins.length} attack origins`);
    return origins.length > 0 ? origins : getMockOrigins();

  } catch (err) {
    console.warn("[Cloudflare] Error — using mock:", err.message);
    return getMockOrigins();
  }
}

// Mock fallback — realistic country distribution
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