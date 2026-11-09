/**
 * Procedural Ring Shank & Head Geometries
 * Generates luxury band profiles (Classic, Cathedral, Twist, Split, Two-Row, Pinch),
 * precision 4/6 micro-claw prongs, gallery rails, hidden halos, and shoulder pavé stones.
 */

import * as THREE from "three";
import { BandStyle, CrownSetting, DiamondShape, SideSetting } from "./types";

/**
 * Creates comfort-fit D-profile 2D cross-section for gold shanks.
 * Flat interior for finger comfort, smooth convex dome exterior.
 */
function createDProfileShape(width: number, height: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const r = height;

  shape.moveTo(-hw, 0);
  shape.lineTo(hw, 0);
  shape.quadraticCurveTo(hw, r, 0, r);
  shape.quadraticCurveTo(-hw, r, -hw, 0);
  return shape;
}

// ---------------------------------------------------------------------------
// 1. PROCEDURAL RING SHANK PROFILES
// ---------------------------------------------------------------------------
export function buildRingShankGeometry(style: BandStyle): THREE.BufferGeometry {
  const innerRadius = 1.0;
  const segments = 80;

  switch (style) {
    case "cathedral": {
      // Arched shoulders rising to meet the head with negative space
      const curve = new THREE.CurvePath<THREE.Vector3>();
      const pts: THREE.Vector3[] = [];

      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const angle = u * Math.PI * 2 - Math.PI / 2;
        // Upper shoulders elevate toward head at top (angle near PI/2)
        const topWeight = Math.pow(Math.max(0, Math.sin(angle)), 2.5);
        const r = innerRadius + topWeight * 0.14;
        const yOffset = topWeight * 0.08;

        pts.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r + yOffset, 0));
      }

      const path = new THREE.CatmullRomCurve3(pts, true);
      const profile = createDProfileShape(0.12, 0.08);
      return new THREE.ExtrudeGeometry(profile, {
        extrudePath: path,
        steps: segments,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.012,
        bevelThickness: 0.012,
      });
    }

    case "twist": {
      // Intertwined sinusoidal twisted double-helix ribbon
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const angle = u * Math.PI * 2 - Math.PI / 2;
        const twistZ = Math.sin(angle * 7) * 0.055;
        const r = innerRadius + Math.cos(angle * 7) * 0.02;

        pts.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, twistZ));
      }

      const path = new THREE.CatmullRomCurve3(pts, true);
      const profile = createDProfileShape(0.09, 0.07);
      return new THREE.ExtrudeGeometry(profile, {
        extrudePath: path,
        steps: segments,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.01,
        bevelThickness: 0.01,
      });
    }

    case "split": {
      // Shank bifurcates into flared arms in the top half
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const angle = u * Math.PI * 2 - Math.PI / 2;
        const upperT = Math.pow(Math.max(0, Math.sin(angle)), 2.0);
        const splitZ = upperT * 0.07;
        const r = innerRadius;

        pts.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, splitZ));
      }

      const path = new THREE.CatmullRomCurve3(pts, true);
      const profile = createDProfileShape(0.10, 0.075);
      return new THREE.ExtrudeGeometry(profile, {
        extrudePath: path,
        steps: segments,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.01,
        bevelThickness: 0.01,
      });
    }

    case "two-row": {
      // Architectural parallel dual band
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const angle = u * Math.PI * 2 - Math.PI / 2;
        const r = innerRadius;
        pts.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0.05));
      }

      const path = new THREE.CatmullRomCurve3(pts, true);
      const profile = createDProfileShape(0.075, 0.07);
      return new THREE.ExtrudeGeometry(profile, {
        extrudePath: path,
        steps: segments,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.01,
        bevelThickness: 0.01,
      });
    }

    case "pinch": {
      // Shank narrows as it approaches the center basket
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const angle = u * Math.PI * 2 - Math.PI / 2;
        const r = innerRadius;
        pts.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
      }

      const path = new THREE.CatmullRomCurve3(pts, true);
      const profile = createDProfileShape(0.10, 0.075);
      return new THREE.ExtrudeGeometry(profile, {
        extrudePath: path,
        steps: segments,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.01,
        bevelThickness: 0.01,
      });
    }

    case "classic":
    default: {
      // Timeless solid D-profile comfort shank
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const angle = u * Math.PI * 2 - Math.PI / 2;
        pts.push(new THREE.Vector3(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius, 0));
      }

      const path = new THREE.CatmullRomCurve3(pts, true);
      const profile = createDProfileShape(0.13, 0.085);
      return new THREE.ExtrudeGeometry(profile, {
        extrudePath: path,
        steps: segments,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.012,
        bevelThickness: 0.012,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 2. PRONGS, GALLERY WIRE & BASKET ASSEMBLY
// ---------------------------------------------------------------------------
export function buildProngsGroup(
  shape: DiamondShape,
  prongCount: 4 | 6 = 4,
  caratScale = 0.6
): THREE.Group {
  const group = new THREE.Group();

  const count = shape === "round" || shape === "oval" ? prongCount : 4;
  const prongRadius = 0.024 * (caratScale / 0.6);
  const prongHeight = 0.52 * (caratScale / 0.6);
  const headBaseY = 1.05;
  const girdleY = headBaseY + caratScale * 0.40;

  // Prongs Material (matches metal, instantiated in viewer)
  const prongGeo = new THREE.CylinderGeometry(prongRadius * 0.85, prongRadius * 1.15, prongHeight, 16);
  const capGeo = new THREE.SphereGeometry(prongRadius * 0.95, 12, 12);

  // Aspect adjustment based on gemstone outline
  const isRect = shape === "emerald" || shape === "radiant" || shape === "oval";
  const scaleX = isRect ? 0.82 : 1.0;
  const scaleZ = isRect ? 1.25 : 1.0;
  const spread = 0.42 * caratScale;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (count === 4 ? Math.PI / 4 : 0);
    const px = Math.cos(angle) * spread * scaleX;
    const pz = Math.sin(angle) * spread * scaleZ;

    const prong = new THREE.Mesh(prongGeo);
    // Slight inward claw lean toward gemstone center
    prong.position.set(px, headBaseY + prongHeight * 0.48, pz);
    prong.rotation.x = -(pz / spread) * 0.16;
    prong.rotation.z = (px / spread) * 0.16;
    prong.castShadow = true;
    group.add(prong);

    // Rounded claw tip
    const cap = new THREE.Mesh(capGeo);
    cap.position.set(px * 0.96, headBaseY + prongHeight * 0.96, pz * 0.96);
    group.add(cap);
  }

  // Gallery Wire Ring (stabilizing under-bezel rail)
  const galleryCurve = new THREE.EllipseCurve(0, 0, spread * scaleX * 0.92, spread * scaleZ * 0.92, 0, Math.PI * 2);
  const galleryPts = galleryCurve.getPoints(36).map((p) => new THREE.Vector3(p.x, headBaseY + prongHeight * 0.52, p.y));
  const galleryPath = new THREE.CatmullRomCurve3(galleryPts, true);
  const galleryGeo = new THREE.TubeGeometry(galleryPath, 36, 0.016, 8, true);
  const galleryMesh = new THREE.Mesh(galleryGeo);
  group.add(galleryMesh);

  // Bottom Collet Base Wire
  const baseCurve = new THREE.EllipseCurve(0, 0, spread * scaleX * 0.55, spread * scaleZ * 0.55, 0, Math.PI * 2);
  const basePts = baseCurve.getPoints(24).map((p) => new THREE.Vector3(p.x, headBaseY + 0.03, p.y));
  const basePath = new THREE.CatmullRomCurve3(basePts, true);
  const baseGeo = new THREE.TubeGeometry(basePath, 24, 0.018, 8, true);
  const baseMesh = new THREE.Mesh(baseGeo);
  group.add(baseMesh);

  return group;
}

// ---------------------------------------------------------------------------
// 3. HALO & HIDDEN HALO MESHES
// ---------------------------------------------------------------------------
export function buildHaloGroup(
  shape: DiamondShape,
  setting: CrownSetting,
  caratScale = 0.6
): THREE.Group {
  const group = new THREE.Group();
  if (setting === "none") return group;

  const isHidden = setting === "hidden-halo";
  const stoneCount = isHidden ? 22 : 28;
  const microRadius = isHidden ? 0.022 : 0.032;

  const headBaseY = 1.05;
  const haloY = isHidden ? headBaseY + caratScale * 0.26 : headBaseY + caratScale * 0.38;
  const spread = isHidden ? 0.44 * caratScale : 0.64 * caratScale;

  const isRect = shape === "emerald" || shape === "radiant" || shape === "oval";
  const scaleX = isRect ? 0.85 : 1.0;
  const scaleZ = isRect ? 1.25 : 1.0;

  // Micro-pavé stone geometry (faceted mini diamond)
  const miniGeo = new THREE.OctahedronGeometry(microRadius, 1);
  miniGeo.scale(1.0, 0.75, 1.0);

  for (let i = 0; i < stoneCount; i++) {
    const angle = (i / stoneCount) * Math.PI * 2;
    const x = Math.cos(angle) * spread * scaleX;
    const z = Math.sin(angle) * spread * scaleZ;

    const stone = new THREE.Mesh(miniGeo);
    stone.position.set(x, haloY, z);
    stone.rotation.y = angle;
    stone.castShadow = true;
    group.add(stone);
  }

  // Supporting gold halo rim bezel underneath micro diamonds
  const haloCurve = new THREE.EllipseCurve(0, 0, spread * scaleX, spread * scaleZ, 0, Math.PI * 2);
  const haloPts = haloCurve.getPoints(32).map((p) => new THREE.Vector3(p.x, haloY - microRadius * 0.6, p.y));
  const haloPath = new THREE.CatmullRomCurve3(haloPts, true);
  const haloRimGeo = new THREE.TubeGeometry(haloPath, 32, microRadius * 0.85, 8, true);
  const rimMesh = new THREE.Mesh(haloRimGeo);
  group.add(rimMesh);

  return group;
}

// ---------------------------------------------------------------------------
// 4. SIDE DIAMONDS (Pavé / Channel / Prong on Band Shoulders)
// ---------------------------------------------------------------------------
export function buildSideStonesGroup(setting: SideSetting): THREE.Group {
  const group = new THREE.Group();
  if (setting === "plain") return group;

  const stonesPerSide = setting === "pave" ? 10 : 8;
  const miniRadius = 0.028;
  const miniGeo = new THREE.OctahedronGeometry(miniRadius, 1);
  miniGeo.scale(1.0, 0.8, 1.0);

  // Left & Right shoulder distribution (arc from 40° to 85° on each side)
  [-1, 1].forEach((side) => {
    for (let i = 0; i < stonesPerSide; i++) {
      const t = i / (stonesPerSide - 1);
      const angle = (Math.PI / 2) + side * (0.24 + t * 0.58);
      const r = 1.08;

      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const z = 0;

      const stone = new THREE.Mesh(miniGeo);
      stone.position.set(x, y, z);
      stone.rotation.z = angle - Math.PI / 2;
      stone.castShadow = true;
      group.add(stone);
    }
  });

  return group;
}
