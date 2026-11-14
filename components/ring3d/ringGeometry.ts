import * as THREE from 'three';
import { RingStyle, SideSetting, DiamondShape, Halo, getGemDimensionsMm } from './types';

/**
 * Jewelcraft-calibrated Fine Jewelry CAD Ring Shank & Setting Generator
 *
 * Implements:
 * 1. HeadLayout calculation for CAD precision alignment
 * 2. Comfort-Fit D-Profile Band Extrusions (Classic, Cathedral, Twist, Split, Two-Row, Pinch)
 * 3. Jewelcraft Tapered Claws with Domed Spherical Caps (_dome) & Girdle Overlap
 * 4. Under-Bezel Gallery Rail & Open Collet Basket Wires
 * 5. Halo Settings (Hidden Halo & Single Halo)
 * 6. Shoulder Settings (Plain, Pavé, Prong, Channel)
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
  colletY: number; // collet base wire
  clawTopY: number; // tip of prongs
  clawBaseY: number; // base of prongs
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

  // Culet clearance above the band bridge
  const culetClearance = 0.035;
  const pavilionDepth = d * 0.65;
  const girdleY = crestY + culetClearance + pavilionDepth;

  // Gallery rail sits 22% of diamond depth beneath girdle
  const galleryY = girdleY - d * 0.22;
  const colletY = crestY + 0.02;

  const clawBaseY = colletY;
  const clawTopY = girdleY + d * 0.14;

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
        if (absTheta < 0.65) {
          const arch = Math.cos((absTheta / 0.65) * (Math.PI / 2));
          rOffset = arch * 0.065;
          wScale = 1.0 - arch * 0.22;
        }
        break;
      }
      case 'pinch': {
        if (absTheta < 0.45) {
          const pinch = Math.cos((absTheta / 0.45) * (Math.PI / 2));
          wScale = 1.0 - pinch * 0.45;
          tScale = 1.0 + pinch * 0.18;
        }
        break;
      }
      case 'split':
      case 'twoRowSplit': {
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

  const baseRad = 0.036 * Math.cbrt(carat);
  const tipRad = 0.024 * Math.cbrt(carat);

  let prongs: { tip: [number, number]; base: [number, number] }[] = [];

  const hx = (w * 0.5) * 0.98;
  const hz = (l * 0.5) * 0.98;

  switch (shape) {
    case 'princess':
    case 'asscher': {
      // 4 Corner V-Prongs on corners
      const cx = hx * 0.96;
      const cz = hz * 0.96;
      prongs = [
        { tip: [cx, cz], base: [cx * 0.5, cz * 0.5] },
        { tip: [-cx, cz], base: [-cx * 0.5, cz * 0.5] },
        { tip: [-cx, -cz], base: [-cx * 0.5, -cz * 0.5] },
        { tip: [cx, -cz], base: [cx * 0.5, -cz * 0.5] },
      ];
      break;
    }
    case 'emerald':
    case 'radiant': {
      // 4 Corner Claws on beveled chamfers
      const cx = hx * 0.92;
      const cz = hz * 0.92;
      prongs = [
        { tip: [cx, cz], base: [cx * 0.5, cz * 0.5] },
        { tip: [-cx, cz], base: [-cx * 0.5, cz * 0.5] },
        { tip: [-cx, -cz], base: [-cx * 0.5, -cz * 0.5] },
        { tip: [cx, -cz], base: [cx * 0.5, -cz * 0.5] },
      ];
      break;
    }
    case 'oval': {
      // 4 Claws placed along elliptical curve
      const angle = Math.PI / 4;
      const px = Math.sin(angle) * hx * 0.95;
      const pz = Math.cos(angle) * hz * 0.95;
      prongs = [
        { tip: [px, pz], base: [px * 0.5, pz * 0.5] },
        { tip: [-px, pz], base: [-px * 0.5, pz * 0.5] },
        { tip: [-px, -pz], base: [-px * 0.5, -pz * 0.5] },
        { tip: [px, -pz], base: [px * 0.5, -pz * 0.5] },
      ];
      break;
    }
    case 'pear': {
      // 5 Claws: 1 V-tip at apex (+z), 2 on sides, 2 on rounded base
      prongs = [
        { tip: [0, hz * 1.02], base: [0, hz * 0.5] }, // Apex
        { tip: [hx * 0.95, hz * 0.1], base: [hx * 0.5, hz * 0.05] },
        { tip: [-hx * 0.95, hz * 0.1], base: [-hx * 0.5, hz * 0.05] },
        { tip: [hx * 0.65, -hz * 0.85], base: [hx * 0.35, -hz * 0.45] },
        { tip: [-hx * 0.65, -hz * 0.85], base: [-hx * 0.35, -hz * 0.45] },
      ];
      break;
    }
    case 'marquise': {
      // 6 Claws: 2 V-tips at ends, 4 flank claws
      prongs = [
        { tip: [0, hz * 1.02], base: [0, hz * 0.5] },
        { tip: [0, -hz * 1.02], base: [0, -hz * 0.5] },
        { tip: [hx * 0.98, hz * 0.32], base: [hx * 0.5, hz * 0.16] },
        { tip: [-hx * 0.98, hz * 0.32], base: [-hx * 0.5, hz * 0.16] },
        { tip: [hx * 0.98, -hz * 0.32], base: [hx * 0.5, -hz * 0.16] },
        { tip: [-hx * 0.98, -hz * 0.32], base: [-hx * 0.5, -hz * 0.16] },
      ];
      break;
    }
    case 'round':
    case 'cushion':
    default: {
      const cr = hx * 0.96;
      prongs = [
        { tip: [cr * 0.707, cr * 0.707], base: [cr * 0.36, cr * 0.36] },
        { tip: [-cr * 0.707, cr * 0.707], base: [-cr * 0.36, cr * 0.36] },
        { tip: [-cr * 0.707, -cr * 0.707], base: [-cr * 0.36, -cr * 0.36] },
        { tip: [cr * 0.707, -cr * 0.707], base: [cr * 0.36, -cr * 0.36] },
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
 * 3. GALLERY RAIL & COLLET BASKET: Under-bezel structural wire ring
 */
