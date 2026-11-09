import * as THREE from 'three';

/**
 * Procedural Equirectangular HDR studio texture
 * Emits zero-network high-contrast softbox reflections for diamond fire and metal sheen.
 */
export function makeStudioEnvTexture(w = 512, h = 256): THREE.DataTexture {
  const data = new Float32Array(w * h * 4);

  // Studio lighting panels [uCenter, vCenter, uHalf, vHalf, intensity, r, g, b]
  const boxes = [
    [0.00, 0.28, 0.10, 0.10, 9, 1, 1, 1],
    [0.25, 0.30, 0.07, 0.16, 6, 1, 0.97, 0.92],
    [0.50, 0.25, 0.12, 0.08, 8, 1, 1, 1],
    [0.75, 0.30, 0.07, 0.16, 6, 0.92, 0.96, 1],
    [0.125, 0.12, 0.08, 0.06, 5, 1, 1, 1],
    [0.625, 0.12, 0.08, 0.06, 5, 1, 1, 1],
    [0.375, 0.50, 0.14, 0.04, 3, 1, 0.95, 0.9],
    [0.875, 0.50, 0.14, 0.04, 3, 0.95, 0.9, 1],
    [0.50, 0.07, 0.50, 0.07, 3.5, 1, 1, 1], // overhead ceiling strip
  ];

  for (let y = 0; y < h; y++) {
    const v = (y + 0.5) / h;
    for (let x = 0; x < w; x++) {
      const u = (x + 0.5) / w;
      let r = 0.05 + 0.22 * (1 - v);
      let g = r;
      let b = r * 1.04;

      for (const [cu, cv, hu, hv, I, cr, cg, cb] of boxes) {
        let du = Math.abs(u - cu);
        du = Math.min(du, 1 - du);
        const dv = Math.abs(v - cv);
        const em = Math.max(0, Math.min(1, 1.6 - 1.6 * Math.max(du / hu, dv / hv)));
        r += I * em * cr;
        g += I * em * cg;
        b += I * em * cb;
      }

      const i = (y * w + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 1;
    }
  }

  const texture = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.FloatType);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;
  return texture;
}
