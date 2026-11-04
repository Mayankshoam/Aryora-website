"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ShieldCheck, Sparkles, RotateCw, ZoomIn, Info } from "lucide-react";

// Precious Metal Physical Shader Values
export const METAL_PROPERTIES: Record<
  string,
  { color: number; metalness: number; roughness: number; label: string; hex: string }
> = {
  YELLOW_GOLD: {
    color: 0xecd078,
    metalness: 0.98,
    roughness: 0.12,
    label: "Yellow Gold",
    hex: "#ECD078",
  },
  WHITE_GOLD: {
    color: 0xf2f4f8,
    metalness: 1.0,
    roughness: 0.08,
    label: "White Gold",
    hex: "#E5E8EB",
  },
  ROSE_GOLD: {
    color: 0xe8ad96,
    metalness: 0.98,
    roughness: 0.14,
    label: "Rose Gold",
    hex: "#E8AD96",
  },
  CHAMPAGNE_GOLD: {
    color: 0xdec6a5,
    metalness: 0.98,
    roughness: 0.13,
    label: "Champagne Gold",
    hex: "#DEC6A5",
  },
  SILVER_925: {
    color: 0xe5e8ec,
    metalness: 0.96,
    roughness: 0.11,
    label: "925 Sterling Silver",
    hex: "#D9DEE3",
  },
};

// Carat scale factors for 3D stage
export const CARAT_SCALES: Record<string, { scale: number; num: number; mm: string }> = {
  "0.50 Carat": { scale: 0.40, num: 0.50, mm: "5.1 × 5.1 mm" },
  "0.75 Carat": { scale: 0.46, num: 0.75, mm: "5.8 × 5.8 mm" },
  "1.00 Carat": { scale: 0.52, num: 1.00, mm: "6.5 × 6.5 mm" },
  "1.50 Carat": { scale: 0.60, num: 1.50, mm: "7.4 × 7.4 mm" },
  "2.00 Carat": { scale: 0.68, num: 2.00, mm: "8.1 × 8.1 mm" },
  "3.00 Carat": { scale: 0.78, num: 3.00, mm: "9.2 × 9.2 mm" },
};

/**
 * Creates high-contrast studio environment map with softboxes, lateral strip reflections,
 * and neutral warm studio ambiance. Makes polished gold and platinum mirror authentic studio lights.
 */
function createStudioEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // 1. Studio ambient background (dark neutral graphite)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, "#222528");
  bgGrad.addColorStop(0.5, "#121416");
  bgGrad.addColorStop(1, "#0a0c0e");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // 2. Main overhead softbox (bright warm white)
  const topSoftbox = ctx.createRadialGradient(512, 100, 10, 512, 100, 260);
  topSoftbox.addColorStop(0, "#ffffff");
  topSoftbox.addColorStop(0.35, "#fffaf0");
  topSoftbox.addColorStop(0.8, "rgba(255, 245, 230, 0.5)");
  topSoftbox.addColorStop(1, "rgba(34, 37, 40, 0)");
  ctx.fillStyle = topSoftbox;
  ctx.fillRect(0, 0, 1024, 280);

  // 3. Left vertical strip softbox (bright white reflection edge for metallic rims)
  const leftStrip = ctx.createLinearGradient(120, 0, 240, 0);
  leftStrip.addColorStop(0, "rgba(255,255,255,0)");
  leftStrip.addColorStop(0.5, "#ffffff");
  leftStrip.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = leftStrip;
  ctx.fillRect(120, 60, 120, 380);

  // 4. Right vertical strip softbox (soft secondary specular rim)
  const rightStrip = ctx.createLinearGradient(780, 0, 900, 0);
  rightStrip.addColorStop(0, "rgba(255,255,255,0)");
  rightStrip.addColorStop(0.5, "#f4f6fa");
  rightStrip.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rightStrip;
  ctx.fillRect(780, 60, 120, 380);

  // 5. Floor warm ground bounce reflection
  const floorBounce = ctx.createLinearGradient(0, 410, 0, 512);
  floorBounce.addColorStop(0, "rgba(0,0,0,0)");
  floorBounce.addColorStop(1, "rgba(240, 225, 200, 0.4)");
  ctx.fillStyle = floorBounce;
  ctx.fillRect(0, 410, 1024, 102);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const renderTarget = pmremGenerator.fromEquirectangular(texture);
  texture.dispose();
  pmremGenerator.dispose();

  return renderTarget.texture;
}

