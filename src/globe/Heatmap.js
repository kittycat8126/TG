// Heatmap.js — Part 5: Country attack intensity glow on the globe surface
import { latLonToVec3 } from "../attacks/arcHelpers";

// Country centers with their 2-letter code
const COUNTRY_CENTERS = {
  CN: { lat: 35.0,  lon: 105.0,  name: "China"         },
  RU: { lat: 60.0,  lon: 100.0,  name: "Russia"        },
  US: { lat: 38.0,  lon: -97.0,  name: "United States" },
  DE: { lat: 51.0,  lon: 10.0,   name: "Germany"       },
  NL: { lat: 52.3,  lon: 5.3,    name: "Netherlands"   },
  KR: { lat: 37.0,  lon: 127.5,  name: "South Korea"   },
  BR: { lat: -10.0, lon: -55.0,  name: "Brazil"        },
  IN: { lat: 20.0,  lon: 77.0,   name: "India"         },
  KP: { lat: 40.0,  lon: 127.0,  name: "North Korea"   },
  IR: { lat: 32.0,  lon: 53.0,   name: "Iran"          },
  UA: { lat: 49.0,  lon: 32.0,   name: "Ukraine"       },
  FR: { lat: 46.0,  lon: 2.0,    name: "France"        },
  GB: { lat: 54.0,  lon: -2.0,   name: "UK"            },
  HK: { lat: 22.3,  lon: 114.2,  name: "Hong Kong"     },
  NG: { lat: 8.0,   lon: 8.0,    name: "Nigeria"       },
  JP: { lat: 36.0,  lon: 138.0,  name: "Japan"         },
  SG: { lat: 1.3,   lon: 103.8,  name: "Singapore"     },
  CA: { lat: 60.0,  lon: -95.0,  name: "Canada"        },
  AU: { lat: -25.0, lon: 133.0,  name: "Australia"     },
  RO: { lat: 45.9,  lon: 24.9,   name: "Romania"       },
};

export class Heatmap {
  constructor({ scene, earth, THREE, RADIUS }) {
    this.scene   = scene;
    this.earth   = earth;
    this.THREE   = THREE;
    this.RADIUS  = RADIUS;
    this.spots   = {};      // code → { mesh, intensity, target }
    this.visible = true;

    this._init();
  }

  _init() {
    const { THREE, RADIUS, earth } = this;

    Object.entries(COUNTRY_CENTERS).forEach(([code, data]) => {
      // Outer glow ring
      const glowGeo = new THREE.SphereGeometry(0.055, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xff2244,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);

      // Inner hot spot
      const coreGeo = new THREE.SphereGeometry(0.018, 12, 12);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);

      // Position on globe surface
      const pos = latLonToVec3(data.lat, data.lon, RADIUS + 0.001, THREE);
      glow.position.copy(pos);
      core.position.copy(pos);

      earth.add(glow);
      earth.add(core);

      this.spots[code] = {
        glow, glowMat, core, coreMat,
        intensity: 0,
        target:    0,
        pos,
      };
    });
  }

  // Call this when a new attack originates from a country
  registerAttack(countryCode, intensity = 1) {
    const code = countryCode?.toUpperCase();
    if (!this.spots[code]) return;
    // Bump target intensity (capped at 1.0)
    this.spots[code].target = Math.min(1.0, this.spots[code].target + intensity * 0.15);
  }

  // Register from a log entry srcName like "Beijing, CN"
  registerFromSrc(srcName) {
    if (!srcName) return;
    const cc = srcName.split(",").pop().trim().toUpperCase();
    this.registerAttack(cc);
  }

  // Call every frame to animate intensities
  tick() {
    if (!this.visible) return;

    Object.values(this.spots).forEach(spot => {
      // Ease toward target
      spot.intensity += (spot.target - spot.intensity) * 0.04;
      // Slowly cool down
      spot.target    *= 0.992;

      const i = spot.intensity;
      if (i < 0.005) {
        spot.glowMat.opacity = 0;
        spot.coreMat.opacity = 0;
        return;
      }

      // Color gradient: green → yellow → orange → red based on intensity
      const r = Math.min(1, i * 2);
      const g = Math.max(0, 1 - i * 1.5);
      spot.glowMat.color.setRGB(r, g * 0.3, 0);
      spot.coreMat.color.setRGB(1, g * 0.6, 0);

      // Scale glow with intensity + pulse
      const pulse = 1 + Math.sin(Date.now() * 0.003 + spot.pos.x) * 0.15 * i;
      spot.glow.scale.setScalar(pulse * (0.5 + i * 1.8));
      spot.core.scale.setScalar(0.8 + i * 0.5);

      spot.glowMat.opacity = i * 0.55;
      spot.coreMat.opacity = i * 0.9;
    });
  }

  setVisible(v) {
    this.visible = v;
    Object.values(this.spots).forEach(s => {
      s.glow.visible = v;
      s.core.visible = v;
    });
  }

  // Get top N hottest countries for display
  getTopCountries(n = 5) {
    return Object.entries(this.spots)
      .map(([code, s]) => ({ code, name: COUNTRY_CENTERS[code]?.name || code, intensity: s.intensity }))
      .filter(c => c.intensity > 0.02)
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, n);
  }

  dispose() {
    Object.values(this.spots).forEach(s => {
      this.earth.remove(s.glow);
      this.earth.remove(s.core);
      s.glow.geometry.dispose(); s.glowMat.dispose();
      s.core.geometry.dispose(); s.coreMat.dispose();
    });
  }
}