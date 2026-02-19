// geolocate.js — Part 3: Map IPs and country codes to lat/lon coordinates
import { COUNTRY_COORDS } from "../utils/geo";

// Free IP geolocation API — no key required, 45 req/min limit
const GEO_API = "https://ip-api.com/json";

// Geolocate a single IP address
// Returns { lat, lon, country, city, isp } or null
export async function geolocateIP(ip) {
  try {
    const res  = await fetch(`${GEO_API}/${ip}?fields=status,country,countryCode,city,lat,lon,isp`);
    const data = await res.json();
    if (data.status !== "success") return null;
    return {
      lat:     data.lat,
      lon:     data.lon,
      country: data.country,
      city:    data.city,
      isp:     data.isp,
    };
  } catch {
    return null;
  }
}

// Batch geolocate up to 100 IPs using ip-api batch endpoint
export async function geolocateBatch(ips) {
  const batch = ips.slice(0, 100).map(ip => ({ query: ip, fields: "status,country,countryCode,city,lat,lon,isp" }));
  try {
    const res  = await fetch("http://ip-api.com/batch", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(batch),
    });
    const data = await res.json();
    return data
      .filter(d => d.status === "success")
      .map(d => ({ lat: d.lat, lon: d.lon, country: d.country, city: d.city, isp: d.isp }));
  } catch {
    return [];
  }
}

// Fast fallback: map country code → approximate center coords
export function countryCodeToLatLon(code) {
  return COUNTRY_COORDS[code] ?? null;
}
