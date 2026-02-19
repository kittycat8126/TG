// useAttacks.js — manages the live attack arc system
import { useRef, useState, useEffect } from "react";
import { spawnAttack, updateAttacks } from "../attacks/AttackArcs";

const SPAWN_MIN = 0.8;  // seconds between spawns
const SPAWN_MAX = 1.8;
const MAX_LOG   = 8;

export function useAttacks(sceneRef) {
  const attacksRef   = useRef([]);
  const lastSpawnRef = useRef(0);
  const tRef         = useRef(0);

  const [log,    setLog]    = useState([]);
  const [total,  setTotal]  = useState(0);

  function onNewEntry(entry) {
    setLog(prev => [entry, ...prev].slice(0, MAX_LOG));
    setTotal(n => n + 1);
  }

  // Called every frame from the render loop (via ref so no re-renders)
  function tickAttacks(dt) {
    const s = sceneRef.current;
    if (!s) return;

    tRef.current += dt;

    // Maybe spawn
    const interval = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
    if (tRef.current - lastSpawnRef.current > interval) {
      attacksRef.current.push(spawnAttack({ ...s, onNewEntry }));
      // Occasional burst
      if (Math.random() < 0.25) {
        attacksRef.current.push(spawnAttack({ ...s, onNewEntry }));
      }
      lastSpawnRef.current = tRef.current;
    }

    // Update + cleanup
    attacksRef.current = updateAttacks({
      attacks: attacksRef.current,
      scene:   s.scene,
      earth:   s.earth,
    });
  }

  return { tickAttacks, log, total };
}
