// cloudflareRadar.js — Vite proxy on localhost, Vercel edge fn on production
const IS_DEV = import.meta.env.DEV;

export async function fetchTopAttackOrigins(apiToken, limit = 20) {
  if (!apiToken) { console.warn("[Cloudflare] No token"); return getMockOrigins(); }
  try {
    let res;
    if (IS_DEV) {
      // Localhost: Vite proxy → Cloudflare directly
      res = await fetch(
        `/api/cloudflare/attacks/layer3/top/locations/origin?limit=${limit}&format=json&dateRange=1d`,
        { headers: { "Authorization": `Bearer ${apiToken}` } }
      );
    } else {
      // Vercel: hit our edge serverless function
      res = await fetch("/api/cloudflare");
    }

    if (!res.ok) throw new Error(`Cloudflare ${res.status}`);
    const data    = await res.json();
    const origins = data.result?.top_0 ?? [];
    console.log(`[Cloudflare] ✅ Real data: ${origins.length} origins`);
    return origins.length > 0 ? origins : getMockOrigins();
  } catch (err) {
    console.warn("[Cloudflare] Falling back to mock:", err.message);
    return getMockOrigins();
  }
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