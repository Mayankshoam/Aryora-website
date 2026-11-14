import * as THREE from 'three';
import { DiamondShape, getGemDimensionsMm } from './types';

/**
 * Procedural 3D Faceted Diamond Geometries for fine jewelry CAD
 * Generates true planar facets with unindexed vertex normals for authentic
 * total internal reflection (TIR), sharp facet brilliance, and spectral dispersion.
 *
 * Geometric Coordinate Standard:
 * - X-axis: Width across the ring band
 * - Z-axis: Length along the finger (North-South orientation)
 * - Y-axis: Vertical height (girdle at y = 0, crown at y > 0, pavilion at y < 0)
 */

type Vec3 = [number, number, number];

class GeometryBuilder {
  private positions: number[] = [];

  addTriangle(p1: Vec3, p2: Vec3, p3: Vec3) {
    this.positions.push(...p1, ...p2, ...p3);
  }

  addQuad(p1: Vec3, p2: Vec3, p3: Vec3, p4: Vec3) {
    this.positions.push(...p1, ...p2, ...p3);
    this.positions.push(...p1, ...p3, ...p4);
  }

  addFan(center: Vec3, loop: Vec3[]) {
    const n = loop.length;
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      this.addTriangle(center, loop[i], loop[next]);
    }
  }

  addPolygonStrip(loop1: Vec3[], loop2: Vec3[]) {
    const n = Math.min(loop1.length, loop2.length);
    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      this.addQuad(loop1[i], loop2[i], loop2[next], loop1[next]);
    }
  }

  build(): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
    geo.computeVertexNormals();
    return geo;
  }
}

/**
 * 1. ROUND BRILLIANT (Tolkowsky Standard 57 Facets)
 */
function buildRoundBrilliant(radius: number, depth: number): THREE.BufferGeometry {
  const b = new GeometryBuilder();
  const crownHeight = depth * 0.32;
  const pavilionDepth = depth * 0.64;
  const girdleThickness = depth * 0.04;
  const tableRadius = radius * 0.56;
  const starRadius = radius * 0.78;

  // 1. Table Octagon (8 vertices at crown top)
  const tableVerts: Vec3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    tableVerts.push([Math.sin(a) * tableRadius, crownHeight, Math.cos(a) * tableRadius]);
  }
  b.addFan([0, crownHeight, 0], tableVerts);

  // 2. Star Vertices (8 vertices at mid-crown between table facets)
  const starVerts: Vec3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    starVerts.push([Math.sin(a) * starRadius, crownHeight * 0.45, Math.cos(a) * starRadius]);
  }

  // 3. Girdle Vertices (16 vertices at y = 0 and y = -girdleThickness)
  const girdleTop: Vec3[] = [];
  const girdleBot: Vec3[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    girdleTop.push([Math.sin(a) * radius, 0, Math.cos(a) * radius]);
    girdleBot.push([Math.sin(a) * radius, -girdleThickness, Math.cos(a) * radius]);
  }

  // 4. Crown Faceting: 8 Star Triangles, 8 Kite Bezel Facets, 16 Upper Girdle Triangles
  for (let i = 0; i < 8; i++) {
    const tNext = (i + 1) % 8;
    const star = starVerts[i];
    b.addTriangle(tableVerts[i], tableVerts[tNext], star);

    const sPrev = starVerts[(i + 7) % 8];
    const gKite = girdleTop[2 * i];
    b.addTriangle(tableVerts[i], sPrev, gKite);
    b.addTriangle(tableVerts[i], gKite, star);

    const gNext = girdleTop[2 * i + 1];
    const gNext2 = girdleTop[(2 * i + 2) % 16];
    b.addTriangle(star, gKite, gNext);
    b.addTriangle(star, gNext, gNext2);
  }

  // 5. Girdle Band
  b.addPolygonStrip(girdleTop, girdleBot);

  // 6. Pavilion: 8 Pavilion Mains + 16 Lower Girdle Facets + Culet
  const culet: Vec3 = [0, -pavilionDepth - girdleThickness, 0];
  const pavilionMid: Vec3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + Math.PI / 8;
    pavilionMid.push([
      Math.sin(a) * radius * 0.55,
      -girdleThickness - pavilionDepth * 0.45,
      Math.cos(a) * radius * 0.55,
    ]);
  }

  for (let i = 0; i < 8; i++) {
    const gLow1 = girdleBot[2 * i];
    const gLow2 = girdleBot[2 * i + 1];
    const gLow3 = girdleBot[(2 * i + 2) % 16];
    const pMid = pavilionMid[i];

    b.addTriangle(gLow1, pMid, gLow2);
    b.addTriangle(gLow2, pMid, gLow3);

    const pNextMid = pavilionMid[(i + 1) % 8];
    b.addTriangle(culet, pMid, gLow3);
    b.addTriangle(culet, gLow3, pNextMid);
  }

  return b.build();
}

