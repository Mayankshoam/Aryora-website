import * as THREE from 'three';
import { RingStyle, SideSetting, DiamondShape, getGemDimensionsMm } from './types';

/**
 * Jewelcraft-calibrated Fine Jewelry CAD Ring Shank & Setting Generator
 *
 * Implements:
 * 1. Comfort-Fit D-Profile Band Extrusions (Classic, Cathedral, Twist, Split, Two-Row, Pinch)
 * 2. Jewelcraft Tapered Claws with Domed Spherical Caps (_dome) & Girdle Overlap
 * 3. Under-Bezel Gallery Rail & Open Collet Basket Wires
 * 4. Shoulder Pavé Micro-Diamond Accent Settings with Bead Prongs
 */

type Vec3 = [number, number, number];

/**
 * 1. BAND GEOMETRY: Parametric Comfort-Fit D-Profile Ring Shank
 */
export function createRingBandGeometry(style: RingStyle, diameterMm: number): THREE.BufferGeometry {
  const innerRadius = (diameterMm / 2) * 0.1; // Three.js units (1mm = 0.1 units)
  const bandThickness = 0.085; // Radial height (from finger to outer crest)
  const bandWidth = 0.11; // Lateral width across the finger

  // Radial resolution along the ring circle and profile resolution around D-shape
  const ringSteps = 72;
  const profileSteps = 12;

  const positions: number[] = [];
  const indices: number[] = [];

  // Generate D-profile cross section points relative to local center
  function getProfilePt(pIdx: number, wScale = 1.0, tScale = 1.0): [number, number] {
    const u = (pIdx / profileSteps) * Math.PI * 2;
    // D-profile: flat inner finger contact (y <= 0), convex smooth dome on outer side (y > 0)
    let x = Math.sin(u) * (bandWidth * 0.5 * wScale);
    let y = Math.cos(u) * (bandThickness * 0.5 * tScale);

    if (y < 0) {
      y = y * 0.35; // Flatten inside contact for comfort-fit
    }
    return [x, y];
  }

  // Iterate along the ring path (theta = -PI to +PI, head at theta = 0)
  for (let i = 0; i <= ringSteps; i++) {
    const frac = i / ringSteps;
    const theta = (frac - 0.5) * Math.PI * 2; // -PI to PI
    const absTheta = Math.abs(theta);

    // Style-specific modulation along the ring circumference
    let wScale = 1.0;
    let tScale = 1.0;
    let rOffset = 0.0;
    let twistOffset = 0.0;

    switch (style) {
      case 'cathedral': {
        // High arched shoulders that sweep upward to meet the setting
        if (absTheta < 0.65) {
          const arch = Math.cos((absTheta / 0.65) * (Math.PI / 2));
          rOffset = arch * 0.065;
          wScale = 1.0 - arch * 0.25;
        }
        break;
      }
      case 'pinch': {
        // Pinch narrow right before meeting the center stone
        if (absTheta < 0.45) {
          const pinch = Math.cos((absTheta / 0.45) * (Math.PI / 2));
          wScale = 1.0 - pinch * 0.45;
          tScale = 1.0 + pinch * 0.2;
        }
        break;
      }
      case 'split':
      case 'twoRowSplit': {
        // Band flares wider towards the top head
        if (absTheta < 0.7) {
          const flare = Math.cos((absTheta / 0.7) * (Math.PI / 2));
          wScale = 1.0 + flare * 0.55;
        }
        break;
      }
      case 'twist': {
        // Subtle helical twist along shoulders
        twistOffset = Math.sin(theta * 6) * 0.018;
        break;
      }
      case 'classic':
      default:
        // Gentle taper towards the head
        if (absTheta < 0.5) {
          const taper = Math.cos((absTheta / 0.5) * (Math.PI / 2));
          wScale = 1.0 - taper * 0.15;
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

  // Connect adjacent rings with quad faces
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
 * 2. PRONG GEOMETRY: Jewelcraft Tapered Claws with Domed Spherical Caps (_dome)
 */
export function createProngsGeometry(
  shape: DiamondShape,
  carat: number,
  headBaseY: number
): THREE.BufferGeometry {
  const dims = getGemDimensionsMm(shape, carat);
  const l = dims.lengthMm * 0.1;
  const w = dims.widthMm * 0.1;
  const d = dims.depthMm * 0.1;

  const positions: number[] = [];

  function addTriangle(p1: Vec3, p2: Vec3, p3: Vec3) {
    positions.push(...p1, ...p2, ...p3);
  }

  function addQuad(p1: Vec3, p2: Vec3, p3: Vec3, p4: Vec3) {
    positions.push(...p1, ...p2, ...p3);
    positions.push(...p1, ...p3, ...p4);
  }

  /**
   * Builds single Jewelcraft tapered claw with spherical domed tip cap (_dome)
   */
  function buildSingleClaw(
    baseCenter: Vec3,
    tipCenter: Vec3,
    baseRad: number,
    tipRad: number
  ) {
    const segs = 10;
    const baseLoop: Vec3[] = [];
    const tipLoop: Vec3[] = [];

    // Direction vector from base to tip
    const dx = tipCenter[0] - baseCenter[0];
    const dy = tipCenter[1] - baseCenter[1];
    const dz = tipCenter[2] - baseCenter[2];
    const len = Math.hypot(dx, dy, dz) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const uz = dz / len;

    // Orthogonal frame
    let rx = 0;
    let ry = -uz;
    let rz = uy;
    const rLen = Math.hypot(rx, ry, rz) || 1;
    rx /= rLen;
    ry /= rLen;
    rz /= rLen;

    // Cross product
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

    // Tapered shaft cylinder
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

  // Prong placement based on gemstone cut
  const gemCenterY = headBaseY + d * 0.65;
  const girdleY = gemCenterY;
  const clawTopY = girdleY + d * 0.18; // Overlaps crown facet
  const clawBaseY = headBaseY + 0.02;

  const baseRad = 0.038 * Math.cbrt(carat);
  const tipRad = 0.026 * Math.cbrt(carat);

  let prongAngles: { angle: number; r: number }[] = [];

  switch (shape) {
    case 'princess':
    case 'asscher': {
      // 4 Corner V-Prongs / Chevron Claws
      const cr = (w * 0.5) * 1.05;
      prongAngles = [
        { angle: Math.PI / 4, r: cr * Math.SQRT2 },
        { angle: (3 * Math.PI) / 4, r: cr * Math.SQRT2 },
        { angle: (5 * Math.PI) / 4, r: cr * Math.SQRT2 },
        { angle: (7 * Math.PI) / 4, r: cr * Math.SQRT2 },
      ];
      break;
    }
    case 'emerald':
    case 'radiant': {
      // 4 Corner Claws on beveled corners
      const hx = (l * 0.5) * 0.95;
      const hz = (w * 0.5) * 0.95;
      prongAngles = [
        { angle: Math.atan2(hz, hx), r: Math.hypot(hx, hz) },
        { angle: Math.atan2(hz, -hx), r: Math.hypot(hx, hz) },
        { angle: Math.atan2(-hz, -hx), r: Math.hypot(hx, hz) },
        { angle: Math.atan2(-hz, hx), r: Math.hypot(hx, hz) },
      ];
      break;
    }
    case 'oval': {
      // 4 Claws placed along elliptical curve
      const crx = (l * 0.5) * 0.88;
      const crz = (w * 0.5) * 0.88;
      prongAngles = [
        { angle: Math.PI / 5, r: Math.hypot(Math.cos(Math.PI / 5) * crx, Math.sin(Math.PI / 5) * crz) },
        { angle: (4 * Math.PI) / 5, r: Math.hypot(Math.cos((4 * Math.PI) / 5) * crx, Math.sin((4 * Math.PI) / 5) * crz) },
        { angle: (6 * Math.PI) / 5, r: Math.hypot(Math.cos((6 * Math.PI) / 5) * crx, Math.sin((6 * Math.PI) / 5) * crz) },
        { angle: (9 * Math.PI) / 5, r: Math.hypot(Math.cos((9 * Math.PI) / 5) * crx, Math.sin((9 * Math.PI) / 5) * crz) },
      ];
      break;
    }
    case 'pear': {
      // 5 Claws: 1 V-tip + 4 perimeter
      const cr = (w * 0.5) * 0.95;
      prongAngles = [
        { angle: Math.PI / 2, r: (l * 0.5) * 1.05 }, // Tip
        { angle: Math.PI / 7, r: cr },
        { angle: (6 * Math.PI) / 7, r: cr },
        { angle: (9 * Math.PI) / 7, r: cr },
        { angle: (12 * Math.PI) / 7, r: cr },
      ];
      break;
    }
    case 'marquise': {
      // 6 Claws: 2 V-tips + 4 flank claws
      const hl = (l * 0.5) * 1.04;
      const hw = (w * 0.5) * 0.92;
      prongAngles = [
        { angle: Math.PI / 2, r: hl },
        { angle: (3 * Math.PI) / 2, r: hl },
        { angle: Math.PI / 6, r: hw * 1.1 },
        { angle: (5 * Math.PI) / 6, r: hw * 1.1 },
        { angle: (7 * Math.PI) / 6, r: hw * 1.1 },
        { angle: (11 * Math.PI) / 6, r: hw * 1.1 },
      ];
      break;
    }
    case 'round':
    case 'cushion':
    default: {
      // Classic 4-prong setting at 45 degree corners
      const cr = (w * 0.5) * 0.96;
      prongAngles = [
        { angle: Math.PI / 4, r: cr },
        { angle: (3 * Math.PI) / 4, r: cr },
        { angle: (5 * Math.PI) / 4, r: cr },
        { angle: (7 * Math.PI) / 4, r: cr },
      ];
      break;
    }
  }

  for (const p of prongAngles) {
    const cosA = Math.cos(p.angle);
    const sinA = Math.sin(p.angle);

    // Tip grasps inward over the girdle
    const tipX = cosA * (p.r * 0.94);
    const tipZ = sinA * (p.r * 0.94);
    const tipCenter: Vec3 = [tipX, clawTopY, tipZ];

    // Base converges down to the collet base ring
    const baseX = cosA * (p.r * 0.55);
    const baseZ = sinA * (p.r * 0.55);
    const baseCenter: Vec3 = [baseX, clawBaseY, baseZ];

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
  headBaseY: number
): THREE.BufferGeometry {
  const dims = getGemDimensionsMm(shape, carat);
  const l = dims.lengthMm * 0.1;
  const w = dims.widthMm * 0.1;
  const d = dims.depthMm * 0.1;

  const railY = headBaseY + d * 0.42; // Right beneath the girdle
  const colletY = headBaseY + 0.04; // Base connection ring
  const wireRad = 0.022 * Math.cbrt(carat);

  const positions: number[] = [];
  function addTriangle(p1: Vec3, p2: Vec3, p3: Vec3) {
    positions.push(...p1, ...p2, ...p3);
  }
  function addQuad(p1: Vec3, p2: Vec3, p3: Vec3, p4: Vec3) {
    positions.push(...p1, ...p2, ...p3);
    positions.push(...p1, ...p3, ...p4);
  }

  // Generate toroidal wire loop at given Y with Rx and Rz
  function buildWireLoop(y: number, rx: number, rz: number) {
    const loopSteps = 24;
    const tubeSteps = 8;

    for (let i = 0; i < loopSteps; i++) {
      const nextI = (i + 1) % loopSteps;
      const a1 = (i * Math.PI * 2) / loopSteps;
      const a2 = (nextI * Math.PI * 2) / loopSteps;

      const cx1 = Math.cos(a1) * rx;
      const cz1 = Math.sin(a1) * rz;
      const cx2 = Math.cos(a2) * rx;
      const cz2 = Math.sin(a2) * rz;

      for (let j = 0; j < tubeSteps; j++) {
        const nextJ = (j + 1) % tubeSteps;
        const ta1 = (j * Math.PI * 2) / tubeSteps;
        const ta2 = (nextJ * Math.PI * 2) / tubeSteps;

        const p1: Vec3 = [cx1 + Math.cos(a1) * Math.sin(ta1) * wireRad, y + Math.cos(ta1) * wireRad, cz1 + Math.sin(a1) * Math.sin(ta1) * wireRad];
        const p2: Vec3 = [cx2 + Math.cos(a2) * Math.sin(ta1) * wireRad, y + Math.cos(ta1) * wireRad, cz2 + Math.sin(a2) * Math.sin(ta1) * wireRad];
        const p3: Vec3 = [cx2 + Math.cos(a2) * Math.sin(ta2) * wireRad, y + Math.cos(ta2) * wireRad, cz2 + Math.sin(a2) * Math.sin(ta2) * wireRad];
        const p4: Vec3 = [cx1 + Math.cos(a1) * Math.sin(ta2) * wireRad, y + Math.cos(ta1) * wireRad, cz1 + Math.sin(a1) * Math.sin(ta2) * wireRad];

        addQuad(p1, p2, p3, p4);
      }
    }
  }

  // 1. Gallery Rail (Upper under-bezel ring)
  buildWireLoop(railY, (l * 0.5) * 0.85, (w * 0.5) * 0.85);

  // 2. Collet Base Ring (Lower convergence ring)
  buildWireLoop(colletY, (l * 0.5) * 0.48, (w * 0.5) * 0.48);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * 4. SHOULDER PAVÉ ACCENT STONES & BEADS
 * Generates rows of micro-diamonds and micropave beads along the band shoulders.
 */
export function createShoulderPaveGeometry(
  side: SideSetting,
  diameterMm: number
): { diamondGeo: THREE.BufferGeometry; beadGeo: THREE.BufferGeometry } | null {
  if (side === 'plain') return null;

  const innerRadius = (diameterMm / 2) * 0.1;
  const crestRadius = innerRadius + 0.085;
  const stonesPerShoulder = 6;
  const diamondRad = 0.028;
  const beadRad = 0.012;

  const dPositions: number[] = [];
  const bPositions: number[] = [];

  function addDiamond(center: Vec3) {
    // 8-facet micro-brilliant
    const [cx, cy, cz] = center;
    const tableY = cy + diamondRad * 0.35;
    const culetY = cy - diamondRad * 0.65;
    const n = 8;
    const girdleVerts: Vec3[] = [];

    for (let i = 0; i < n; i++) {
      const a = (i * Math.PI * 2) / n;
      girdleVerts.push([cx + Math.cos(a) * diamondRad, cy, cz + Math.sin(a) * diamondRad]);
    }

    const tableCenter: Vec3 = [cx, tableY, cz];
    const culet: Vec3 = [cx, culetY, cz];

    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      // Crown
      dPositions.push(...tableCenter, ...girdleVerts[i], ...girdleVerts[next]);
      // Pavilion
      dPositions.push(...culet, ...girdleVerts[next], ...girdleVerts[i]);
    }
  }

  function addBead(center: Vec3) {
    const [cx, cy, cz] = center;
    // Micro sphere bead
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a1 = (i * Math.PI * 2) / n;
      const a2 = ((i + 1) * Math.PI * 2) / n;
      bPositions.push(
        cx, cy + beadRad, cz,
        cx + Math.cos(a1) * beadRad, cy, cz + Math.sin(a1) * beadRad,
        cx + Math.cos(a2) * beadRad, cy, cz + Math.sin(a2) * beadRad
      );
    }
  }

  // Place along left and right shoulders
  for (const sign of [-1, 1]) {
    for (let i = 0; i < stonesPerShoulder; i++) {
      const angle = (0.20 + (i * 0.08)) * sign; // Shoulder arc radians
      const px = Math.sin(angle) * crestRadius;
      const py = Math.cos(angle) * crestRadius;
      const pz = 0;

      addDiamond([px, py, pz]);

      // Micro beads flanking the stone
      addBead([px, py + 0.005, pz + diamondRad * 1.1]);
      addBead([px, py + 0.005, pz - diamondRad * 1.1]);
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
