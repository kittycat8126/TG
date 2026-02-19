export const degToRad = (deg) => (deg * Math.PI) / 180;
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
export const lerp = (a, b, t) => a + (b - a) * t;
export const randomBetween = (min, max) => Math.random() * (max - min) + min;
export const randomInt = (min, max) => Math.floor(randomBetween(min, max + 1));

// Quadratic bezier point at t
export function bezierPoint(p0, p1, p2, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    z: mt * mt * p0.z + 2 * mt * t * p1.z + t * t * p2.z,
  };
}