/**
 * 2. PRINCESS CUT (Square Modified Brilliant)
 */
function buildPrincessCut(width: number, depth: number): THREE.BufferGeometry {
  const b = new GeometryBuilder();
  const halfW = width * 0.5;
  const crownH = depth * 0.30;
  const pavDepth = depth * 0.65;
  const gThick = depth * 0.05;
  const halfT = halfW * 0.60;

  // Crown Table (Flat square in X-Z)
  const t0: Vec3 = [-halfT, crownH, -halfT];
  const t1: Vec3 = [halfT, crownH, -halfT];
  const t2: Vec3 = [halfT, crownH, halfT];
  const t3: Vec3 = [-halfT, crownH, halfT];
  b.addQuad(t0, t1, t2, t3);

  // Girdle Outer Square
  const g0: Vec3 = [-halfW, 0, -halfW];
  const g1: Vec3 = [halfW, 0, -halfW];
  const g2: Vec3 = [halfW, 0, halfW];
  const g3: Vec3 = [-halfW, 0, halfW];

  const gb0: Vec3 = [-halfW, -gThick, -halfW];
  const gb1: Vec3 = [halfW, -gThick, -halfW];
  const gb2: Vec3 = [halfW, -gThick, halfW];
  const gb3: Vec3 = [-halfW, -gThick, halfW];

  // Mid-edge crown break points
  const m0: Vec3 = [0, crownH * 0.5, -halfW * 0.88];
  const m1: Vec3 = [halfW * 0.88, crownH * 0.5, 0];
  const m2: Vec3 = [0, crownH * 0.5, halfW * 0.88];
  const m3: Vec3 = [-halfW * 0.88, crownH * 0.5, 0];

  b.addTriangle(t0, t1, m0);
  b.addTriangle(m0, g0, t0);
  b.addTriangle(m0, t1, g1);

  b.addTriangle(t1, t2, m1);
  b.addTriangle(m1, g1, t1);
  b.addTriangle(m1, t2, g2);

  b.addTriangle(t2, t3, m2);
  b.addTriangle(m2, g2, t2);
  b.addTriangle(m2, t3, g3);

  b.addTriangle(t3, t0, m3);
  b.addTriangle(m3, g3, t3);
  b.addTriangle(m3, t0, g0);

  b.addQuad(g0, g1, gb1, gb0);
  b.addQuad(g1, g2, gb2, gb1);
  b.addQuad(g2, g3, gb3, gb2);
  b.addQuad(g3, g0, gb0, gb3);

  const culet: Vec3 = [0, -pavDepth - gThick, 0];
  const pm0: Vec3 = [0, -gThick - pavDepth * 0.45, -halfW * 0.45];
  const pm1: Vec3 = [halfW * 0.45, -gThick - pavDepth * 0.45, 0];
  const pm2: Vec3 = [0, -gThick - pavDepth * 0.45, halfW * 0.45];
  const pm3: Vec3 = [-halfW * 0.45, -gThick - pavDepth * 0.45, 0];

  b.addTriangle(gb0, gb1, pm0);
  b.addTriangle(gb1, pm0, pm1);
  b.addTriangle(gb1, gb2, pm1);
  b.addTriangle(gb2, pm1, pm2);
  b.addTriangle(gb2, gb3, pm2);
  b.addTriangle(gb3, pm2, pm3);
  b.addTriangle(gb3, gb0, pm3);
  b.addTriangle(gb0, pm3, pm0);

  b.addTriangle(culet, pm0, pm1);
  b.addTriangle(culet, pm1, pm2);
  b.addTriangle(culet, pm2, pm3);
  b.addTriangle(culet, pm3, pm0);

  return b.build();
}