export function createGalleryRailGeometry(
  shape: DiamondShape,
  carat: number,
  layout: HeadLayout
): THREE.BufferGeometry {
  const { l, w, galleryY, colletY } = layout;

  const wireRad = 0.020 * Math.cbrt(carat);
  const positions: number[] = [];

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

  // 1. Gallery Rail right under girdle
  buildWireLoop(galleryY, (w * 0.5) * 0.86, (l * 0.5) * 0.86);

  // 2. Collet Base Wire at band junction
  buildWireLoop(colletY, (w * 0.5) * 0.50, (l * 0.5) * 0.50);

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
        cx + Math.sin(a2) * bRad, cy, cz + Math.cos(a2) * bRad
      );
    }
  }

  if (halo === 'hidden') {
    // Hidden Halo: Collar of micro-diamonds around the gallery rail facing outward
    const numStones = 16;
    const stoneRad = 0.016;
    const rx = (w * 0.5) * 0.88;
    const rz = (l * 0.5) * 0.88;

    for (let i = 0; i < numStones; i++) {
      const a = (i * Math.PI * 2) / numStones;
      const px = Math.sin(a) * rx;
      const pz = Math.cos(a) * rz;
      addMicroStone([px, galleryY, pz], stoneRad);
      addBead([px * 1.05, galleryY + stoneRad * 0.8, pz * 1.05], 0.007);
    }
  } else if (halo === 'single') {
    // Single Halo: Full perimeter framing the diamond girdle
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
        cx + Math.sin(a2) * beadRad, cy, cz + Math.cos(a2) * beadRad
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
