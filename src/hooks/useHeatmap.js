// useHeatmap.js — manages Heatmap lifecycle tied to the Three.js scene
import { useRef, useState, useEffect, useCallback } from "react";
import { Heatmap } from "../globe/Heatmap";

export function useHeatmap(sceneRef) {
  const heatmapRef    = useRef(null);
  const [visible,     setVisible]     = useState(true);
  const [topCountries,setTopCountries] = useState([]);

  // Init heatmap once scene is ready
  const initHeatmap = useCallback((sceneData) => {
    if (heatmapRef.current) return;
    heatmapRef.current = new Heatmap(sceneData);
  }, []);

  // Called every frame
  const tickHeatmap = useCallback(() => {
    if (!heatmapRef.current) return;
    heatmapRef.current.tick();
    // Update top countries every ~60 frames
    if (Math.random() < 0.016) {
      setTopCountries(heatmapRef.current.getTopCountries(6));
    }
  }, []);

  // Register an attack from a log entry
  const registerAttack = useCallback((srcName) => {
    heatmapRef.current?.registerFromSrc(srcName);
  }, []);

  // Toggle visibility
  function toggleHeatmap() {
    const next = !visible;
    setVisible(next);
    heatmapRef.current?.setVisible(next);
  }

  return { initHeatmap, tickHeatmap, registerAttack, topCountries, visible, toggleHeatmap };
}