/**
 * 3. EMERALD & ASSCHER CUT (Stepped Octagon)
 * Asscher: length = width (square)
 * Emerald: length > width (North-South along Z-axis)
 */
function buildStepCut(length: number, width: number, depth: number): THREE.BufferGeometry {
  const b = new GeometryBuilder();
  const crownH = depth * 0.32;
  const pavDepth = depth * 0.63;
  const gThick = depth * 0.05;

  // X is width (across band), Z is length (along finger)
  const hx = width * 0.5;
  const hz = length * 0.5;
  const chamfer = Math.min(hx, hz) * 0.28;

  function makeOctagon(cx: number, cz: number, ch: number, y: number): Vec3[] {
    return [
      [cx - ch, y, cz],
      [-cx + ch, y, cz],
      [-cx, y, cz - ch],
      [-cx, y, -cz + ch],
      [-cx + ch, y, -cz],
      [cx - ch, y, -cz],
      [cx, y, -cz + ch],
      [cx, y, cz - ch],
    ];
  }

  const table = makeOctagon(hx * 0.60, hz * 0.60, chamfer * 0.60, crownH);
  const step1 = makeOctagon(hx * 0.78, hz * 0.78, chamfer * 0.78, crownH * 0.60);
  const step2 = makeOctagon(hx * 0.92, hz * 0.92, chamfer * 0.92, crownH * 0.25);
  const girdleTop = makeOctagon(hx, hz, chamfer, 0);
  const girdleBot = makeOctagon(hx, hz, chamfer, -gThick);

  b.addFan([0, crownH, 0], table);
  b.addPolygonStrip(table, step1);
  b.addPolygonStrip(step1, step2);
  b.addPolygonStrip(step2, girdleTop);
  b.addPolygonStrip(girdleTop, girdleBot);

  const pStep1 = makeOctagon(hx * 0.80, hz * 0.80, chamfer * 0.80, -gThick - pavDepth * 0.25);
  const pStep2 = makeOctagon(hx * 0.55, hz * 0.55, chamfer * 0.55, -gThick - pavDepth * 0.55);
  const pStep3 = makeOctagon(hx * 0.30, hz * 0.30, chamfer * 0.30, -gThick - pavDepth * 0.80);

  b.addPolygonStrip(girdleBot, pStep1);
  b.addPolygonStrip(pStep1, pStep2);
  b.addPolygonStrip(pStep2, pStep3);

  const culetY = -gThick - pavDepth;
  const keelStart: Vec3 = [0, culetY, -hz * 0.25];
  const keelEnd: Vec3 = [0, culetY, hz * 0.25];

  for (let i = 0; i < 8; i++) {
    const next = (i + 1) % 8;
    const v1 = pStep3[i];
    const v2 = pStep3[next];
    const midZ = (v1[2] + v2[2]) / 2;
    const k = midZ > 0 ? keelEnd : keelStart;
    b.addTriangle(v1, v2, k);
  }
  b.addTriangle(keelStart, keelEnd, pStep3[0]);
  b.addTriangle(keelStart, keelEnd, pStep3[4]);

  return b.build();
}

/**
 * 4. CUSHION CUT (Superelliptical Pillow Brilliant)
 */
