// useAttacks.js — Part 7: Supports filters, pause, speed control
import { useRef, useState, useEffect, useCallback } from "react";
import { spawnAttack, updateAttacks }               from "../attacks/AttackArcs";
import { createDataRouter }                          from "../api/dataRouter";
import { pickTwoCities, pickAttackType, ATTACK_TYPES } from "../attacks/attackData";

const BASE_INTERVAL = 1.2;
const MAX_LOG       = 8;

// Build default filters — all enabled
export function defaultFilters() {
  return Object.fromEntries(ATTACK_TYPES.map(t => [t.name, true]));
}

export function useAttacks(sceneRef, apiConfig = {}) {
  const attacksRef   = useRef([]);
  const lastSpawnRef = useRef(0);
  const tRef         = useRef(0);
  const routerRef    = useRef(null);

  const [log,     setLog]     = useState([]);
  const [total,   setTotal]   = useState(0);
  const [filters, setFilters] = useState(defaultFilters());
  const [paused,  setPaused]  = useState(false);
  const [speed,   setSpeed]   = useState(1);

  // Expose refs so tickAttacks closure always reads latest value
  const filtersRef = useRef(filters);
  const pausedRef  = useRef(paused);
  const speedRef   = useRef(speed);
  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => { pausedRef.current  = paused;  }, [paused]);
  useEffect(() => { speedRef.current   = speed;   }, [speed]);

  // Init data router
  useEffect(() => {
    const hasKeys = apiConfig.cloudflareToken || apiConfig.abuseKey || apiConfig.alienVaultKey;
    if (hasKeys) {
      console.log("[useAttacks] 🔑 API keys detected — starting live data router");
      routerRef.current = createDataRouter(apiConfig);
    } else {
      console.log("[useAttacks] ⚠️ No API keys — using mock data");
    }
  }, []);

  function onNewEntry(entry) {
    setLog(prev  => [entry, ...prev].slice(0, MAX_LOG));
    setTotal(n   => n + 1);
  }

  async function getNextEvent() {
    // Try live router first
    if (routerRef.current) {
      const event = await routerRef.current.getNextEvent();
      if (event) return event;
    }
    // Mock fallback
    const [srcName, src, dstName, dst] = pickTwoCities();
    return { srcName, src, dstName, dst, type: pickAttackType() };
  }

  const tickAttacks = useCallback((dt) => {
    const s = sceneRef.current;
    if (!s) return;

    // Pause — skip spawning and updating
    if (pausedRef.current) return;

    // Apply speed multiplier to time
    tRef.current += dt * speedRef.current;

    const interval = BASE_INTERVAL / speedRef.current;

    if (tRef.current - lastSpawnRef.current > interval) {
      lastSpawnRef.current = tRef.current;

      getNextEvent().then(event => {
        if (!event || !sceneRef.current) return;

        // ── FILTER CHECK ────────────────────────────────
        const typeName = event.type?.name;
        if (typeName && !filtersRef.current[typeName]) return; // filtered out

        const atk = spawnAttack({
          ...sceneRef.current,
          srcName: event.srcName,
          src:     event.src,
          dstName: event.dstName,
          dst:     event.dst,
          type:    event.type,
          onNewEntry,
        });
        // Apply speed to arc travel
        atk.speed *= speedRef.current;
        attacksRef.current.push(atk);

        // Occasional burst
        if (Math.random() < 0.2) {
          getNextEvent().then(e2 => {
            if (!e2 || !sceneRef.current) return;
            if (e2.type?.name && !filtersRef.current[e2.type.name]) return;
            const atk2 = spawnAttack({
              ...sceneRef.current,
              srcName: e2.srcName, src: e2.src,
              dstName: e2.dstName, dst: e2.dst,
              type: e2.type, onNewEntry,
            });
            atk2.speed *= speedRef.current;
            attacksRef.current.push(atk2);
          });
        }
      });
    }

    attacksRef.current = updateAttacks({
      attacks: attacksRef.current,
      scene:   s.scene,
      earth:   s.earth,
    });
  }, []);

  // Filter toggle handler
  function toggleFilter(typeName) {
    setFilters(prev => ({ ...prev, [typeName]: !prev[typeName] }));
  }

  // Select all / none
  function setAllFilters(val) {
    setFilters(Object.fromEntries(ATTACK_TYPES.map(t => [t.name, val])));
  }

  return {
    tickAttacks, log, total,
    filters, toggleFilter, setAllFilters,
    paused,  setPaused,
    speed,   setSpeed,
  };
}