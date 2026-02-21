// useAttacks.js — Part 10: With localStorage persistence for total count
import { useRef, useState, useEffect, useCallback } from "react";
import { spawnAttack, updateAttacks }               from "../attacks/AttackArcs";
import { createDataRouter }                          from "../api/dataRouter";
import { pickTwoCities, pickAttackType, ATTACK_TYPES } from "../attacks/attackData";

const BASE_INTERVAL = 1.2;
const MAX_LOG       = 8;
const STORAGE_KEY   = "sentinel_grid_total";

export function defaultFilters() {
  return Object.fromEntries(ATTACK_TYPES.map(t => [t.name, true]));
}

export function useAttacks(sceneRef, apiConfig = {}) {
  const attacksRef   = useRef([]);
  const lastSpawnRef = useRef(0);
  const tRef         = useRef(0);
  const routerRef    = useRef(null);

  // #1 — Load persisted total from localStorage
  const [log,     setLog]     = useState([]);
  const [total,   setTotal]   = useState(() => {
    try { return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10); }
    catch { return 0; }
  });
  const [history, setHistory] = useState([]); // full session history for #2
  const [filters, setFilters] = useState(defaultFilters());
  const [paused,  setPaused]  = useState(false);
  const [speed,   setSpeed]   = useState(1);

  const filtersRef = useRef(filters);
  const pausedRef  = useRef(paused);
  const speedRef   = useRef(speed);
  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => { pausedRef.current  = paused;  }, [paused]);
  useEffect(() => { speedRef.current   = speed;   }, [speed]);

  // #1 — Persist total to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(total)); }
    catch {}
  }, [total]);

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
    setLog(prev    => [entry, ...prev].slice(0, MAX_LOG));
    setHistory(prev => [entry, ...prev].slice(0, 500)); // #2 — keep up to 500
    setTotal(n     => n + 1);
  }

  async function getNextEvent() {
    if (routerRef.current) {
      const event = await routerRef.current.getNextEvent();
      if (event) return event;
    }
    const [srcName, src, dstName, dst] = pickTwoCities();
    return { srcName, src, dstName, dst, type: pickAttackType() };
  }

  const tickAttacks = useCallback((dt) => {
    const s = sceneRef.current;
    if (!s) return;
    if (pausedRef.current) return;

    tRef.current += dt * speedRef.current;
    const interval = BASE_INTERVAL / speedRef.current;

    if (tRef.current - lastSpawnRef.current > interval) {
      lastSpawnRef.current = tRef.current;

      getNextEvent().then(event => {
        if (!event || !sceneRef.current) return;
        const typeName = event.type?.name;
        if (typeName && !filtersRef.current[typeName]) return;

        const atk = spawnAttack({
          ...sceneRef.current,
          srcName: event.srcName, src: event.src,
          dstName: event.dstName, dst: event.dst,
          type: event.type, onNewEntry,
        });
        atk.speed *= speedRef.current;
        attacksRef.current.push(atk);

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

    attacksRef.current = updateAttacks({ attacks: attacksRef.current, scene: s.scene, earth: s.earth });
  }, []);

  function toggleFilter(typeName) {
    setFilters(prev => ({ ...prev, [typeName]: !prev[typeName] }));
  }

  function resetTotal() {
    setTotal(0);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  return {
    tickAttacks, log, total, history,
    filters, toggleFilter,
    paused, setPaused,
    speed,  setSpeed,
    resetTotal,
  };
}