/**
 * Builds faceted diamond geometry with crisp planar facets and correct pavilion convergence.
 * Non-indexed triangle buffers ensure each face has independent sharp surface normals that sparkle.
 */
function buildFacetedDiamond(shape: string): THREE.BufferGeometry {
  const norm = shape.toLowerCase();
  const vertices: number[] = [];

  const addTri = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3) => {
    vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
  };

  const addQuad = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3) => {
    addTri(p1, p2, p3);
    addTri(p1, p3, p4);
  };

  // 1. EMERALD / RADIANT / ASSCHER: Step-cut rectangular octagon
  if (norm.includes("emerald") || norm.includes("asscher") || norm.includes("radiant")) {
    const isSquare = norm.includes("asscher");
    const lenX = isSquare ? 1.05 : 0.95;
    const lenZ = isSquare ? 1.05 : 1.38;
    const corner = 0.26;

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
    const girdleUpperY = 0.02;
    const girdleLowerY = -0.04;
    const pavilionMidY = -0.38;
    const culetY = -0.72;

    const table = makeOctagon(0.68, 0.68, tableY);
    const crownMid = makeOctagon(0.85, 0.85, crownMidY);
    const girdleUp = makeOctagon(1.0, 1.0, girdleUpperY);
    const girdleLow = makeOctagon(1.0, 1.0, girdleLowerY);
    const pavMid = makeOctagon(0.56, 0.56, pavilionMidY);

    const culet1 = new THREE.Vector3(isSquare ? 0 : 0.16, culetY, 0);
    const culet2 = new THREE.Vector3(isSquare ? 0 : -0.16, culetY, 0);

    // Table facet
    const tableCenter = new THREE.Vector3(0, tableY, 0);
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      addTri(tableCenter, table[next], table[i]);
    }
    // Crown steps
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      addQuad(table[i], table[next], crownMid[next], crownMid[i]);
    }
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      addQuad(crownMid[i], crownMid[next], girdleUp[next], girdleUp[i]);
    }
    // Girdle band
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      addQuad(girdleUp[i], girdleUp[next], girdleLow[next], girdleLow[i]);
    }
    // Pavilion steps
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      addQuad(girdleLow[i], girdleLow[next], pavMid[next], pavMid[i]);
    }
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      const targetCulet = i < 4 ? culet1 : culet2;
      addTri(pavMid[i], pavMid[next], targetCulet);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }

  // 2. PRINCESS CUT: Square inverted pyramid with chevron pavilion facets
  if (norm.includes("princess")) {
    const s = 0.95;
    const tableY = 0.38;
    const girdleUpY = 0.02;
    const girdleLowY = -0.04;
    const culetY = -0.74;

    const t = 0.65 * s;
    const g = 1.0 * s;

    const tablePts = [
      new THREE.Vector3(t, tableY, t),
      new THREE.Vector3(t, tableY, -t),
      new THREE.Vector3(-t, tableY, -t),
      new THREE.Vector3(-t, tableY, t),
    ];
    const girdleUpPts = [
      new THREE.Vector3(g, girdleUpY, g),
      new THREE.Vector3(g, girdleUpY, -g),
      new THREE.Vector3(-g, girdleUpY, -g),
      new THREE.Vector3(-g, girdleUpY, g),
    ];
    const girdleLowPts = [
      new THREE.Vector3(g, girdleLowY, g),
      new THREE.Vector3(g, girdleLowY, -g),
      new THREE.Vector3(-g, girdleLowY, -g),
      new THREE.Vector3(-g, girdleLowY, g),
    ];
    const culetPt = new THREE.Vector3(0, culetY, 0);

    // Table
    addQuad(tablePts[0], tablePts[1], tablePts[2], tablePts[3]);

    // Crown facets
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      addQuad(tablePts[i], tablePts[next], girdleUpPts[next], girdleUpPts[i]);
    }
    // Girdle
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      addQuad(girdleUpPts[i], girdleUpPts[next], girdleLowPts[next], girdleLowPts[i]);
    }
    // Pavilion chevrons
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      addTri(girdleLowPts[i], girdleLowPts[next], culetPt);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }

  // 3. PEAR CUT / MARQUISE CUT: Teardrop or Almond Brilliant
  const isPear = norm.includes("pear");
  const isMarquise = norm.includes("marquise");
  const isOval = norm.includes("oval");
  const isCushion = norm.includes("cushion");

  const seg = 16;
  const tableY = 0.36;
  const tableR = 0.58;
  const girdleUpY = 0.02;
  const girdleLowY = -0.04;
  const girdleR = 1.0;
  const culetY = -0.72;

  const scaleX = isOval ? 0.78 : isPear ? 0.85 : isMarquise ? 0.65 : isCushion ? 1.04 : 1.0;
  const scaleZ = isOval ? 1.28 : isPear ? 1.35 : isMarquise ? 1.45 : isCushion ? 1.04 : 1.0;

  const getPt = (i: number, y: number, r: number) => {
    const theta = (i / seg) * Math.PI * 2;
    let rx = Math.cos(theta) * r * scaleX;
    let rz = Math.sin(theta) * r * scaleZ;

    if (isCushion) {
      const factor = Math.pow(Math.abs(Math.cos(theta)), 0.25) > 0.05 ? 1 : 0.95;
      rx *= factor;
      rz *= factor;
    } else if (isPear) {
      // Taper apex toward +Z
      if (rz > 0) {
        rx *= 1 - (rz / scaleZ) * 0.45;
      }
    } else if (isMarquise) {
      // Sharpen both tips (+Z and -Z)
      const absZ = Math.abs(rz) / scaleZ;
      rx *= Math.max(0.2, 1 - absZ * 0.65);
    }

    return new THREE.Vector3(rx, y, rz);
  };

  const tableCenter = new THREE.Vector3(0, tableY, 0);
  const culet = new THREE.Vector3(0, culetY, 0);

  // Table fan
  for (let i = 0; i < seg; i++) {
    const next = (i + 1) % seg;
    addTri(tableCenter, getPt(next, tableY, tableR), getPt(i, tableY, tableR));
  }

  // Crown facets (kites and triangles)
  for (let i = 0; i < seg; i++) {
    const next = (i + 1) % seg;
    const t1 = getPt(i, tableY, tableR);
    const t2 = getPt(next, tableY, tableR);
    const g1 = getPt(i, girdleUpY, girdleR);
    const g2 = getPt(next, girdleUpY, girdleR);
    addQuad(t1, t2, g2, g1);
  }

  // Girdle band
  for (let i = 0; i < seg; i++) {
    const next = (i + 1) % seg;
    addQuad(getPt(i, girdleUpY, girdleR), getPt(next, girdleUpY, girdleR), getPt(next, girdleLowY, girdleR), getPt(i, girdleLowY, girdleR));
  }

  // Pavilion facets converging to culet
  for (let i = 0; i < seg; i++) {
    const next = (i + 1) % seg;
    addTri(getPt(i, girdleLowY, girdleR), getPt(next, girdleLowY, girdleR), culet);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds authentic tapered luxury ring shank with D-profile cross-section,
 * adapting dynamically to Ring Styles: Classic Straight, Cathedral, Pinch, Split, Twist.
 */
function buildLuxuryRingShank(ringStyle: string = "classic"): THREE.BufferGeometry {
  const outerR = 1.0;
  const innerR = 0.84;
  const baseWidth = 0.20;
  const segments = 84;

  const vertices: number[] = [];

  const addQuad = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3) => {
    vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
    vertices.push(p1.x, p1.y, p1.z, p3.x, p3.y, p3.z, p4.x, p4.y, p4.z);
  };

  const isCathedral = ringStyle === "cathedral";
  const isPinch = ringStyle === "pinch";
  const isSplit = ringStyle === "split" || ringStyle === "two-row";
  const isTwist = ringStyle === "twist";

  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const a1 = (i / segments) * Math.PI * 2;
    const a2 = (next / segments) * Math.PI * 2;

    const topFactor1 = Math.max(0, Math.sin(a1));
    const topFactor2 = Math.max(0, Math.sin(a2));

    // Style adjustments
    let w1 = baseWidth;
    let w2 = baseWidth;
    let rOut1 = outerR;
    let rOut2 = outerR;
    let zOffset1 = 0;
    let zOffset2 = 0;

    if (isPinch) {
      // Band tapers inward near the top
      w1 = baseWidth * (1 - 0.45 * Math.pow(topFactor1, 2));
      w2 = baseWidth * (1 - 0.45 * Math.pow(topFactor2, 2));
    } else if (isCathedral) {
      // Shoulders sweep up toward the collet
      rOut1 = outerR + 0.12 * Math.pow(topFactor1, 3);
      rOut2 = outerR + 0.12 * Math.pow(topFactor2, 3);
    } else if (isSplit) {
      // Wide split at shoulders
      w1 = baseWidth * (1 + 0.65 * Math.pow(topFactor1, 1.5));
      w2 = baseWidth * (1 + 0.65 * Math.pow(topFactor2, 1.5));
    } else if (isTwist) {
      // Helical deflection
      zOffset1 = Math.sin(a1 * 2) * 0.05 * topFactor1;
      zOffset2 = Math.sin(a2 * 2) * 0.05 * topFactor2;
    }

    const cos1 = Math.cos(a1), sin1 = Math.sin(a1);
    const cos2 = Math.cos(a2), sin2 = Math.sin(a2);

    const halfW1 = w1 / 2;
    const halfW2 = w2 / 2;

    const inL1 = new THREE.Vector3(cos1 * innerR, sin1 * innerR, -halfW1 + zOffset1);
    const inR1 = new THREE.Vector3(cos1 * innerR, sin1 * innerR, halfW1 + zOffset1);
    const outR1 = new THREE.Vector3(cos1 * rOut1, sin1 * rOut1, halfW1 + zOffset1);
    const outL1 = new THREE.Vector3(cos1 * rOut1, sin1 * rOut1, -halfW1 + zOffset1);

    const inL2 = new THREE.Vector3(cos2 * innerR, sin2 * innerR, -halfW2 + zOffset2);
    const inR2 = new THREE.Vector3(cos2 * innerR, sin2 * innerR, halfW2 + zOffset2);
    const outR2 = new THREE.Vector3(cos2 * rOut2, sin2 * rOut2, halfW2 + zOffset2);
    const outL2 = new THREE.Vector3(cos2 * rOut2, sin2 * rOut2, -halfW2 + zOffset2);

    // Outer face
    addQuad(outL1, outR1, outR2, outL2);
    // Inner finger hole
    addQuad(inR1, inL1, inL2, inR2);
    // Left profile rim
    addQuad(outL1, outL2, inL2, inL1);
    // Right profile rim
    addQuad(outR2, outR1, inR1, inR2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.computeVertexNormals();
  return geo;
}

interface RingPreviewProps {
  metal: string;
  carat: string;
  shape: string;
  ringStyle?: string;
  sideSetting?: string;
  crownSetting?: string;
}

export default function RingPreview({
  metal,
  carat,
  shape,
  ringStyle = "classic",
  sideSetting = "plain",
  crownSetting = "none",
}: RingPreviewProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [activeThumbnail, setActiveThumbnail] = useState<"360" | "perspective" | "top" | "side" | "front">("perspective");

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const ringGroupRef = useRef<THREE.Group | null>(null);
  const bandMeshRef = useRef<THREE.Mesh | null>(null);
  const diamondMeshRef = useRef<THREE.Mesh | null>(null);
  const innerSparkleRef = useRef<THREE.Mesh | null>(null);
  const prongsGroupRef = useRef<THREE.Group | null>(null);
  const sideStonesGroupRef = useRef<THREE.Group | null>(null);
  const haloGroupRef = useRef<THREE.Group | null>(null);
  const metalMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const diamondMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  // Initialize Three.js Stage
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || mount.clientWidth;

    const scene = new THREE.Scene();
    // Warm neutral studio backdrop for transmission refraction
    scene.background = new THREE.Color(0xfaf8f5);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.replaceChildren(renderer.domElement);

    // Studio Environment Map
    const envMap = createStudioEnvMap(renderer);
    scene.environment = envMap;

    // Studio Lights
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 3.2);
    keyLight.position.set(3.5, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe8f2ff, 2.0);
    fillLight.position.set(-4, 3, 2.5);
    scene.add(fillLight);

    const sparkleSpot = new THREE.SpotLight(0xffffff, 4.5, 12, Math.PI / 5, 0.3);
    sparkleSpot.position.set(0, 5, 1);
    scene.add(sparkleSpot);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
    rimLight.position.set(0, -1, -4);
    scene.add(rimLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    // Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.16 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.92;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Root Ring Group with Origem India 35° beauty showroom tilt
    const ringGroup = new THREE.Group();
    ringGroup.rotation.x = -Math.PI * 0.14;
    ringGroup.rotation.y = Math.PI * 0.18;
    scene.add(ringGroup);
    ringGroupRef.current = ringGroup;

    // Metal Material
    const prop = METAL_PROPERTIES[metal] || METAL_PROPERTIES.YELLOW_GOLD;
    const metalMat = new THREE.MeshStandardMaterial({
      color: prop.color,
      metalness: prop.metalness,
      roughness: prop.roughness,
      envMapIntensity: 2.2,
    });
    metalMatRef.current = metalMat;

    // Ring Shank Mesh
    const shankGeo = buildLuxuryRingShank(ringStyle);
    const shankMesh = new THREE.Mesh(shankGeo, metalMat);
    shankMesh.castShadow = true;
    ringGroup.add(shankMesh);
    bandMeshRef.current = shankMesh;

    // Diamond Physical Material (High Refractive Brilliance)
    const diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      roughness: 0.0,
      ior: 2.417, // Diamond refractive index
      thickness: 2.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      dispersion: 0.045,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      envMapIntensity: 3.5,
    });
    diamondMatRef.current = diamondMat;

    // Center Diamond
    const caratInfo = CARAT_SCALES[carat] ?? CARAT_SCALES["1.50 Carat"];
    const s = caratInfo.scale;
    const diamondGeo = buildFacetedDiamond(shape);
    const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
    diamondMesh.scale.set(s, s, s);
    diamondMesh.position.set(0, 1.06 + s * 0.38, 0);
    diamondMesh.castShadow = true;
    ringGroup.add(diamondMesh);
    diamondMeshRef.current = diamondMesh;

    // Internal facet core to catch multi-reflections
    const innerCoreGeo = diamondGeo.clone();
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.85,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    innerCore.scale.set(s * 0.96, s * 0.96, s * 0.96);
    innerCore.position.set(0, 1.06 + s * 0.38, 0);
    ringGroup.add(innerCore);
    innerSparkleRef.current = innerCore;

    // Prongs & Collet Basket Group
    const prongsGroup = new THREE.Group();
    ringGroup.add(prongsGroup);
    prongsGroupRef.current = prongsGroup;

    // Side Stones (Pavé, Prong, Channel)
    const sideStonesGroup = new THREE.Group();
    ringGroup.add(sideStonesGroup);
    sideStonesGroupRef.current = sideStonesGroup;

    // Crown Halo (Hidden Halo, Single Halo)
    const haloGroup = new THREE.Group();
    ringGroup.add(haloGroup);
    haloGroupRef.current = haloGroup;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = true;
    controls.minDistance = 2.4;
    controls.maxDistance = 6.6;
    controls.target.set(0, 0.15, 0);
    controlsRef.current = controls;

    // Animation Loop
    let animId: number;
    const animate = () => {
      if (isAutoRotating && ringGroupRef.current) {
        ringGroupRef.current.rotation.y += 0.005;
      }
      controls.update();
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight || mount.clientWidth;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      shankGeo.dispose();
      diamondGeo.dispose();
      innerCoreGeo.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      diamondMat.dispose();
      metalMat.dispose();
      innerCoreMat.dispose();
    };
  }, []);

  // Update Metal Material Color
  useEffect(() => {
    if (metalMatRef.current) {
      const prop = METAL_PROPERTIES[metal] || METAL_PROPERTIES.YELLOW_GOLD;
      metalMatRef.current.color.setHex(prop.color);
      metalMatRef.current.metalness = prop.metalness;
      metalMatRef.current.roughness = prop.roughness;
    }
  }, [metal]);

  // Update Shank Geometry on Ring Style Change
  useEffect(() => {
    if (!bandMeshRef.current) return;
    const oldGeo = bandMeshRef.current.geometry;
    bandMeshRef.current.geometry = buildLuxuryRingShank(ringStyle);
    oldGeo.dispose();
  }, [ringStyle]);

  // Update Diamond Cut Geometry, Scale & Claw Prongs
  useEffect(() => {
    if (!diamondMeshRef.current || !prongsGroupRef.current || !metalMatRef.current) return;

    const caratInfo = CARAT_SCALES[carat] ?? CARAT_SCALES["1.50 Carat"];
    const s = caratInfo.scale;
    const norm = shape.toLowerCase();
    const isEmerald = norm.includes("emerald") || norm.includes("asscher") || norm.includes("radiant");
    const isOval = norm.includes("oval");
    const isMarquise = norm.includes("marquise");
    const isPear = norm.includes("pear");

    // 1. Rebuild Diamond Geometry
    const oldDiamondGeo = diamondMeshRef.current.geometry;
    const newDiamondGeo = buildFacetedDiamond(shape);
    diamondMeshRef.current.geometry = newDiamondGeo;
    diamondMeshRef.current.scale.set(s, s, s);
    diamondMeshRef.current.position.set(0, 1.06 + s * 0.38, 0);
    oldDiamondGeo.dispose();

    if (innerSparkleRef.current) {
      const oldInner = innerSparkleRef.current.geometry;
      innerSparkleRef.current.geometry = newDiamondGeo.clone();
      innerSparkleRef.current.scale.set(s * 0.96, s * 0.96, s * 0.96);
      innerSparkleRef.current.position.set(0, 1.06 + s * 0.38, 0);
      oldInner.dispose();
    }

    // 2. Rebuild 4-Claw Prongs & Basket
    const prongsGroup = prongsGroupRef.current;
    while (prongsGroup.children.length > 0) {
      const child = prongsGroup.children[0] as THREE.Mesh;
      prongsGroup.remove(child);
      child.geometry?.dispose();
    }

    const metalMat = metalMatRef.current;
    const prongRadius = 0.034;
    const prongHeight = s * 0.94;
    const prongGeo = new THREE.CylinderGeometry(prongRadius * 0.85, prongRadius * 1.25, prongHeight, 16);
    const clawCapGeo = new THREE.SphereGeometry(prongRadius * 1.15, 12, 12);

    let spreadX = s * 0.46;
    let spreadZ = s * 0.46;

    if (isEmerald) {
      spreadX = s * 0.44;
      spreadZ = s * 0.64;
    } else if (isOval) {
      spreadX = s * 0.38;
      spreadZ = s * 0.58;
    } else if (isMarquise) {
      spreadX = s * 0.32;
      spreadZ = s * 0.68;
    } else if (isPear) {
      spreadX = s * 0.40;
      spreadZ = s * 0.55;
    }

    const prongCoords = [
      { x: spreadX, z: spreadZ },
      { x: -spreadX, z: spreadZ },
      { x: -spreadX, z: -spreadZ },
      { x: spreadX, z: -spreadZ },
    ];

    // 4 claw prongs with rounded ball caps
    prongCoords.forEach((coord) => {
      const prong = new THREE.Mesh(prongGeo, metalMat);
      prong.position.set(coord.x, 1.02 + prongHeight / 2, coord.z);
      prong.rotation.z = -coord.x * 0.22;
      prong.rotation.x = coord.z * 0.22;
      prongsGroup.add(prong);

      const claw = new THREE.Mesh(clawCapGeo, metalMat);
      claw.position.set(coord.x * 0.92, 1.02 + prongHeight, coord.z * 0.92);
      prongsGroup.add(claw);
    });

    // Collet gallery collar
    const collarRadius = Math.max(spreadX, spreadZ) * 0.84;
    const collarGeo = new THREE.TorusGeometry(collarRadius, 0.028, 12, 32);
    const collarMesh = new THREE.Mesh(collarGeo, metalMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 1.04 + s * 0.16, 0);
    prongsGroup.add(collarMesh);
  }, [shape, carat]);

  // Update Side Stones (Pavé, Prong, Channel)
  useEffect(() => {
    const sideStonesGroup = sideStonesGroupRef.current;
    const diamondMat = diamondMatRef.current;
    const metalMat = metalMatRef.current;
    if (!sideStonesGroup || !diamondMat || !metalMat) return;

    while (sideStonesGroup.children.length > 0) {
      const child = sideStonesGroup.children[0] as THREE.Mesh;
      sideStonesGroup.remove(child);
      child.geometry?.dispose();
    }

    if (sideSetting === "plain") return;

    const microDiamondGeo = new THREE.IcosahedronGeometry(0.042, 1);
    const countPerSide = sideSetting === "channel" ? 9 : 8;

    [-1, 1].forEach((side) => {
      for (let i = 0; i < countPerSide; i++) {
        const frac = 0.20 + (i / countPerSide) * 0.30;
        const angle = Math.PI * 0.5 + side * frac;
        const px = Math.cos(angle) * 1.03;
        const py = Math.sin(angle) * 1.03;

        const stone = new THREE.Mesh(microDiamondGeo, diamondMat);
        stone.position.set(px, py, 0);
        sideStonesGroup.add(stone);

        // For prong setting, add micro prongs
        if (sideSetting === "prong") {
          const prongCollet = new THREE.Mesh(
            new THREE.SphereGeometry(0.016, 8, 8),
            metalMat
          );
          prongCollet.position.set(px, py + 0.02, 0.04);
          sideStonesGroup.add(prongCollet);
        }
      }

      // If Channel setting, add side guard rails
      if (sideSetting === "channel") {
        const railCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(Math.cos(Math.PI * 0.5 + side * 0.20) * 1.04, Math.sin(Math.PI * 0.5 + side * 0.20) * 1.04, 0.07),
          new THREE.Vector3(Math.cos(Math.PI * 0.5 + side * 0.50) * 1.04, Math.sin(Math.PI * 0.5 + side * 0.50) * 1.04, 0.07),
        ]);
        const railGeo = new THREE.TubeGeometry(railCurve, 12, 0.014, 8, false);
        const rail1 = new THREE.Mesh(railGeo, metalMat);
        sideStonesGroup.add(rail1);

        const rail2 = rail1.clone();
        rail2.position.z = -0.14;
        sideStonesGroup.add(rail2);
      }
    });
  }, [sideSetting]);

  // Update Crown Halo Setting (Hidden Halo, Single Halo)
  useEffect(() => {
    const haloGroup = haloGroupRef.current;
    const diamondMat = diamondMatRef.current;
    const metalMat = metalMatRef.current;
    if (!haloGroup || !diamondMat || !metalMat) return;

    while (haloGroup.children.length > 0) {
      const child = haloGroup.children[0] as THREE.Mesh;
      haloGroup.remove(child);
      child.geometry?.dispose();
    }

    if (crownSetting === "none") return;

    const caratInfo = CARAT_SCALES[carat] ?? CARAT_SCALES["1.50 Carat"];
    const s = caratInfo.scale;
    const microDiamondGeo = new THREE.IcosahedronGeometry(0.038, 1);

    if (crownSetting === "hidden-halo") {
      // Hidden halo: micro-diamonds set around the gallery collar under the stone basket
      const count = 18;
      const haloR = s * 0.72;
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        const micro = new THREE.Mesh(microDiamondGeo, diamondMat);
        micro.position.set(Math.cos(theta) * haloR, 1.04 + s * 0.16, Math.sin(theta) * haloR);
        haloGroup.add(micro);
      }
    } else if (crownSetting === "single-halo") {
      // Single halo: full halo ring encircling the diamond girdle
      const count = 24;
      const haloR = s * 1.18;
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        const micro = new THREE.Mesh(microDiamondGeo, diamondMat);
        micro.position.set(Math.cos(theta) * haloR, 1.06 + s * 0.36, Math.sin(theta) * haloR);
        haloGroup.add(micro);
      }
    }
  }, [crownSetting, carat, shape]);

  // Camera View Angles (Matching Origem India 5 thumbnails)
  const setViewAngle = (view: "360" | "perspective" | "top" | "side" | "front") => {
    setActiveThumbnail(view);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const ringGroup = ringGroupRef.current;
    if (!camera || !controls || !ringGroup) return;

    if (view === "360") {
      setIsAutoRotating(true);
      camera.position.set(0, 1.8, 4.4);
      controls.target.set(0, 0.15, 0);
    } else {
      setIsAutoRotating(false);
      if (view === "perspective") {
        ringGroup.rotation.set(-Math.PI * 0.14, Math.PI * 0.18, 0);
        camera.position.set(0, 1.8, 4.4);
        controls.target.set(0, 0.15, 0);
      } else if (view === "top") {
        ringGroup.rotation.set(-Math.PI * 0.04, 0, 0);
        camera.position.set(0, 4.4, 0.2);
        controls.target.set(0, 0.9, 0);
      } else if (view === "side") {
        ringGroup.rotation.set(0, 0, 0);
        camera.position.set(4.4, 0.3, 0);
        controls.target.set(0, 0.1, 0);
      } else if (view === "front") {
        ringGroup.rotation.set(0, 0, 0);
        camera.position.set(0, 0.3, 4.4);
        controls.target.set(0, 0.1, 0);
      }
    }
    camera.updateProjectionMatrix();
    controls.update();
  };

  return (
    <div className="relative w-full aspect-square bg-[#FAF8F5] select-none overflow-hidden rounded-2xl border border-[#E5E0D8]">
      {/* 1. Left Thumbnail Strip (Origem India 5 View Thumbnails) */}
      <div className="absolute left-3 top-3 bottom-3 z-20 flex flex-col justify-center gap-2 pointer-events-auto">
        {/* 360 Rotating View */}
        <button
          type="button"
          onClick={() => setViewAngle("360")}
          title="360° Rotating View"
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeThumbnail === "360"
              ? "bg-[#0E382B] text-white shadow-md ring-2 ring-[#0E382B]/30"
              : "bg-white/95 text-[#444444] border border-[#E5E0D8] hover:border-[#0E382B]"
          }`}
        >
          <RotateCw size={13} className={isAutoRotating ? "animate-spin" : ""} style={{ animationDuration: "6s" }} />
          <span className="text-[8px] font-medium tracking-tight uppercase mt-0.5">360°</span>
        </button>

        {/* 3D Perspective Angle */}
        <button
          type="button"
          onClick={() => setViewAngle("perspective")}
          title="Showroom 3D Perspective"
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeThumbnail === "perspective"
              ? "bg-[#0E382B] text-white shadow-md ring-2 ring-[#0E382B]/30"
              : "bg-white/95 text-[#444444] border border-[#E5E0D8] hover:border-[#0E382B]"
          }`}
        >
          <span className="text-xs font-serif font-bold">◱</span>
          <span className="text-[8px] font-medium tracking-tight uppercase">Angle</span>
        </button>

        {/* Top-Down View */}
        <button
          type="button"
          onClick={() => setViewAngle("top")}
          title="Top Down Diamond Table View"
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeThumbnail === "top"
              ? "bg-[#0E382B] text-white shadow-md ring-2 ring-[#0E382B]/30"
              : "bg-white/95 text-[#444444] border border-[#E5E0D8] hover:border-[#0E382B]"
          }`}
        >
          <span className="text-xs font-serif font-bold">◈</span>
          <span className="text-[8px] font-medium tracking-tight uppercase">Top</span>
        </button>

        {/* Side Profile View */}
        <button
          type="button"
          onClick={() => setViewAngle("side")}
          title="Side Profile View (Basket & Gallery)"
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeThumbnail === "side"
              ? "bg-[#0E382B] text-white shadow-md ring-2 ring-[#0E382B]/30"
              : "bg-white/95 text-[#444444] border border-[#E5E0D8] hover:border-[#0E382B]"
          }`}
        >
          <span className="text-xs font-serif font-bold">○</span>
          <span className="text-[8px] font-medium tracking-tight uppercase">Profile</span>
        </button>

        {/* Front Standing View */}
        <button
          type="button"
          onClick={() => setViewAngle("front")}
          title="Front Standing View"
          className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            activeThumbnail === "front"
              ? "bg-[#0E382B] text-white shadow-md ring-2 ring-[#0E382B]/30"
              : "bg-white/95 text-[#444444] border border-[#E5E0D8] hover:border-[#0E382B]"
          }`}
        >
          <span className="text-xs font-serif font-bold">∩</span>
          <span className="text-[8px] font-medium tracking-tight uppercase">Front</span>
        </button>
      </div>

      {/* 2. Interactive Three.js WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3. Bottom Trust Seal */}
      <div className="absolute bottom-3 left-16 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-[#E5E0D8] px-3 py-1 rounded-full text-[10px] font-medium text-[#0E382B] shadow-2xs pointer-events-none">
        <ShieldCheck size={12} className="text-[#C5A880]" />
        <span>IGI Certified Diamond · BIS Hallmarked</span>
      </div>

      {/* 4. Interactive Hint */}
      <div className="absolute bottom-3 right-3 z-10 text-[9px] uppercase tracking-widest font-medium text-[#777777] bg-white/85 backdrop-blur-xs px-2.5 py-1 rounded-md pointer-events-none">
        Drag to orbit 360°
      </div>
    </div>
  );
}
