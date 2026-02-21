// BotnetClusters.js — Part 9: Groups attacks from same origin into clusters
import { latLonToVec3 } from "./arcHelpers";

const CLUSTER_RADIUS_DEG = 15;  // degrees — sources within this radius merge
const CLUSTER_TIMEOUT_MS = 8000; // cluster dissolves after 8s of no new attacks
const MIN_CLUSTER_SIZE   = 3;    // minimum attacks to show cluster ring

export class BotnetClusters {
  constructor({ scene, earth, THREE, RADIUS }) {
    this.scene   = scene;
    this.earth   = earth;
    this.THREE   = THREE;
    this.RADIUS  = RADIUS;
    this.clusters = new Map(); // key → cluster object
    this.visible  = true;
  }

  // Register a new attack — check if it belongs to existing cluster
  registerAttack({ srcName, src, type }) {
    if (!src?.lat || !src?.lon) return;

    const key = this._findClusterKey(src);

    if (key && this.clusters.has(key)) {
      // Add to existing cluster
      const c = this.clusters.get(key);
      c.count++;
      c.lastSeen  = Date.now();
      c.types.add(type?.name || "Unknown");
      c.srcNames.add(srcName);
      this._updateClusterVisual(c);
    } else {
      // Create new cluster
      this._createCluster(src, srcName, type);
    }
  }

  _findClusterKey(src) {
    for (const [key, c] of this.clusters.entries()) {
      const dLat = Math.abs(c.lat - src.lat);
      const dLon = Math.abs(c.lon - src.lon);
      if (dLat < CLUSTER_RADIUS_DEG && dLon < CLUSTER_RADIUS_DEG) return key;
    }
    return null;
  }

  _createCluster(src, srcName, type) {
    const { THREE, RADIUS, scene } = this;
    const key = `${src.lat.toFixed(1)}_${src.lon.toFixed(1)}`;

    const pos = latLonToVec3(src.lat, src.lon, RADIUS + 0.005, THREE);

    // Outer pulsing ring
    const ringGeo = new THREE.RingGeometry(0.04, 0.055, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff6600, transparent: true, opacity: 0,
      side: THREE.DoubleSide, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(ring);

    // Second ring (offset pulse)
    const ring2Geo = new THREE.RingGeometry(0.06, 0.072, 32);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xff2244, transparent: true, opacity: 0,
      side: THREE.DoubleSide, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.position.copy(pos);
    ring2.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(ring2);

    // Core dot
    const coreGeo = new THREE.SphereGeometry(0.012, 10, 10);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xff4400, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.copy(pos);
    scene.add(core);

    this.clusters.set(key, {
      key, lat: src.lat, lon: src.lon,
      pos, ring, ringMat, ring2, ring2Mat, core, coreMat,
      count: 1, lastSeen: Date.now(),
      types: new Set([type?.name || "Unknown"]),
      srcNames: new Set([srcName]),
      age: 0,
    });
  }

  _updateClusterVisual(c) {
    const intensity = Math.min(1, c.count / 10);
    const color     = c.count > 8 ? 0xff0022 : c.count > 5 ? 0xff4400 : 0xff8800;

    c.ringMat.color.setHex(color);
    c.ring2Mat.color.setHex(color);
    c.coreMat.color.setHex(color);

    c.ringMat.opacity  = 0.3 + intensity * 0.5;
    c.ring2Mat.opacity = 0.2 + intensity * 0.4;
    c.coreMat.opacity  = 0.6 + intensity * 0.4;

    const scale = 1 + intensity * 1.5;
    c.ring.scale.setScalar(scale);
    c.ring2.scale.setScalar(scale * 0.9);
  }

  tick() {
    if (!this.visible) return;

    const now     = Date.now();
    const toDelete = [];

    for (const [key, c] of this.clusters.entries()) {
      c.age += 0.05;

      // Sync with earth rotation
      c.ring.rotation.copy(this.earth.rotation);
      c.ring2.rotation.copy(this.earth.rotation);
      c.core.rotation.copy(this.earth.rotation);

      // Dissolve old clusters
      const age = now - c.lastSeen;
      if (age > CLUSTER_TIMEOUT_MS) {
        c.ringMat.opacity  *= 0.94;
        c.ring2Mat.opacity *= 0.94;
        c.coreMat.opacity  *= 0.94;
        if (c.ringMat.opacity < 0.01) { toDelete.push(key); continue; }
      }

      // Skip tiny clusters
      if (c.count < MIN_CLUSTER_SIZE) {
        c.ringMat.opacity  = Math.max(0, c.ringMat.opacity * 0.98);
        c.ring2Mat.opacity = Math.max(0, c.ring2Mat.opacity * 0.98);
        continue;
      }

      // Pulse animation
      const pulse1 = 1 + Math.sin(c.age * 2.5) * 0.12;
      const pulse2 = 1 + Math.sin(c.age * 2.5 + Math.PI) * 0.12;
      c.ring.scale.setScalar((1 + Math.min(1, c.count / 10) * 1.5) * pulse1);
      c.ring2.scale.setScalar((1 + Math.min(1, c.count / 10) * 1.2) * pulse2);
    }

    // Cleanup dead clusters
    toDelete.forEach(key => {
      const c = this.clusters.get(key);
      this.scene.remove(c.ring, c.ring2, c.core);
      c.ringGeo?.dispose(); c.ringMat.dispose();
      c.ring2Geo?.dispose(); c.ring2Mat.dispose();
      c.coreGeo?.dispose(); c.coreMat.dispose();
      this.clusters.delete(key);
    });
  }

  // Get active clusters for UI display
  getActiveClusters() {
    return Array.from(this.clusters.values())
      .filter(c => c.count >= MIN_CLUSTER_SIZE)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(c => ({
        key:      c.key,
        count:    c.count,
        srcNames: Array.from(c.srcNames).join(", "),
        types:    Array.from(c.types).join(" / "),
        age:      Math.round((Date.now() - c.lastSeen) / 1000),
      }));
  }

  setVisible(v) {
    this.visible = v;
    for (const c of this.clusters.values()) {
      c.ring.visible  = v;
      c.ring2.visible = v;
      c.core.visible  = v;
    }
  }

  dispose() {
    for (const c of this.clusters.values()) {
      this.scene.remove(c.ring, c.ring2, c.core);
    }
    this.clusters.clear();
  }
}