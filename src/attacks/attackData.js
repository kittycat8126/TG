// attackData.js — Cities, attack types, random pickers

export const CITIES = {
  "New York":    { lat: 40.7,  lon: -74.0  },
  "London":      { lat: 51.5,  lon: -0.1   },
  "Moscow":      { lat: 55.75, lon: 37.6   },
  "Beijing":     { lat: 39.9,  lon: 116.4  },
  "Shanghai":    { lat: 31.2,  lon: 121.5  },
  "Tokyo":       { lat: 35.7,  lon: 139.7  },
  "Seoul":       { lat: 37.6,  lon: 126.9  },
  "Mumbai":      { lat: 19.1,  lon: 72.9   },
  "São Paulo":   { lat: -23.5, lon: -46.6  },
  "Lagos":       { lat: 6.5,   lon: 3.4    },
  "Cairo":       { lat: 30.0,  lon: 31.2   },
  "Tehran":      { lat: 35.7,  lon: 51.4   },
  "Pyongyang":   { lat: 39.0,  lon: 125.7  },
  "Frankfurt":   { lat: 50.1,  lon: 8.7    },
  "Paris":       { lat: 48.9,  lon: 2.3    },
  "Singapore":   { lat: 1.3,   lon: 103.8  },
  "Los Angeles": { lat: 34.0,  lon: -118.2 },
  "Chicago":     { lat: 41.9,  lon: -87.6  },
  "Toronto":     { lat: 43.7,  lon: -79.4  },
  "Sydney":      { lat: -33.9, lon: 151.2  },
  "Berlin":      { lat: 52.5,  lon: 13.4   },
  "Amsterdam":   { lat: 52.4,  lon: 4.9    },
  "Jakarta":     { lat: -6.2,  lon: 106.8  },
  "Bogotá":      { lat: 4.7,   lon: -74.1  },
  "Bucharest":   { lat: 44.4,  lon: 26.1   },
  "Kyiv":        { lat: 50.4,  lon: 30.5   },
  "Warsaw":      { lat: 52.2,  lon: 21.0   },
  "Stockholm":   { lat: 59.3,  lon: 18.1   },
  "Riyadh":      { lat: 24.7,  lon: 46.7   },
  "Bangkok":     { lat: 13.8,  lon: 100.5  },
};

export const ATTACK_TYPES = [
  { name: "DDoS",        color: "#ff2244", glow: "#ff000088", weight: 35 },
  { name: "SQL Inject",  color: "#ff6600", glow: "#ff440044", weight: 20 },
  { name: "Ransomware",  color: "#ff00ff", glow: "#ff00ff44", weight: 15 },
  { name: "Port Scan",   color: "#00aaff", glow: "#0088ff44", weight: 20 },
  { name: "Brute Force", color: "#ffdd00", glow: "#ffaa0044", weight: 10 },
];

export function pickAttackType() {
  const total = ATTACK_TYPES.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of ATTACK_TYPES) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return ATTACK_TYPES[0];
}

export function pickTwoCities() {
  const keys = Object.keys(CITIES);
  let a = keys[Math.floor(Math.random() * keys.length)];
  let b = keys[Math.floor(Math.random() * keys.length)];
  while (b === a) b = keys[Math.floor(Math.random() * keys.length)];
  return [a, CITIES[a], b, CITIES[b]];
}
