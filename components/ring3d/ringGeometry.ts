import * as THREE from 'three';
import { RingStyle, SideSetting, DiamondShape, Halo, getGemDimensionsMm } from './types';

/**
 * Jewelcraft-calibrated Fine Jewelry CAD Ring Shank & Setting Generator
 *
 * Implements:
 * 1. HeadLayout calculation for seamless, gap-free CAD fitting
 * 2. Integrated Saddle Bridge & Collet Basket (Zero-gap connection to band)
 * 3. Jewelcraft Tapered Claws with Domed Spherical Caps (_dome) & Girdle Overlap
 * 4. Under-Bezel Gallery Rail & Open Collet Basket Struts
 * 5. Comfort-Fit D-Profile Band Extrusions (Classic, Cathedral, Twist, Split, Two-Row, Pinch)
 * 6. Halo Settings (Hidden Halo & Single Halo)
 * 7. Shoulder Settings (Plain, Pavé, Prong, Channel)
 */

type Vec3 = [number, number, number];

export interface HeadLayout {
  dims: { lengthMm: number; widthMm: number; depthMm: number };
  l: number; // scene units (Z-axis, along the finger)
  w: number; // scene units (X-axis, across the finger)
  d: number; // scene units (Y-axis, vertical depth)
  innerRadius: number;
  crestY: number; // top outer crest of the ring band
  girdleY: number; // exact Y where diamond girdle sits
  galleryY: number; // under-bezel rail
  colletY: number; // collet base wire (sits on the band bridge)
  clawTopY: number; // tip of prongs
  clawBaseY: number; // base of prongs (anchored inside band)
}

export function getHeadLayout(
  shape: DiamondShape,
  carat: number,
  diameterMm: number
): HeadLayout {
  const dims = getGemDimensionsMm(shape, carat);
  const l = dims.lengthMm * 0.1;
  const w = dims.widthMm * 0.1;
  const d = dims.depthMm * 0.1;

  const innerRadius = (diameterMm / 2) * 0.1;
  const bandThickness = 0.085;
  const crestY = innerRadius + bandThickness;

  // Culet rests comfortably inside the basket bridge
  const pavilionDepth = d * 0.65;
  const girdleY = crestY + 0.02 + pavilionDepth;

  // Gallery rail sits 22% of diamond depth beneath girdle
  const galleryY = girdleY - d * 0.22;

  // Collet base ring rests directly on the band crest surface
  const colletY = crestY;

  // Claws anchor into the band bridge to eliminate floating gaps
  const clawBaseY = crestY - 0.02;
  const clawTopY = girdleY + d * 0.12;

  return {
    dims,
    l,
    w,
    d,
    innerRadius,
    crestY,
    girdleY,
    galleryY,
    colletY,
    clawTopY,
    clawBaseY,
  };
}

/**
 * 1. BAND GEOMETRY: Parametric Comfort-Fit D-Profile Ring Shank
 */
