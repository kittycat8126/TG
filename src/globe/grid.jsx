// grid.js — Creates lat/lon grid lines on the globe surface

export function createLatLonGrid(THREE, radius) {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.055,
  });

  const r = radius + 0.003;

  // Latitude lines
  for (let lat = -80; lat <= 80; lat += 20) {
    const pts = [];
    const phi = THREE.MathUtils.degToRad(90 - lat);
    for (let lon = 0; lon <= 361; lon += 2) {
      const theta = THREE.MathUtils.degToRad(lon);
      pts.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      ));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  // Longitude lines
  for (let lon = 0; lon < 360; lon += 20) {
    const pts = [];
    const theta = THREE.MathUtils.degToRad(lon);
    for (let lat = -90; lat <= 90; lat += 2) {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      pts.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      ));
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  return group;
}