function buildCushionCut(length: number, width: number, depth: number): THREE.BufferGeometry {
  const b = new GeometryBuilder();
  const crownH = depth * 0.30;
  const pavDepth = depth * 0.65;
  const gThick = depth * 0.05;

  const rx = width * 0.5;
  const rz = length * 0.5;

  function getCushionPt(angle: number, scale: number, y: number): Vec3 {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const rSuper = 1 / Math.pow(Math.pow(Math.abs(cosA), 3.2) + Math.pow(Math.abs(sinA), 3.2), 1 / 3.2);
    return [sinA * rSuper * rx * scale, y, cosA * rSuper * rz * scale];
  }

  const segments = 16;
  const girdleTop: Vec3[] = [];
  const girdleBot: Vec3[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i * Math.PI * 2) / segments;
    girdleTop.push(getCushionPt(a, 1.0, 0));
    girdleBot.push(getCushionPt(a, 1.0, -gThick));
  }

  const tableVerts: Vec3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8 + Math.PI / 8;
    tableVerts.push(getCushionPt(a, 0.58, crownH));
  }
  b.addFan([0, crownH, 0], tableVerts);

  for (let i = 0; i < 8; i++) {
    const tNext = (i + 1) % 8;
    const gIdx1 = (i * 2) % 16;
    const gIdx2 = (i * 2 + 1) % 16;
    const gIdx3 = (i * 2 + 2) % 16;

    const tMid: Vec3 = [
      (tableVerts[i][0] + tableVerts[tNext][0]) * 0.5 * 1.3,
      crownH * 0.55,
      (tableVerts[i][2] + tableVerts[tNext][2]) * 0.5 * 1.3,
    ];

    b.addTriangle(tableVerts[i], tableVerts[tNext], tMid);
    b.addTriangle(tableVerts[i], tMid, girdleTop[gIdx1]);
    b.addTriangle(tMid, girdleTop[gIdx2], girdleTop[gIdx1]);
    b.addTriangle(tMid, girdleTop[gIdx3], girdleTop[gIdx2]);
  }

  b.addPolygonStrip(girdleTop, girdleBot);

  const culet: Vec3 = [0, -gThick - pavDepth, 0];
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    b.addTriangle(culet, girdleBot[i], girdleBot[next]);
  }

  return b.build();
}

/**
 * 5. RADIANT CUT (Cut-Corner Rectangle with Brilliant Facets)
 */
function buildRadiantCut(length: number, width: number, depth: number): THREE.BufferGeometry {
  const b = new GeometryBuilder();
  const crownH = depth * 0.30;
  const pavDepth = depth * 0.65;
  const gThick = depth * 0.05;

  const hx = width * 0.5;
  const hz = length * 0.5;
  const ch = Math.min(hx, hz) * 0.25;

  function makeOctagon(cx: number, cz: number, cCham: number, y: number): Vec3[] {
    return [
      [cx - cCham, y, cz],
      [-cx + cCham, y, cz],
      [-cx, y, cz - cCham],
      [-cx, y, -cz + cCham],
      [-cx + cCham, y, -cz],
      [cx - cCham, y, -cz],
      [cx, y, -cz + cCham],
      [cx, y, cz - cCham],
    ];
  }

  const table = makeOctagon(hx * 0.62, hz * 0.62, ch * 0.62, crownH);
  const girdleTop = makeOctagon(hx, hz, ch, 0);
  const girdleBot = makeOctagon(hx, hz, ch, -gThick);

  b.addFan([0, crownH, 0], table);

  for (let i = 0; i < 8; i++) {
    const next = (i + 1) % 8;
    const midStar: Vec3 = [
      (table[i][0] + table[next][0]) * 0.5 * 1.25,
      crownH * 0.48,
      (table[i][2] + table[next][2]) * 0.5 * 1.25,
    ];
    b.addTriangle(table[i], table[next], midStar);
    b.addTriangle(table[i], midStar, girdleTop[i]);
    b.addTriangle(midStar, girdleTop[next], girdleTop[i]);
  }

  b.addPolygonStrip(girdleTop, girdleBot);

  const culet: Vec3 = [0, -gThick - pavDepth, 0];
  for (let i = 0; i < 8; i++) {
    const next = (i + 1) % 8;
    b.addTriangle(culet, girdleBot[i], girdleBot[next]);
  }

  return b.build();
}

