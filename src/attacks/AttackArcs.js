// AttackArcs.js — Part 2: Full arc lifecycle: spawn → travel → impact → cleanup
import { pickTwoCities, pickAttackType } from "./attackData";
import { latLonToVec3, buildArcPoints, buildTrailGeometry } from "./arcHelpers";

const SEGMENTS  = 60;  // bezier resolution
const TRAIL_LEN = 18;  // number of trail points visible behind head

// Spawn one attack arc into the Three.js scene
export function spawnAttack({ scene, earth, THREE, RADIUS, onNewEntry }) {
  const [srcName, src, dstName, dst] = pickTwoCities();
  const type  = pickAttackType();
  const color = new THREE.Color(type.color);

  const p0 = latLonToVec3(src.lat, src.lon, RADIUS, THREE);
  const p2 = latLonToVec3(dst.lat, dst.lon, RADIUS, THREE);
  const lift = 0.35 + Math.random() * 0.45;

  const points = buildArcPoints(p0, p2, lift, SEGMENTS, THREE);

  // ── TRAIL LINE ──────────────────────────────────────
  const { geo: trailGeo, positions } = buildTrailGeometry(THREE, SEGMENTS + 1);
  const trailMat  = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 });
  const trailLine = new THREE.Line(trailGeo, trailMat);
  scene.add(trailLine);

  // ── HEAD SPHERE ────────────────────────────────────
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.013, 8, 8),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1.0 })
  );
  scene.add(head);

  // ── IMPACT PULSE RING ──────────────────────────────
  const pulseMat = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity: 0.0,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.001, 0.028, 32), pulseMat);
  pulse.position.copy(p2);
  pulse.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(pulse);

  // ── ORIGIN DOT ─────────────────────────────────────
  const originDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.009, 8, 8),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 })
  );
  originDot.position.copy(p0);
  scene.add(originDot);

  // Log callback
  onNewEntry?.({
    id:    Date.now() + Math.random(),
    time:  new Date().toISOString().substr(11, 8),
    src:   srcName,
    dst:   dstName,
    type:  type.name,
    color: type.color,
  });

  return {
    points, SEGMENTS, color, type,
    trailLine, trailGeo, positions,
    head, pulse, pulseMat, originDot,
    progress:   0,
    trailStart: 0,
    speed:      0.004 + Math.random() * 0.005,
    done:       false,
    impacting:  false,
    impactAge:  0,
    p2,
  };
}

// Update all active arcs each frame — called inside the render loop
export function updateAttacks({ attacks, scene, earth }) {
  const toRemove = [];

  attacks.forEach(atk => {
    if (atk.done) { toRemove.push(atk); return; }

    // Sync rotation with earth globe
    atk.trailLine.rotation.copy(earth.rotation);
    atk.head.rotation.copy(earth.rotation);
    atk.pulse.rotation.copy(earth.rotation);
    atk.originDot.rotation.copy(earth.rotation);

    if (!atk.impacting) {
      // ── TRAVEL PHASE ─────────────────────────
      atk.progress = Math.min(1, atk.progress + atk.speed);
      const headIdx  = Math.floor(atk.progress * atk.SEGMENTS);
      const drawFrom = Math.max(0, headIdx - TRAIL_LEN);

      // Write trail positions
      for (let i = drawFrom; i <= headIdx; i++) {
        const pt = atk.points[Math.min(i, atk.SEGMENTS)];
        atk.positions[i * 3]     = pt.x;
        atk.positions[i * 3 + 1] = pt.y;
        atk.positions[i * 3 + 2] = pt.z;
      }
      atk.trailGeo.attributes.position.needsUpdate = true;
      atk.trailGeo.setDrawRange(drawFrom, headIdx - drawFrom + 1);

      // Move glowing head
      const hp = atk.points[Math.min(headIdx, atk.SEGMENTS)];
      atk.head.position.copy(hp);
      atk.trailLine.material.opacity = 0.6 + 0.3 * atk.progress;

      if (atk.progress >= 1) {
        atk.impacting = true;
        atk.head.visible = false;
        scene.remove(atk.originDot);
      }
    } else {
      // ── IMPACT PHASE ─────────────────────────
      atk.impactAge += 0.042;
      const scale = 1 + atk.impactAge * 14;
      atk.pulse.scale.set(scale, scale, scale);
      atk.pulseMat.opacity          = Math.max(0, 0.85 - atk.impactAge * 0.95);
      atk.trailLine.material.opacity = Math.max(0, 0.55 - atk.impactAge * 0.65);

      if (atk.impactAge > 1.3) atk.done = true;
    }
  });

  // ── CLEANUP ──────────────────────────────────
  toRemove.forEach(atk => {
    scene.remove(atk.trailLine, atk.head, atk.pulse, atk.originDot);
    atk.trailGeo.dispose();
    atk.trailLine.material.dispose();
    atk.head.geometry.dispose();
    atk.head.material.dispose();
    atk.pulse.geometry.dispose();
    atk.pulseMat.dispose();
  });

  return attacks.filter(a => !a.done);
}
