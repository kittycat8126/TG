// Convert lat/lon degrees to a Three.js Vector3 on a sphere of radius r
export function latLonToVec3(lat, lon, r, THREE) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

// Country code → approximate center lat/lon
export const COUNTRY_COORDS = {
  US: { lat: 38.0,  lon: -97.0  },
  CN: { lat: 35.0,  lon: 105.0  },
  RU: { lat: 60.0,  lon: 100.0  },
  DE: { lat: 51.0,  lon: 10.0   },
  GB: { lat: 54.0,  lon: -2.0   },
  FR: { lat: 46.0,  lon: 2.0    },
  JP: { lat: 36.0,  lon: 138.0  },
  KR: { lat: 37.0,  lon: 127.5  },
  IN: { lat: 20.0,  lon: 77.0   },
  BR: { lat: -10.0, lon: -55.0  },
  CA: { lat: 60.0,  lon: -95.0  },
  AU: { lat: -25.0, lon: 133.0  },
  NG: { lat: 8.0,   lon: 8.0    },
  IR: { lat: 32.0,  lon: 53.0   },
  KP: { lat: 40.0,  lon: 127.0  },
  NL: { lat: 52.3,  lon: 5.3    },
  SG: { lat: 1.3,   lon: 103.8  },
  UA: { lat: 49.0,  lon: 32.0   },
  PL: { lat: 52.0,  lon: 20.0   },
  TR: { lat: 39.0,  lon: 35.0   },
};