/**
 * 6. OVAL BRILLIANT (Elliptical 57-Facet Brilliant)
 */
function buildOvalBrilliant(length: number, width: number, depth: number): THREE.BufferGeometry {
  const b = new GeometryBuilder();
  const crownH = depth * 0.32;
  const pavDepth = depth * 0.63;
  const gThick = depth * 0.05;

  const rx = width * 0.5;
  const rz = length * 0.5;

  const n = 16;
  const girdleTop: Vec3[] = [];
  const girdleBot: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i * Math.PI * 2) / n;
    girdleTop.push([Math.sin(a) * rx, 0, Math.cos(a) * rz]);
    girdleBot.push([Math.sin(a) * rx, -gThick, Math.cos(a) * rz]);
  }

  const tableVerts: Vec3[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    tableVerts.push([Math.sin(a) * rx * 0.56, crownH, Math.cos(a) * rz * 0.56]);
  }
  b.addFan([0, crownH, 0], tableVerts);

  for (let i = 0; i < 8; i++) {
    const tNext = (i + 1) % 8;
    const g1 = (i * 2) % n;
    const g2 = (i * 2 + 1) % n;
    const g3 = (i * 2 + 2) % n;

    const midStar: Vec3 = [
      (tableVerts[i][0] + tableVerts[tNext][0]) * 0.5 * 1.3,
      crownH * 0.5,
      (tableVerts[i][2] + tableVerts[tNext][2]) * 0.5 * 1.3,
    ];

    b.addTriangle(tableVerts[i], tableVerts[tNext], midStar);
    b.addTriangle(tableVerts[i], midStar, girdleTop[g1]);
    b.addTriangle(midStar, girdleTop[g2], girdleTop[g1]);
    b.addTriangle(midStar, girdleTop[g3], girdleTop[g2]);
  }

  b.addPolygonStrip(girdleTop, girdleBot);

  const culet: Vec3 = [0, -gThick - pavDepth, 0];
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    b.addTriangle(culet, girdleBot[i], girdleBot[next]);
  }

  return b.build();
}

/**
 * 7. PEAR CUT (Teardrop Brilliant - Apex pointing along +Z)
 */
function buildPearCut(length: number, width: number, depth: number): THREE.BufferGeometry {
  const b = new GeometryBuilder();
  const crownH = depth * 0.31;
  const pavDepth = depth * 0.64;
  const gThick = depth * 0.05;

  const n = 16;
  function getPearPt(i: number, scale: number, y: number): Vec3 {
    const a = (i * Math.PI * 2) / n;
    const factor = 1 - 0.45 * Math.sin(a);
    const x = Math.cos(a) * (width * 0.5) * factor * scale;
    const z = Math.sin(a) * (length * 0.5) * scale;
    return [x, y, z];
  }

  const girdleTop: Vec3[] = [];
  const girdleBot: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    girdleTop.push(getPearPt(i, 1.0, 0));
    girdleBot.push(getPearPt(i, 1.0, -gThick));
  }

  const tableVerts: Vec3[] = [];
  for (let i = 0; i < 8; i++) {
    tableVerts.push(getPearPt(i * 2, 0.56, crownH));
  }
  b.addFan([0, crownH, 0], tableVerts);

  for (let i = 0; i < 8; i++) {
    const tNext = (i + 1) % 8;
    const g1 = (i * 2) % n;
    const g2 = (i * 2 + 1) % n;
    const g3 = (i * 2 + 2) % n;
    const starMid: Vec3 = [
      (tableVerts[i][0] + tableVerts[tNext][0]) * 0.5 * 1.3,
      crownH * 0.5,
      (tableVerts[i][2] + tableVerts[tNext][2]) * 0.5 * 1.3,
    ];
    b.addTriangle(tableVerts[i], tableVerts[tNext], starMid);
    b.addTriangle(tableVerts[i], starMid, girdleTop[g1]);
    b.addTriangle(starMid, girdleTop[g2], girdleTop[g1]);
    b.addTriangle(starMid, girdleTop[g3], girdleTop[g2]);
  }

  b.addPolygonStrip(girdleTop, girdleBot);

  const culet: Vec3 = [0, -gThick - pavDepth, -length * 0.06];
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    b.addTriangle(culet, girdleBot[i], girdleBot[next]);
  }

  return b.build();
}

