// alienVault.js — AlienVault OTX via Vite proxy
const BASE = "/api/otx";

export async function fetchMaliciousIPs(apiKey, limit = 40) {
  if (!apiKey) return getMockIPs();
  try {
    // Use the public reputation feed — works on all accounts including new ones
    const res = await fetch(
      `${BASE}/pulses/activity?limit=10`,
      { headers: { "X-OTX-API-KEY": apiKey } }
    );
    if (!res.ok) throw new Error(`OTX activity: ${res.status}`);
    const data = await res.json();
    const pulses = data.results ?? [];

    const ipList = [];
    for (const pulse of pulses.slice(0, 5)) {
      if (!pulse.indicators) continue;
      for (const ind of pulse.indicators) {
        if (ind.type === "IPv4" && ind.indicator) {
          ipList.push({
            ip:           ind.indicator,
            country_code: ind.country_code || "XX",
            city:         ind.city         || "Unknown",
            latitude:     parseFloat(ind.latitude)  || null,
            longitude:    parseFloat(ind.longitude) || null,
            pulse_name:   pulse.name || "Threat Feed",
            tags:         pulse.tags || [],
          });
        }
        if (ipList.length >= limit) break;
      }
      if (ipList.length >= limit) break;
    }

    // Also try the direct indicators endpoint for more IPs
    if (ipList.length < 5) {
      const res2 = await fetch(
        `${BASE}/search/pulses?q=malware&limit=5`,
        { headers: { "X-OTX-API-KEY": apiKey } }
      );
      if (res2.ok) {
        const data2 = await res2.json();
        for (const pulse of (data2.results ?? []).slice(0, 3)) {
          for (const ind of (pulse.indicators ?? [])) {
            if (ind.type === "IPv4" && ind.indicator) {
              ipList.push({
                ip:           ind.indicator,
                country_code: ind.country_code || "XX",
                city:         ind.city         || "Unknown",
                latitude:     parseFloat(ind.latitude)  || null,
                longitude:    parseFloat(ind.longitude) || null,
                pulse_name:   pulse.name || "Malware Feed",
                tags:         pulse.tags || [],
              });
            }
          }
        }
      }
    }

    console.log(`[AlienVault] ✅ Got ${ipList.length} malicious IPs`);
    return ipList.length > 0 ? ipList : getMockIPs();

  } catch (err) {
    console.warn("[AlienVault] Error — using mock:", err.message);
    return getMockIPs();
  }
}

export async function checkIP(apiKey, ip) {
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `${BASE}/indicators/IPv4/${ip}/general`,
      { headers: { "X-OTX-API-KEY": apiKey } }
    );
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

function getMockIPs() {
  return [
    { ip: "45.146.164.110", country_code: "RU", city: "Moscow",        latitude: 55.75, longitude: 37.6,  pulse_name: "Mirai Botnet",      tags: ["botnet","ddos"]        },
    { ip: "185.213.154.68", country_code: "NL", city: "Amsterdam",     latitude: 52.37, longitude: 4.9,   pulse_name: "Port Scanner",      tags: ["scanner"]              },
    { ip: "221.181.185.19", country_code: "CN", city: "Beijing",       latitude: 39.9,  longitude: 116.4, pulse_name: "APT Activity",      tags: ["apt","china"]          },
    { ip: "193.32.162.177", country_code: "RU", city: "St Petersburg", latitude: 59.9,  longitude: 30.3,  pulse_name: "Brute Force",       tags: ["brute-force","ssh"]    },
    { ip: "91.92.128.116",  country_code: "NL", city: "Rotterdam",     latitude: 51.9,  longitude: 4.5,   pulse_name: "Cobalt Strike",     tags: ["c2","rat"]             },
    { ip: "218.92.0.215",   country_code: "CN", city: "Shanghai",      latitude: 31.2,  longitude: 121.5, pulse_name: "Mass Scanner",      tags: ["scanner","china"]      },
    { ip: "89.248.165.125", country_code: "DE", city: "Frankfurt",     latitude: 50.1,  longitude: 8.7,   pulse_name: "Emotet Dropper",    tags: ["malware","emotet"]     },
    { ip: "5.188.206.16",   country_code: "RU", city: "Kazan",         latitude: 55.8,  longitude: 49.1,  pulse_name: "Ransomware C2",     tags: ["ransomware","c2"]      },
    { ip: "103.75.190.11",  country_code: "HK", city: "Hong Kong",     latitude: 22.3,  longitude: 114.2, pulse_name: "DDoS Amplification",tags: ["ddos","amplification"] },
    { ip: "196.240.57.20",  country_code: "NG", city: "Lagos",         latitude: 6.5,   longitude: 3.4,   pulse_name: "Phishing Campaign", tags: ["phishing","fraud"]     },
  ];
}
