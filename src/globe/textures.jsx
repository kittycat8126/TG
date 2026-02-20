// textures.js — Multiple CDN fallbacks to guarantee textures load
export function loadTextures(THREE, onProgress) {
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = "anonymous";
  let loaded = 0;

  // Try multiple CDN sources in order until one works
  const SOURCES = {
    day: [
      "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
      "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg",
    ],
    night: [
      "https://unpkg.com/three-globe/example/img/earth-night.jpg",
      "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg",
    ],
    bump: [
      "https://unpkg.com/three-globe/example/img/earth-topology.png",
      "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png",
    ],
    clouds: [
      "https://unpkg.com/three-globe/example/img/earth-water.png",
      "https://cdn.jsdelivr.net/npm/three-globe@2/example/img/earth-clouds.png",
    ],
  };

  function tryLoad(urls, index = 0) {
    return new Promise((resolve) => {
      if (index >= urls.length) {
        console.warn("[Textures] All sources failed for:", urls[0]);
        loaded++; onProgress?.(loaded);
        resolve(null);
        return;
      }
      loader.load(
        urls[index],
        (tex) => {
          console.log(`[Textures] ✅ Loaded: ${urls[index]}`);
          loaded++; onProgress?.(loaded);
          resolve(tex);
        },
        undefined,
        () => {
          console.warn(`[Textures] ❌ Failed: ${urls[index]}, trying next...`);
          tryLoad(urls, index + 1).then(resolve);
        }
      );
    });
  }

  return Promise.all([
    tryLoad(SOURCES.day),
    tryLoad(SOURCES.night),
    tryLoad(SOURCES.bump),
    tryLoad(SOURCES.clouds),
  ]).then(([dayTex, nightTex, bumpTex, cloudTex]) => ({
    dayTex, nightTex, bumpTex, cloudTex,
  }));
}