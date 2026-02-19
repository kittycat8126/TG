// arcHelpers.js — Geometry math for attack arcs

export function latLonToVec3(lat, lon, r, THREE) {
  const phi   = (90 - lat)  * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

// Build a quadratic bezier arc between two points on the globe
// Returns array of SEGMENTS+1 THREE.Vector3 points
export function buildArcPoints(p0, p2, lift, SEGMENTS, THREE) {
  const mid = p0.clone().add(p2).multiplyScalar(0.5);
  const p1  = mid.clone().normalize().multiplyScalar(p0.length() + lift);

  const points = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const t  = i / SEGMENTS;
    const mt = 1 - t;
    points.push(new THREE.Vector3(
      mt*mt*p0.x + 2*mt*t*p1.x + t*t*p2.x,
      mt*mt*p0.y + 2*mt*t*p1.y + t*t*p2.y,
      mt*mt*p0.z + 2*mt*t*p1.z + t*t*p2.z,
    ));
  }
  return points;
}

// Build a trail BufferGeometry with a pre-allocated position array
export function buildTrailGeometry(THREE, maxPts) {
  const geo       = new THREE.BufferGeometry();
  const positions = new Float32Array(maxPts * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setDrawRange(0, 0);
  return { geo, positions };
}