export function createRingBandGeometry(style: RingStyle, diameterMm: number): THREE.BufferGeometry {
  const innerRadius = (diameterMm / 2) * 0.1;
  const bandThickness = 0.085;
  const bandWidth = 0.11;

  const ringSteps = 72;
  const profileSteps = 12;

  const positions: number[] = [];
  const indices: number[] = [];

  function getProfilePt(pIdx: number, wScale = 1.0, tScale = 1.0): [number, number] {
    const u = (pIdx / profileSteps) * Math.PI * 2;
    let x = Math.sin(u) * (bandWidth * 0.5 * wScale);
    let y = Math.cos(u) * (bandThickness * 0.5 * tScale);

    if (y < 0) {
      y = y * 0.35; // Comfort-fit inner flattening
    }
    return [x, y];
  }

  for (let i = 0; i <= ringSteps; i++) {
    const frac = i / ringSteps;
    const theta = (frac - 0.5) * Math.PI * 2;
    const absTheta = Math.abs(theta);

    let wScale = 1.0;
    let tScale = 1.0;
    let rOffset = 0.0;
    let twistOffset = 0.0;

    switch (style) {
      case 'cathedral': {
        // High sweeping arches meeting gallery rail
        if (absTheta < 0.65) {
          const arch = Math.cos((absTheta / 0.65) * (Math.PI / 2));
          rOffset = arch * 0.075;
          wScale = 1.0 - arch * 0.20;
        }
        break;
      }
      case 'pinch': {
        // Narrow shoulder taper at head
        if (absTheta < 0.45) {
          const pinch = Math.cos((absTheta / 0.45) * (Math.PI / 2));
          wScale = 1.0 - pinch * 0.45;
          tScale = 1.0 + pinch * 0.18;
        }
        break;
      }
      case 'split':
      case 'twoRowSplit': {
        // Flared split shoulders
        if (absTheta < 0.7) {
          const flare = Math.cos((absTheta / 0.7) * (Math.PI / 2));
          wScale = 1.0 + flare * 0.55;
        }
        break;
      }
      case 'twist': {
        twistOffset = Math.sin(theta * 6) * 0.016;
        break;
      }
      case 'classic':
      default:
        // Gentle taper at shoulders
        if (absTheta < 0.5) {
          const taper = Math.cos((absTheta / 0.5) * (Math.PI / 2));
          wScale = 1.0 - taper * 0.12;
        }
        break;
    }

    const currentRadius = innerRadius + bandThickness * 0.5 + rOffset;

    for (let j = 0; j <= profileSteps; j++) {
      const [px, py] = getProfilePt(j, wScale, tScale);
      const rad = currentRadius + py;
      const x = Math.sin(theta) * rad;
      const y = Math.cos(theta) * rad;
      const z = px + twistOffset;
      positions.push(x, y, z);
    }
  }

  for (let i = 0; i < ringSteps; i++) {
    for (let j = 0; j < profileSteps; j++) {
      const row1 = i * (profileSteps + 1);
      const row2 = (i + 1) * (profileSteps + 1);

      const a = row1 + j;
      const b = row2 + j;
      const c = row2 + j + 1;
      const d = row1 + j + 1;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * 2. PRONG GEOMETRY: Jewelcraft Tapered Claws with Domed Caps (_dome)
 * Anchored directly into the band bridge to eliminate all floating gaps.
 */
export function createProngsGeometry(
  shape: DiamondShape,
  carat: number,
  layout: HeadLayout
): THREE.BufferGeometry {
  const { l, w, d, girdleY, clawTopY, clawBaseY } = layout;

  const positions: number[] = [];

  function addTriangle(p1: Vec3, p2: Vec3, p3: Vec3) {
    positions.push(...p1, ...p2, ...p3);
  }

  function addQuad(p1: Vec3, p2: Vec3, p3: Vec3, p4: Vec3) {
    positions.push(...p1, ...p2, ...p3);
    positions.push(...p1, ...p3, ...p4);
  }

  function buildSingleClaw(
    baseCenter: Vec3,
    tipCenter: Vec3,
    baseRad: number,
    tipRad: number
  ) {
    const segs = 10;
    const baseLoop: Vec3[] = [];
    const tipLoop: Vec3[] = [];

    const dx = tipCenter[0] - baseCenter[0];
    const dy = tipCenter[1] - baseCenter[1];
    const dz = tipCenter[2] - baseCenter[2];
    const len = Math.hypot(dx, dy, dz) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const uz = dz / len;

    let rx = 0;
    let ry = -uz;
    let rz = uy;
    const rLen = Math.hypot(rx, ry, rz) || 1;
    rx /= rLen;
    ry /= rLen;
    rz /= rLen;

    const fx = uy * rz - uz * ry;
    const fy = uz * rx - ux * rz;
    const fz = ux * ry - uy * rx;

    for (let i = 0; i < segs; i++) {
      const a = (i * Math.PI * 2) / segs;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);

      const ox = (rx * cosA + fx * sinA);
      const oy = (ry * cosA + fy * sinA);
      const oz = (rz * cosA + fz * sinA);

      baseLoop.push([
        baseCenter[0] + ox * baseRad,
        baseCenter[1] + oy * baseRad,
        baseCenter[2] + oz * baseRad,
      ]);

      tipLoop.push([
        tipCenter[0] + ox * tipRad,
        tipCenter[1] + oy * tipRad,
        tipCenter[2] + oz * tipRad,
      ]);
    }

    for (let i = 0; i < segs; i++) {
      const next = (i + 1) % segs;
      addQuad(baseLoop[i], tipLoop[i], tipLoop[next], baseLoop[next]);
    }

    // Base cap
    for (let i = 0; i < segs; i++) {
      const next = (i + 1) % segs;
      addTriangle(baseCenter, baseLoop[next], baseLoop[i]);
    }

    // Jewelcraft _dome spherical cap
    const domeApex: Vec3 = [
      tipCenter[0] + ux * tipRad * 1.1,
      tipCenter[1] + uy * tipRad * 1.1,
      tipCenter[2] + uz * tipRad * 1.1,
    ];
    for (let i = 0; i < segs; i++) {
      const next = (i + 1) % segs;
      addTriangle(domeApex, tipLoop[i], tipLoop[next]);
    }
  }

  const baseRad = 0.038 * Math.cbrt(carat);
  const tipRad = 0.024 * Math.cbrt(carat);

  let prongs: { tip: [number, number]; base: [number, number] }[] = [];

  const hx = (w * 0.5) * 0.98;
  const hz = (l * 0.5) * 0.98;

  switch (shape) {
    case 'princess':
    case 'asscher': {
      const cx = hx * 0.96;
      const cz = hz * 0.96;
      prongs = [
        { tip: [cx, cz], base: [cx * 0.45, cz * 0.45] },
        { tip: [-cx, cz], base: [-cx * 0.45, cz * 0.45] },
        { tip: [-cx, -cz], base: [-cx * 0.45, -cz * 0.45] },
        { tip: [cx, -cz], base: [cx * 0.45, -cz * 0.45] },
      ];
      break;
    }
    case 'emerald':
    case 'radiant': {
      const cx = hx * 0.92;
      const cz = hz * 0.92;
      prongs = [
        { tip: [cx, cz], base: [cx * 0.45, cz * 0.45] },
        { tip: [-cx, cz], base: [-cx * 0.45, cz * 0.45] },
        { tip: [-cx, -cz], base: [-cx * 0.45, -cz * 0.45] },
        { tip: [cx, -cz], base: [cx * 0.45, -cz * 0.45] },
      ];
      break;
    }
    case 'oval': {
      const angle = Math.PI / 4;
      const px = Math.sin(angle) * hx * 0.95;
      const pz = Math.cos(angle) * hz * 0.95;
      prongs = [
        { tip: [px, pz], base: [px * 0.45, pz * 0.45] },
        { tip: [-px, pz], base: [-px * 0.45, pz * 0.45] },
        { tip: [-px, -pz], base: [-px * 0.45, -pz * 0.45] },
        { tip: [px, -pz], base: [px * 0.45, -pz * 0.45] },
      ];
      break;
    }
    case 'pear': {
      prongs = [
        { tip: [0, hz * 1.02], base: [0, hz * 0.45] },
        { tip: [hx * 0.95, hz * 0.1], base: [hx * 0.45, hz * 0.05] },
        { tip: [-hx * 0.95, hz * 0.1], base: [-hx * 0.45, hz * 0.05] },
        { tip: [hx * 0.65, -hz * 0.85], base: [hx * 0.32, -hz * 0.42] },
        { tip: [-hx * 0.65, -hz * 0.85], base: [-hx * 0.32, -hz * 0.42] },
      ];
      break;
    }
    case 'marquise': {
      prongs = [
        { tip: [0, hz * 1.02], base: [0, hz * 0.45] },
        { tip: [0, -hz * 1.02], base: [0, -hz * 0.45] },
        { tip: [hx * 0.98, hz * 0.32], base: [hx * 0.45, hz * 0.15] },
        { tip: [-hx * 0.98, hz * 0.32], base: [-hx * 0.45, hz * 0.15] },
        { tip: [hx * 0.98, -hz * 0.32], base: [hx * 0.45, -hz * 0.15] },
        { tip: [-hx * 0.98, -hz * 0.32], base: [-hx * 0.45, -hz * 0.15] },
      ];
      break;
    }
    case 'round':
    case 'cushion':
    default: {
      const cr = hx * 0.96;
      prongs = [
        { tip: [cr * 0.707, cr * 0.707], base: [cr * 0.32, cr * 0.32] },
        { tip: [-cr * 0.707, cr * 0.707], base: [-cr * 0.32, cr * 0.32] },
        { tip: [-cr * 0.707, -cr * 0.707], base: [-cr * 0.32, -cr * 0.32] },
        { tip: [cr * 0.707, -cr * 0.707], base: [cr * 0.32, -cr * 0.32] },
      ];
      break;
    }
  }

  for (const p of prongs) {
    const tipCenter: Vec3 = [p.tip[0], clawTopY, p.tip[1]];
    const baseCenter: Vec3 = [p.base[0], clawBaseY, p.base[1]];
    buildSingleClaw(baseCenter, tipCenter, baseRad, tipRad);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * 3. GALLERY RAIL & COLLET BASKET WITH INTEGRATED SADDLE BRIDGE
 * Connects under-bezel rail, collet base ring, vertical basket struts,
 * and solid bridge pedestals that seamlessly fuse the head to the band shank.
 * Completely eliminates floating gaps and provides authentic jewelry CAD topology.
 */
export function createGalleryRailGeometry(
  shape: DiamondShape,
  carat: number,
  layout: HeadLayout
): THREE.BufferGeometry {
  const { l, w, crestY, galleryY, colletY } = layout;

  const wireRad = 0.022 * Math.cbrt(carat);
  const positions: number[] = [];

  function addTriangle(p1: Vec3, p2: Vec3, p3: Vec3) {
    positions.push(...p1, ...p2, ...p3);
  }

  function addQuad(p1: Vec3, p2: Vec3, p3: Vec3, p4: Vec3) {
    positions.push(...p1, ...p2, ...p3);
    positions.push(...p1, ...p3, ...p4);
  }

  function buildWireLoop(y: number, rx: number, rz: number) {
    const loopSteps = 24;
    const tubeSteps = 8;

    for (let i = 0; i < loopSteps; i++) {
      const nextI = (i + 1) % loopSteps;
      const a1 = (i * Math.PI * 2) / loopSteps;
      const a2 = (nextI * Math.PI * 2) / loopSteps;

      const cx1 = Math.sin(a1) * rx;
      const cz1 = Math.cos(a1) * rz;
      const cx2 = Math.sin(a2) * rx;
      const cz2 = Math.cos(a2) * rz;

      for (let j = 0; j < tubeSteps; j++) {
        const nextJ = (j + 1) % tubeSteps;
        const ta1 = (j * Math.PI * 2) / tubeSteps;
        const ta2 = (nextJ * Math.PI * 2) / tubeSteps;

        const p1: Vec3 = [cx1 + Math.sin(a1) * Math.sin(ta1) * wireRad, y + Math.cos(ta1) * wireRad, cz1 + Math.cos(a1) * Math.sin(ta1) * wireRad];
        const p2: Vec3 = [cx2 + Math.sin(a2) * Math.sin(ta1) * wireRad, y + Math.cos(ta1) * wireRad, cz2 + Math.cos(a2) * Math.sin(ta1) * wireRad];
        const p3: Vec3 = [cx2 + Math.sin(a2) * Math.sin(ta2) * wireRad, y + Math.cos(ta2) * wireRad, cz2 + Math.cos(a2) * Math.sin(ta2) * wireRad];
        const p4: Vec3 = [cx1 + Math.sin(a1) * Math.sin(ta2) * wireRad, y + Math.cos(ta2) * wireRad, cz1 + Math.cos(a1) * Math.sin(ta2) * wireRad];

        addQuad(p1, p2, p3, p4);
      }
    }
  }

  function buildStrut(fromPt: Vec3, toPt: Vec3, rad: number) {
    const segs = 6;
    const dx = toPt[0] - fromPt[0];
    const dy = toPt[1] - fromPt[1];
    const dz = toPt[2] - fromPt[2];
    const len = Math.hypot(dx, dy, dz) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const uz = dz / len;

    let rx = 0;
    let ry = -uz;
    let rz = uy;
    const rLen = Math.hypot(rx, ry, rz) || 1;
    rx /= rLen;
    ry /= rLen;
    rz /= rLen;

    const fx = uy * rz - uz * ry;
    const fy = uz * rx - ux * rz;
    const fz = ux * ry - uy * rx;

    for (let i = 0; i < segs; i++) {
      const next = (i + 1) % segs;
      const a1 = (i * Math.PI * 2) / segs;
      const a2 = (next * Math.PI * 2) / segs;

      const p1: Vec3 = [fromPt[0] + (rx * Math.cos(a1) + fx * Math.sin(a1)) * rad, fromPt[1] + (ry * Math.cos(a1) + fy * Math.sin(a1)) * rad, fromPt[2] + (rz * Math.cos(a1) + fz * Math.sin(a1)) * rad];
      const p2: Vec3 = [fromPt[0] + (rx * Math.cos(a2) + fx * Math.sin(a2)) * rad, fromPt[1] + (ry * Math.cos(a2) + fy * Math.sin(a2)) * rad, fromPt[2] + (rz * Math.cos(a2) + fz * Math.sin(a2)) * rad];
      const p3: Vec3 = [toPt[0] + (rx * Math.cos(a2) + fx * Math.sin(a2)) * rad, toPt[1] + (ry * Math.cos(a2) + fy * Math.sin(a2)) * rad, toPt[2] + (rz * Math.cos(a2) + fz * Math.sin(a2)) * rad];
      const p4: Vec3 = [toPt[0] + (rx * Math.cos(a1) + fx * Math.sin(a1)) * rad, toPt[1] + (ry * Math.cos(a1) + fy * Math.sin(a1)) * rad, toPt[2] + (rz * Math.cos(a1) + fz * Math.sin(a1)) * rad];

      addQuad(p1, p2, p3, p4);
    }
  }

  const railRx = (w * 0.5) * 0.88;
  const railRz = (l * 0.5) * 0.88;
  const colletRx = (w * 0.5) * 0.48;
  const colletRz = (l * 0.5) * 0.48;

  // 1. Upper Under-Bezel Gallery Rail
  buildWireLoop(galleryY, railRx, railRz);

  // 2. Collet Base Ring resting flush on the band bridge
  buildWireLoop(colletY, colletRx, colletRz);

  // 3. Four Basket Strut Pillars connecting collet base to gallery rail
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const fromPt: Vec3 = [Math.sin(a) * colletRx, colletY, Math.cos(a) * colletRz];
    const toPt: Vec3 = [Math.sin(a) * railRx, galleryY, Math.cos(a) * railRz];
    buildStrut(fromPt, toPt, wireRad * 0.85);
  }

  // 4. Solid Saddle Bridge: Integrates the band shoulders to the collet basket
  // Eliminates the gap seen from the front view by filling the saddle mount
  const bridgeWidth = 0.055;
  const saddleSteps = 10;
  for (const sign of [-1, 1]) {
    for (let i = 0; i < saddleSteps; i++) {
      const frac1 = i / saddleSteps;
      const frac2 = (i + 1) / saddleSteps;

      // Curve from band shoulder (x = ±0.20, y = crestY - 0.04) up into collet (x = ±colletRx, y = colletY)
      const x1 = sign * (0.22 - frac1 * (0.22 - colletRx));
      const x2 = sign * (0.22 - frac2 * (0.22 - colletRx));

      const y1 = (crestY - 0.04) + Math.sin(frac1 * (Math.PI / 2)) * (colletY - (crestY - 0.04));
      const y2 = (crestY - 0.04) + Math.sin(frac2 * (Math.PI / 2)) * (colletY - (crestY - 0.04));

      const p1: Vec3 = [x1, y1, -bridgeWidth];
      const p2: Vec3 = [x2, y2, -bridgeWidth];
      const p3: Vec3 = [x2, y2, bridgeWidth];
      const p4: Vec3 = [x1, y1, bridgeWidth];

      addQuad(p1, p2, p3, p4);

      // Bottom under-saddle contour
      const pB1: Vec3 = [x1, y1 - 0.025, -bridgeWidth * 0.7];
      const pB2: Vec3 = [x2, y2 - 0.025, -bridgeWidth * 0.7];
      const pB3: Vec3 = [x2, y2 - 0.025, bridgeWidth * 0.7];
      const pB4: Vec3 = [x1, y1 - 0.025, bridgeWidth * 0.7];

      addQuad(pB1, pB4, pB3, pB2);
      addQuad(p1, pB1, pB2, p2);
      addQuad(p4, p3, pB3, pB4);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * 4. HALO GEOMETRY: Hidden Halo or Single Framing Halo
 */
export function createHaloGeometry(
  shape: DiamondShape,
  carat: number,
  halo: Halo,
  layout: HeadLayout
): { diamondGeo: THREE.BufferGeometry; metalGeo: THREE.BufferGeometry } | null {
  if (halo === 'none') return null;

  const { l, w, girdleY, galleryY } = layout;

  const dPositions: number[] = [];
  const mPositions: number[] = [];

  function addMicroStone(center: Vec3, rad: number) {
    const [cx, cy, cz] = center;
    const tableY = cy + rad * 0.35;
    const culetY = cy - rad * 0.65;
    const n = 8;
    const girdleVerts: Vec3[] = [];

    for (let i = 0; i < n; i++) {
      const a = (i * Math.PI * 2) / n;
      girdleVerts.push([cx + Math.sin(a) * rad, cy, cz + Math.cos(a) * rad]);
    }

    const tableCenter: Vec3 = [cx, tableY, cz];
    const culet: Vec3 = [cx, culetY, cz];

    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      dPositions.push(...tableCenter, ...girdleVerts[i], ...girdleVerts[next]);
      dPositions.push(...culet, ...girdleVerts[next], ...girdleVerts[i]);
    }
  }

  function addBead(center: Vec3, bRad: number) {
    const [cx, cy, cz] = center;
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a1 = (i * Math.PI * 2) / n;
      const a2 = ((i + 1) * Math.PI * 2) / n;
      mPositions.push(
        cx, cy + bRad, cz,
        cx + Math.sin(a1) * bRad, cy, cz + Math.cos(a1) * bRad,
        cx + Math.cos(a2) * bRad, cy, cz + Math.cos(a2) * bRad
      );
    }
  }

  if (halo === 'hidden') {
    const numStones = 16;
    const stoneRad = 0.016;
    const rx = (w * 0.5) * 0.90;
    const rz = (l * 0.5) * 0.90;

    for (let i = 0; i < numStones; i++) {
      const a = (i * Math.PI * 2) / numStones;
      const px = Math.sin(a) * rx;
      const pz = Math.cos(a) * rz;
      addMicroStone([px, galleryY, pz], stoneRad);
      addBead([px * 1.05, galleryY + stoneRad * 0.8, pz * 1.05], 0.007);
    }
  } else if (halo === 'single') {
    const numStones = 22;
    const stoneRad = 0.022;
    const rx = (w * 0.5) + stoneRad * 1.8;
    const rz = (l * 0.5) + stoneRad * 1.8;

    for (let i = 0; i < numStones; i++) {
      const a = (i * Math.PI * 2) / numStones;
      const px = Math.sin(a) * rx;
      const pz = Math.cos(a) * rz;
      addMicroStone([px, girdleY - 0.01, pz], stoneRad);
      addBead([px + Math.sin(a) * 0.012, girdleY + 0.01, pz + Math.cos(a) * 0.012], 0.008);
    }
  }

  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.Float32BufferAttribute(dPositions, 3));
  dGeo.computeVertexNormals();

  const mGeo = new THREE.BufferGeometry();
  mGeo.setAttribute('position', new THREE.Float32BufferAttribute(mPositions, 3));
  mGeo.computeVertexNormals();

  return { diamondGeo: dGeo, metalGeo: mGeo };
}

/**
 * 5. SHOULDER ACCENTS: Plain, Pavé, Prong, Channel
 */
export function createShoulderPaveGeometry(
  side: SideSetting,
  diameterMm: number
): { diamondGeo: THREE.BufferGeometry; beadGeo: THREE.BufferGeometry } | null {
  if (side === 'plain') return null;

  const innerRadius = (diameterMm / 2) * 0.1;
  const crestRadius = innerRadius + 0.085;
  const stonesPerShoulder = side === 'prong' ? 5 : 6;
  const diamondRad = side === 'prong' ? 0.032 : 0.026;
  const beadRad = 0.011;

  const dPositions: number[] = [];
  const bPositions: number[] = [];

  function addDiamond(center: Vec3) {
    const [cx, cy, cz] = center;
    const tableY = cy + diamondRad * 0.35;
    const culetY = cy - diamondRad * 0.65;
    const n = 8;
    const girdleVerts: Vec3[] = [];

    for (let i = 0; i < n; i++) {
      const a = (i * Math.PI * 2) / n;
      girdleVerts.push([cx + Math.sin(a) * diamondRad, cy, cz + Math.cos(a) * diamondRad]);
    }

    const tableCenter: Vec3 = [cx, tableY, cz];
    const culet: Vec3 = [cx, culetY, cz];

    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      dPositions.push(...tableCenter, ...girdleVerts[i], ...girdleVerts[next]);
      dPositions.push(...culet, ...girdleVerts[next], ...girdleVerts[i]);
    }
  }

  function addBead(center: Vec3) {
    const [cx, cy, cz] = center;
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a1 = (i * Math.PI * 2) / n;
      const a2 = ((i + 1) * Math.PI * 2) / n;
      bPositions.push(
        cx, cy + beadRad, cz,
        cx + Math.sin(a1) * beadRad, cy, cz + Math.cos(a1) * beadRad,
        cx + Math.cos(a2) * beadRad, cy, cz + Math.cos(a2) * beadRad
      );
    }
  }

  for (const sign of [-1, 1]) {
    for (let i = 0; i < stonesPerShoulder; i++) {
      const angle = (0.22 + (i * 0.075)) * sign;
      const px = Math.sin(angle) * crestRadius;
      const py = Math.cos(angle) * crestRadius;
      const pz = 0;

      addDiamond([px, py, pz]);

      if (side === 'pave') {
        addBead([px, py + 0.005, pz + diamondRad * 1.1]);
        addBead([px, py + 0.005, pz - diamondRad * 1.1]);
      } else if (side === 'prong') {
        addBead([px + Math.sin(angle) * 0.01, py + 0.015, pz]);
      }
    }
  }

  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.Float32BufferAttribute(dPositions, 3));
  dGeo.computeVertexNormals();

  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute('position', new THREE.Float32BufferAttribute(bPositions, 3));
  bGeo.computeVertexNormals();

  return { diamondGeo: dGeo, beadGeo: bGeo };
}
