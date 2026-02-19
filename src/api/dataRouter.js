// dataRouter.js — Part 3: Merges all API sources → unified AttackEvent format
// Drop-in replacement for the random mock data in useAttacks.js
import { fetchBlacklist }        from "./abuseIPDB";
import { fetchActiveScanners }   from "./greyNoise";
import { fetchTopAttackOrigins } from "./cloudflareRadar";
import { countryCodeToLatLon }   from "./geolocate";
import { ATTACK_TYPES }          from "../attacks/attackData";

// Unified attack event shape used by AttackArcs.js
// { srcName, src: {lat,lon}, dstName, dst: {lat,lon}, type: {name,color,...} }

// Map GreyNoise tags → our ATTACK_TYPES
function tagToType(tags = []) {
  const tag = (tags[0] || "").toLowerCase();
  if (tag.includes("mirai") || tag.includes("ddos"))   return ATTACK_TYPES[0]; // DDoS
  if (tag.includes("brute"))                            return ATTACK_TYPES[4]; // Brute Force
  if (tag.includes("scanner") || tag.includes("scan")) return ATTACK_TYPES[3]; // Port Scan
  if (tag.includes("cobalt") || tag.includes("rat"))   return ATTACK_TYPES[2]; // Ransomware
  return ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
}

// Permanent target list — usually "us" as target (defenders)
const DEFAULT_TARGETS = [
  { name: "New York",    lat: 40.7,  lon: -74.0  },
  { name: "London",      lat: 51.5,  lon: -0.1   },
  { name: "Frankfurt",   lat: 50.1,  lon: 8.7    },
  { name: "Singapore",   lat: 1.3,   lon: 103.8  },
  { name: "Tokyo",       lat: 35.7,  lon: 139.7  },
  { name: "Los Angeles", lat: 34.0,  lon: -118.2 },
];

function randomTarget() {
  return DEFAULT_TARGETS[Math.floor(Math.random() * DEFAULT_TARGETS.length)];
}

// ── MAIN ROUTER ───────────────────────────────────────────
// Call once to initialise — returns a getNextEvent() function
// that pops events from the queue, refilling from APIs periodically
export function createDataRouter({ cloudflareToken, abuseKey, greyNoiseKey } = {}) {
  const queue      = [];
  let   lastFetch  = 0;
  const REFILL_MS  = 30_000; // refetch every 30 seconds

  async function refill() {
    lastFetch = Date.now();
    const events = [];

    try {
      // ── Source 1: GreyNoise scanners ────────────────
      const scanners = await fetchActiveScanners(greyNoiseKey, 20);
      for (const sc of scanners) {
        const coords = countryCodeToLatLon(sc.country_code) ??
                       { lat: sc.latitude ?? 0, lon: sc.longitude ?? 0 };
        const target = randomTarget();
        events.push({
          srcName: sc.country || "Unknown",
          src:     coords,
          dstName: target.name,
          dst:     { lat: target.lat, lon: target.lon },
          type:    tagToType(sc.tags),
          ip:      sc.ip,
        });
      }

      // ── Source 2: AbuseIPDB blacklist ────────────────
      const abuse = await fetchBlacklist(abuseKey, 20, 85);
      for (const entry of abuse) {
        const coords = countryCodeToLatLon(entry.countryCode);
        if (!coords) continue;
        const target = randomTarget();
        events.push({
          srcName: entry.countryCode,
          src:     coords,
          dstName: target.name,
          dst:     { lat: target.lat, lon: target.lon },
          type:    ATTACK_TYPES[0], // AbuseIPDB = DDoS/spam
          ip:      entry.ipAddress,
        });
      }

      // ── Source 3: Cloudflare attack origins ──────────
      const cfOrigins = await fetchTopAttackOrigins(cloudflareToken, 10);
      for (const origin of cfOrigins) {
        const coords = countryCodeToLatLon(origin.clientCountryAlpha2);
        if (!coords) continue;
        const target = randomTarget();
        events.push({
          srcName: origin.clientCountryAlpha2,
          src:     coords,
          dstName: target.name,
          dst:     { lat: target.lat, lon: target.lon },
          type:    ATTACK_TYPES[0],
        });
      }
    } catch (err) {
      console.warn("[dataRouter] refill error:", err);
    }

    // Shuffle & push to queue
    for (let i = events.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [events[i], events[j]] = [events[j], events[i]];
    }
    queue.push(...events);
  }

  // Return next event — auto-refills when queue runs low
  async function getNextEvent() {
    if (queue.length < 5 && Date.now() - lastFetch > REFILL_MS) {
      refill(); // non-blocking background refill
    }
    return queue.length > 0 ? queue.shift() : null;
  }

  // Kick off initial fetch immediately
  refill();

  return { getNextEvent };
}
