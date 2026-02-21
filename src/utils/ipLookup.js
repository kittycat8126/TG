// ipLookup.js — Real IP geolocation + ISP via ip-api.com (free, no key needed)
// Rate limit: 45 requests/minute — we cache results to stay well under

const cache = new Map();

export async function lookupIP(ip) {
  if (!ip) return null;
  if (cache.has(ip)) return cache.get(ip);

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,org,as,lat,lon`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) throw new Error(`ip-api: ${res.status}`);
    const data = await res.json();
    if (data.status !== "success") throw new Error("ip-api returned fail");

    const result = {
      country:    data.country     || "Unknown",
      region:     data.regionName  || "Unknown",
      city:       data.city        || "Unknown",
      isp:        data.isp         || data.org || "Unknown ISP",
      org:        data.org         || "",
      asn:        data.as          || "",
      lat:        data.lat,
      lon:        data.lon,
    };

    cache.set(ip, result);
    return result;
  } catch (err) {
    console.warn(`[ipLookup] Failed for ${ip}:`, err.message);
    cache.set(ip, null); // cache failure to avoid retrying
    return null;
  }
}