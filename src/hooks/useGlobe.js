// useGlobe.js — stores the Three.js scene refs shared across components
import { useRef, useCallback } from "react";

export function useGlobe() {
  const sceneRef = useRef(null); // { scene, earth, camera, renderer, THREE, RADIUS }

  const onSceneReady = useCallback((sceneData) => {
    sceneRef.current = sceneData;
  }, []);

  return { sceneRef, onSceneReady };
}