/**
 * 8. MARQUISE CUT (Navette Double-Pointed Brilliant)
 */
function buildMarquiseCut(length: number, width: number, depth: number): THREE.BufferGeometry {
  const b = new GeometryBuilder();
  const crownH = depth * 0.30;
  const pavDepth = depth * 0.65;
  const gThick = depth * 0.05;

  const n = 16;
  function getMarquisePt(i: number, scale: number, y: number): Vec3 {
    const a = (i * Math.PI * 2) / n;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const x = cosA * Math.abs(cosA) * (width * 0.5) * scale;
    const z = sinA * (length * 0.5) * scale;
    return [x, y, z];
  }

  const girdleTop: Vec3[] = [];
  const girdleBot: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    girdleTop.push(getMarquisePt(i, 1.0, 0));
    girdleBot.push(getMarquisePt(i, 1.0, -gThick));
  }

  const tableVerts: Vec3[] = [];
  for (let i = 0; i < 8; i++) {
    tableVerts.push(getMarquisePt(i * 2, 0.55, crownH));
  }
  b.addFan([0, crownH, 0], tableVerts);

  for (let i = 0; i < 8; i++) {
    const tNext = (i + 1) % 8;
    const g1 = (i * 2) % n;
    const g2 = (i * 2 + 1) % n;
    const g3 = (i * 2 + 2) % n;
    const starMid: Vec3 = [
      (tableVerts[i][0] + tableVerts[tNext][0]) * 0.5 * 1.3,
      crownH * 0.5,
      (tableVerts[i][2] + tableVerts[tNext][2]) * 0.5 * 1.3,
    ];
    b.addTriangle(tableVerts[i], tableVerts[tNext], starMid);
    b.addTriangle(tableVerts[i], starMid, girdleTop[g1]);
    b.addTriangle(starMid, girdleTop[g2], girdleTop[g1]);
    b.addTriangle(starMid, girdleTop[g3], girdleTop[g2]);
  }

  b.addPolygonStrip(girdleTop, girdleBot);

  const culet: Vec3 = [0, -gThick - pavDepth, 0];
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    b.addTriangle(culet, girdleBot[i], girdleBot[next]);
  }

  return b.build();
}

/**
 * Master Factory: Creates true CAD faceted diamond geometry for any of the 9 cuts
 * scaled by Jewelcraft-calibrated millimeter dimensions.
 */
export function createDiamondGeometry(shape: DiamondShape, carat: number): THREE.BufferGeometry {
  const dims = getGemDimensionsMm(shape, carat);

  const l = dims.lengthMm * 0.1;
  const w = dims.widthMm * 0.1;
  const d = dims.depthMm * 0.1;
  const r = (w / 2);

  switch (shape) {
    case 'princess':
      return buildPrincessCut(w, d);

    case 'cushion':
      return buildCushionCut(l, w, d);

    case 'emerald':
      return buildStepCut(l, w, d);

    case 'asscher':
      return buildStepCut(w, w, d);

    case 'radiant':
      return buildRadiantCut(l, w, d);

    case 'oval':
      return buildOvalBrilliant(l, w, d);

    case 'pear':
      return buildPearCut(l, w, d);

    case 'marquise':
      return buildMarquiseCut(l, w, d);

    case 'round':
    default:
      return buildRoundBrilliant(r, d);
  }
}
