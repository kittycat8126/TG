// useClock.js — UTC clock that updates every second
import { useState, useEffect } from "react";

export function useClock() {
  const [clock, setClock] = useState("--:--:-- UTC");

  useEffect(() => {
    function tick() {
      const n = new Date();
      const p = v => String(v).padStart(2, "0");
      setClock(`${p(n.getUTCHours())}:${p(n.getUTCMinutes())}:${p(n.getUTCSeconds())} UTC`);
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return clock;
}
