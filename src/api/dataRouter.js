// dataRouter.js — Fixed: no runaway refetch, proper rate limiting
import { fetchMaliciousIPs }     from "./alienVault";
import { fetchBlacklist }        from "./abuseIPDB";
import { fetchTopAttackOrigins } from "./cloudflareRadar";
import { countryCodeToLatLon }   from "./geolocate";
import { ATTACK_TYPES }          from "../attacks/attackData";

function tagsToType(tags = []) {
  const t = tags.join(" ").toLowerCase();
  if (t.includes("ddos")   || t.includes("mirai")  || t.includes("amplification")) return ATTACK_TYPES[0];
  if (t.includes("sql")    || t.includes("inject"))                                 return ATTACK_TYPES[1];
  if (t.includes("ransom") || t.includes("emotet")  || t.includes("malware"))       return ATTACK_TYPES[2];
  if (t.includes("scan")   || t.includes("recon"))                                  return ATTACK_TYPES[3];
  if (t.includes("brute")  || t.includes("ssh")     || t.includes("rdp"))           return ATTACK_TYPES[4];
  return ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
}

const TARGETS = [
  { name: "New York",    lat: 40.7,  lon: -74.0  },
  { name: "London",      lat: 51.5,  lon: -0.1   },
  { name: "Frankfurt",   lat: 50.1,  lon: 8.7    },
  { name: "Singapore",   lat: 1.3,   lon: 103.8  },
  { name: "Tokyo",       lat: 35.7,  lon: 139.7  },
  { name: "Los Angeles", lat: 34.0,  lon: -118.2 },
  { name: "Amsterdam",   lat: 52.4,  lon: 4.9    },
  { name: "Sydney",      lat: -33.9, lon: 151.2  },
  { name: "Toronto",     lat: 43.7,  lon: -79.4  },
  { name: "São Paulo",   lat: -23.5, lon: -46.6  },
];
const randomTarget = () => TARGETS[Math.floor(Math.random() * TARGETS.length)];

export function createDataRouter({ cloudflareToken, abuseKey, alienVaultKey } = {}) {
  const queue      = [];
  let isFetching   = false;   // ← prevents concurrent/runaway fetches
  let fetchCount   = 0;
  let lastFetchAt  = 0;

  // Rate limits per source (milliseconds)
  const INTERVALS = {
    router:    5 * 60 * 1000,   // refetch every 5 minutes minimum
    abuseipdb: 60 * 60 * 1000,  // AbuseIPDB: max once per hour (free tier)
  };
  let lastAbuseAt = 0;

  async function refill() {
    // Guard: don't start if already fetching OR fetched too recently
    if (isFetching) return;
    if (Date.now() - lastFetchAt < INTERVALS.router) return;

    isFetching  = true;
    lastFetchAt = Date.now();
    fetchCount++;
    console.log(`[dataRouter] 🔄 Fetching live data... (cycle ${fetchCount})`);

    const events = [];

    try {
      // ── AlienVault OTX — every cycle ──────────────────
      if (alienVaultKey) {
        const ips = await fetchMaliciousIPs(alienVaultKey, 30);
        console.log(`[dataRouter] ✅ AlienVault: ${ips.length} IPs`);
        for (const entry of ips) {
          const coords = (entry.latitude && entry.longitude)
            ? { lat: entry.latitude, lon: entry.longitude }
            : countryCodeToLatLon(entry.country_code);
          if (!coords) continue;
          const t = randomTarget();
          events.push({
            srcName: entry.city && entry.city !== "Unknown"
              ? `${entry.city}, ${entry.country_code}`
              : entry.country_code,
            src:  coords,
            dstName: t.name,
            dst:  { lat: t.lat, lon: t.lon },
            type: tagsToType(entry.tags),
            ip:   entry.ip,
          });
        }
      }

      // ── AbuseIPDB — max once per hour ─────────────────
      const canFetchAbuse = abuseKey && (Date.now() - lastAbuseAt > INTERVALS.abuseipdb);
      if (canFetchAbuse) {
        lastAbuseAt = Date.now();
        const abuse = await fetchBlacklist(abuseKey, 15, 90);
        console.log(`[dataRouter] ✅ AbuseIPDB: ${abuse.length} IPs`);
        for (const entry of abuse) {
          const coords = countryCodeToLatLon(entry.countryCode);
          if (!coords) continue;
          const t = randomTarget();
          events.push({
            srcName: entry.countryCode,
            src:     coords,
            dstName: t.name,
            dst:     { lat: t.lat, lon: t.lon },
            type:    ATTACK_TYPES[0],
            ip:      entry.ipAddress,
          });
        }
      } else if (abuseKey) {
        const wait = Math.round((INTERVALS.abuseipdb - (Date.now() - lastAbuseAt)) / 60000);
        console.log(`[dataRouter] ⏳ AbuseIPDB: next fetch in ~${wait} min`);
      }

      // ── Cloudflare Radar — every cycle ────────────────
      if (cloudflareToken) {
        const origins = await fetchTopAttackOrigins(cloudflareToken, 10);
        console.log(`[dataRouter] ✅ Cloudflare: ${origins.length} origins`);
        for (const o of origins) {
          const coords = countryCodeToLatLon(o.clientCountryAlpha2);
          if (!coords) continue;
          const t = randomTarget();
          events.push({
            srcName: o.clientCountryAlpha2,
            src:     coords,
            dstName: t.name,
            dst:     { lat: t.lat, lon: t.lon },
            type:    ATTACK_TYPES[0],
          });
        }
      }

    } catch (err) {
      console.warn("[dataRouter] ⚠️ Error during fetch:", err.message);
    }

    // Shuffle
    for (let i = events.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [events[i], events[j]] = [events[j], events[i]];
    }

    queue.push(...events);
    console.log(`[dataRouter] 🎯 ${events.length} new events — queue total: ${queue.length}`);
    isFetching = false;
  }

  // Called by useAttacks every frame — only triggers refill when needed
  async function getNextEvent() {
    // Refill if queue is running low AND enough time has passed
    if (!isFetching && queue.length < 10 && Date.now() - lastFetchAt > INTERVALS.router) {
      refill(); // non-blocking
    }
    return queue.length > 0 ? queue.shift() : null;
  }

  // Initial load
  refill();
  return { getNextEvent };
}