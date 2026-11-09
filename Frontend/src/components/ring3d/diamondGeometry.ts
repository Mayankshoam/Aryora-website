/**
 * Procedural 3D Faceted Diamond Geometries
 * Generates mathematically precise faceted gemstone meshes for all 9 cuts:
 * Round Brilliant, Oval, Princess, Emerald, Cushion, Radiant, Asscher, Pear, Marquise.
 * Uses unindexed planar face buffers so each facet has crisp, independent normals,
 * producing razor-sharp optical refractions and brilliant specular dispersion.
 */

import * as THREE from "three";
import { DiamondShape } from "./types";

// Cache geometries by shape to prevent redundant allocation
const geometryCache = new Map<DiamondShape, THREE.BufferGeometry>();

/** Helper to push a triangle into vertex buffer */
function addTriangle(
  arr: number[],
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3
) {
  arr.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
}

/** Helper to push a planar quad (as 2 triangles) into vertex buffer */
function addQuad(
  arr: number[],
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  p4: THREE.Vector3
) {
  addTriangle(arr, p1, p2, p3);
  addTriangle(arr, p1, p3, p4);
}

// ---------------------------------------------------------------------------
// 1. ROUND BRILLIANT CUT (57 Facets)
// ---------------------------------------------------------------------------
export function buildRoundDiamond(): THREE.BufferGeometry {
  const vertices: number[] = [];
  const segments = 16;
  const radius = 1.0;

  const tableY = 0.36;
  const tableR = 0.58 * radius;
  const crownMidY = 0.20;
  const crownMidR = 0.84 * radius;
  const girdleUpperY = 0.02;
  const girdleLowerY = -0.04;
  const girdleR = radius;
  const pavMidY = -0.38;
  const pavMidR = 0.54 * radius;
  const culetY = -0.74;

  const tableCenter = new THREE.Vector3(0, tableY, 0);
  const culet = new THREE.Vector3(0, culetY, 0);

  const getRingPts = (r: number, y: number, count: number, offsetAngle = 0) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + offsetAngle;
      pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
    }
    return pts;
  };

  const tablePts = getRingPts(tableR, tableY, 8);
  const crownMidPts = getRingPts(crownMidR, crownMidY, segments, Math.PI / 16);
  const girdleUpPts = getRingPts(girdleR, girdleUpperY, segments);
  const girdleLowPts = getRingPts(girdleR, girdleLowerY, segments);
  const pavMidPts = getRingPts(pavMidR, pavMidY, segments, Math.PI / 16);

  // Table Facet (Octagon center)
  for (let i = 0; i < 8; i++) {
    const next = (i + 1) % 8;
    addTriangle(vertices, tableCenter, tablePts[next], tablePts[i]);
  }

  // Star & Kite Crown Facets
  for (let i = 0; i < 8; i++) {
    const next = (i + 1) % 8;
    const mid1 = crownMidPts[i * 2];
    const mid2 = crownMidPts[i * 2 + 1];
    const midNext = crownMidPts[(i * 2 + 2) % segments];

    addTriangle(vertices, tablePts[i], mid1, tablePts[next]);
    addTriangle(vertices, tablePts[i], mid2, mid1);
    addTriangle(vertices, tablePts[next], midNext, mid2);
  }

  // Upper Girdle Triangles
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addQuad(vertices, crownMidPts[i], crownMidPts[next], girdleUpPts[next], girdleUpPts[i]);
  }

  // Girdle Strip
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addQuad(vertices, girdleUpPts[i], girdleUpPts[next], girdleLowPts[next], girdleLowPts[i]);
  }

  // Lower Girdle Facets
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addQuad(vertices, girdleLowPts[i], girdleLowPts[next], pavMidPts[next], pavMidPts[i]);
  }

  // Pavilion Mains to Culet
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addTriangle(vertices, pavMidPts[i], pavMidPts[next], culet);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// 2. OVAL BRILLIANT CUT
// ---------------------------------------------------------------------------
export function buildOvalDiamond(): THREE.BufferGeometry {
  const geo = buildRoundDiamond();
  // Elongate along Z axis by 1.42x to create authentic oval proportion
  geo.scale(0.92, 1.0, 1.38);
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// 3. PRINCESS CUT (Square Inverted Pyramid)
// ---------------------------------------------------------------------------
export function buildPrincessDiamond(): THREE.BufferGeometry {
  const vertices: number[] = [];
  const s = 0.96;
  const tableY = 0.38;
  const girdleUpY = 0.02;
  const girdleLowY = -0.04;
  const culetY = -0.74;

  const t = 0.65 * s;
  const g = 1.0 * s;

  const table = [
    new THREE.Vector3(t, tableY, t),
    new THREE.Vector3(t, tableY, -t),
    new THREE.Vector3(-t, tableY, -t),
    new THREE.Vector3(-t, tableY, t),
  ];
  const girdleUp = [
    new THREE.Vector3(g, girdleUpY, g),
    new THREE.Vector3(g, girdleUpY, -g),
    new THREE.Vector3(-g, girdleUpY, -g),
    new THREE.Vector3(-g, girdleUpY, g),
  ];
  const girdleLow = [
    new THREE.Vector3(g, girdleLowY, g),
    new THREE.Vector3(g, girdleLowY, -g),
    new THREE.Vector3(-g, girdleLowY, -g),
    new THREE.Vector3(-g, girdleLowY, g),
  ];
  const culet = new THREE.Vector3(0, culetY, 0);

  // Table
  addQuad(vertices, table[0], table[1], table[2], table[3]);

  // Crown Facets
  for (let i = 0; i < 4; i++) {
    const next = (i + 1) % 4;
    addQuad(vertices, table[i], table[next], girdleUp[next], girdleUp[i]);
  }

  // Girdle
  for (let i = 0; i < 4; i++) {
    const next = (i + 1) % 4;
    addQuad(vertices, girdleUp[i], girdleUp[next], girdleLow[next], girdleLow[i]);
  }

  // Pavilion Chevrons
  for (let i = 0; i < 4; i++) {
    const next = (i + 1) % 4;
    addTriangle(vertices, girdleLow[i], girdleLow[next], culet);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// 4. EMERALD / ASSCHER CUT (Step-Cut Rectangular Octagon)
// ---------------------------------------------------------------------------
export function buildEmeraldDiamond(isSquare = false): THREE.BufferGeometry {
  const vertices: number[] = [];
  const lenX = isSquare ? 1.05 : 0.92;
  const lenZ = isSquare ? 1.05 : 1.36;
  const corner = 0.25;

  const makeOctagon = (sx: number, sz: number, y: number) => {
    const x = (lenX * sx) / 2;
    const z = (lenZ * sz) / 2;
    const c = corner * Math.min(sx, sz);
    return [
      new THREE.Vector3(x - c, y, z),
      new THREE.Vector3(x, y, z - c),
      new THREE.Vector3(x, y, -z + c),
      new THREE.Vector3(x - c, y, -z),
      new THREE.Vector3(-x + c, y, -z),
      new THREE.Vector3(-x, y, -z + c),
      new THREE.Vector3(-x, y, z - c),
      new THREE.Vector3(-x + c, y, z),
    ];
  };

  const tableY = 0.38;
  const crownMidY = 0.20;
  const girdleUpY = 0.02;
  const girdleLowY = -0.04;
  const pavMidY = -0.38;
  const culetY = -0.72;

  const table = makeOctagon(0.68, 0.68, tableY);
  const crownMid = makeOctagon(0.85, 0.85, crownMidY);
  const girdleUp = makeOctagon(1.0, 1.0, girdleUpY);
  const girdleLow = makeOctagon(1.0, 1.0, girdleLowY);
  const pavMid = makeOctagon(0.56, 0.56, pavMidY);

  const keelX = isSquare ? 0 : 0.16;
  const culet1 = new THREE.Vector3(keelX, culetY, 0);
  const culet2 = new THREE.Vector3(-keelX, culetY, 0);

  // Table
  const tableCenter = new THREE.Vector3(0, tableY, 0);
  for (let i = 0; i < 8; i++) {
    const next = (i + 1) % 8;
    addTriangle(vertices, tableCenter, table[next], table[i]);
  }

  // Crown Steps
  for (let i = 0; i < 8; i++) {
    const next = (i + 1) % 8;
    addQuad(vertices, table[i], table[next], crownMid[next], crownMid[i]);
    addQuad(vertices, crownMid[i], crownMid[next], girdleUp[next], girdleUp[i]);
  }

  // Girdle
  for (let i = 0; i < 8; i++) {
    const next = (i + 1) % 8;
    addQuad(vertices, girdleUp[i], girdleUp[next], girdleLow[next], girdleLow[i]);
  }

  // Pavilion Steps
  for (let i = 0; i < 8; i++) {
    const next = (i + 1) % 8;
    addQuad(vertices, girdleLow[i], girdleLow[next], pavMid[next], pavMid[i]);
    const targetCulet = i < 4 ? culet1 : culet2;
    addTriangle(vertices, pavMid[i], pavMid[next], targetCulet);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// 5. CUSHION CUT (Pillow Contour)
// ---------------------------------------------------------------------------
export function buildCushionDiamond(): THREE.BufferGeometry {
  const vertices: number[] = [];
  const segments = 16;
  const radius = 1.0;

  const tableY = 0.36;
  const girdleUpY = 0.02;
  const girdleLowY = -0.04;
  const culetY = -0.74;

  const getPillowPoint = (angle: number, r: number, y: number) => {
    // Superellipse squaring factor (n = 3.2 gives gentle cushion corners)
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const sX = Math.sign(cosA) * Math.pow(Math.abs(cosA), 2 / 3.2) * r * 1.02;
    const sZ = Math.sign(sinA) * Math.pow(Math.abs(sinA), 2 / 3.2) * r * 1.08;
    return new THREE.Vector3(sX, y, sZ);
  };

  const tablePts: THREE.Vector3[] = [];
  const girdleUpPts: THREE.Vector3[] = [];
  const girdleLowPts: THREE.Vector3[] = [];

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    tablePts.push(getPillowPoint(angle, 0.60 * radius, tableY));
    girdleUpPts.push(getPillowPoint(angle, radius, girdleUpY));
    girdleLowPts.push(getPillowPoint(angle, radius, girdleLowY));
  }

  const culet = new THREE.Vector3(0, culetY, 0);
  const tableCenter = new THREE.Vector3(0, tableY, 0);

  // Table
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addTriangle(vertices, tableCenter, tablePts[next], tablePts[i]);
  }

  // Crown
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addQuad(vertices, tablePts[i], tablePts[next], girdleUpPts[next], girdleUpPts[i]);
  }

  // Girdle
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addQuad(vertices, girdleUpPts[i], girdleUpPts[next], girdleLowPts[next], girdleLowPts[i]);
  }

  // Pavilion
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addTriangle(vertices, girdleLowPts[i], girdleLowPts[next], culet);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// 6. PEAR CUT (Teardrop Cut)
// ---------------------------------------------------------------------------
export function buildPearDiamond(): THREE.BufferGeometry {
  const vertices: number[] = [];
  const segments = 16;
  const tableY = 0.36;
  const girdleUpY = 0.02;
  const girdleLowY = -0.04;
  const culetY = -0.72;

  const getPearPoint = (angle: number, scale: number, y: number) => {
    // Teardrop polar equation
    const theta = angle - Math.PI / 2;
    const r = (1.0 - 0.38 * Math.sin(theta)) * scale;
    const x = Math.cos(theta) * r * 0.88;
    const z = (Math.sin(theta) * r + 0.2) * 1.25;
    return new THREE.Vector3(x, y, z);
  };

  const tablePts: THREE.Vector3[] = [];
  const girdleUpPts: THREE.Vector3[] = [];
  const girdleLowPts: THREE.Vector3[] = [];

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    tablePts.push(getPearPoint(angle, 0.58, tableY));
    girdleUpPts.push(getPearPoint(angle, 1.0, girdleUpY));
    girdleLowPts.push(getPearPoint(angle, 1.0, girdleLowY));
  }

  const culet = new THREE.Vector3(0, culetY, 0.12);
  const tableCenter = new THREE.Vector3(0, tableY, 0.05);

  // Table
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addTriangle(vertices, tableCenter, tablePts[next], tablePts[i]);
  }

  // Crown
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addQuad(vertices, tablePts[i], tablePts[next], girdleUpPts[next], girdleUpPts[i]);
  }

  // Girdle
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addQuad(vertices, girdleUpPts[i], girdleUpPts[next], girdleLowPts[next], girdleLowPts[i]);
  }

  // Pavilion
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    addTriangle(vertices, girdleLowPts[i], girdleLowPts[next], culet);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// 7. MARQUISE CUT (Navette Cut)
// ---------------------------------------------------------------------------
export function buildMarquiseDiamond(): THREE.BufferGeometry {
  const geo = buildRoundDiamond();
  // Double-tapered navette transformation
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    // Pinch along X toward the tips of Z
    const taper = Math.max(0.18, 1.0 - Math.pow(Math.abs(z), 1.6) * 0.55);
    pos.setX(i, x * taper * 0.75);
    pos.setZ(i, z * 1.55);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------------------
// Unified Diamond Factory
// ---------------------------------------------------------------------------
export function getDiamondGeometry(shape: DiamondShape): THREE.BufferGeometry {
  if (geometryCache.has(shape)) {
    return geometryCache.get(shape)!;
  }

  let geo: THREE.BufferGeometry;
  switch (shape) {
    case "oval":
      geo = buildOvalDiamond();
      break;
    case "princess":
      geo = buildPrincessDiamond();
      break;
    case "emerald":
      geo = buildEmeraldDiamond(false);
      break;
    case "asscher":
      geo = buildEmeraldDiamond(true);
      break;
    case "radiant":
      geo = buildEmeraldDiamond(false);
      break;
    case "cushion":
      geo = buildCushionDiamond();
      break;
    case "pear":
      geo = buildPearDiamond();
      break;
    case "marquise":
      geo = buildMarquiseDiamond();
      break;
    case "round":
    default:
      geo = buildRoundDiamond();
      break;
  }

  geometryCache.set(shape, geo);
  return geo;
}
