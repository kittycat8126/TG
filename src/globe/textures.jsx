// textures.js — Loads real NASA textures via CDN for Google Earth look
// These URLs work in the browser (CORS-enabled via unpkg CDN)

export const TEXTURE_URLS = {
  day:    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
  night:  "https://unpkg.com/three-globe/example/img/earth-night.jpg",
  bump:   "https://unpkg.com/three-globe/example/img/earth-topology.png",
  clouds: "https://unpkg.com/three-globe/example/img/earth-clouds.png",
};

// Load all 4 textures, call onProgress(count) each time one loads
// Returns promise that resolves to { dayTex, nightTex, bumpTex, cloudTex }
export function loadTextures(THREE, onProgress) {
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = "anonymous";

  let loaded = 0;
  function load(url) {
    return new Promise((resolve) => {
      loader.load(
        url,
        (tex) => { loaded++; onProgress?.(loaded); resolve(tex); },
        undefined,
        () => { loaded++; onProgress?.(loaded); resolve(null); } // fail gracefully
      );
    });
  }

  return Promise.all([
    load(TEXTURE_URLS.day),
    load(TEXTURE_URLS.night),
    load(TEXTURE_URLS.bump),
    load(TEXTURE_URLS.clouds),
  ]).then(([dayTex, nightTex, bumpTex, cloudTex]) => ({
    dayTex, nightTex, bumpTex, cloudTex,
  }));
}
