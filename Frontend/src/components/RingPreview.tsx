"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sparkles, RotateCw, Eye, Maximize2, ShieldCheck } from "lucide-react";

// Realistic Precious Metal Colors & PBR Settings
const METAL_PROPERTIES: Record<
  string,
  { color: number; metalness: number; roughness: number; specularColor?: number }
> = {
  YELLOW_GOLD: { color: 0xe5c158, metalness: 0.98, roughness: 0.14 },
  WHITE_GOLD: { color: 0xededed, metalness: 1.0, roughness: 0.11 },
  ROSE_GOLD: { color: 0xe6a890, metalness: 0.98, roughness: 0.16 },
  CHAMPAGNE_GOLD: { color: 0xd8be96, metalness: 0.98, roughness: 0.15 },
  SILVER_925: { color: 0xe2e5e8, metalness: 0.96, roughness: 0.13 },
};

// Relative stone scaling per carat weight
const CARAT_SCALES: Record<string, number> = {
  "0.50 Carat": 0.42,
  "1.00 Carat": 0.52,
  "1.50 Carat": 0.62,
  "2.00 Carat": 0.72,
  "2.50+ Carat": 0.82,
  // Fallbacks
  "Below 0.5ct": 0.42,
  "0.5ct – 1ct": 0.52,
  "1ct – 2ct": 0.65,
  "2ct and above": 0.78,
  "Not sure yet": 0.55,
};

/**
 * Creates a high-contrast luxury studio environment map on an HTML Canvas.
 * Generates softboxes, lateral strip reflections, and ambient studio gradients
 * so metals mirror authentic showroom light without needing external HDR downloads.
 */
function createStudioEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // 1. Dark luxury studio background
  ctx.fillStyle = "#121415";
  ctx.fillRect(0, 0, 1024, 512);

  // 2. Main overhead softbox (bright warm white)
  const topSoftbox = ctx.createRadialGradient(512, 120, 10, 512, 120, 220);
  topSoftbox.addColorStop(0, "#ffffff");
  topSoftbox.addColorStop(0.35, "#fff7ea");
  topSoftbox.addColorStop(0.8, "rgba(255, 245, 230, 0.4)");
  topSoftbox.addColorStop(1, "rgba(18, 20, 21, 0)");
  ctx.fillStyle = topSoftbox;
  ctx.fillRect(0, 0, 1024, 280);

  // 3. Left vertical strip softbox (crisp rim reflection)
  const leftStrip = ctx.createLinearGradient(160, 0, 260, 0);
  leftStrip.addColorStop(0, "rgba(255,255,255,0)");
  leftStrip.addColorStop(0.5, "#ffffff");
  leftStrip.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = leftStrip;
  ctx.fillRect(160, 80, 100, 350);

  // 4. Right vertical strip softbox (soft secondary highlight)
  const rightStrip = ctx.createLinearGradient(760, 0, 860, 0);
  rightStrip.addColorStop(0, "rgba(255,255,255,0)");
  rightStrip.addColorStop(0.5, "#f0f4fa");
  rightStrip.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rightStrip;
  ctx.fillRect(760, 80, 100, 350);

  // 5. Floor warm ground bounce reflection
  const groundBounce = ctx.createLinearGradient(0, 420, 0, 512);
  groundBounce.addColorStop(0, "rgba(20, 22, 23, 0)");
  groundBounce.addColorStop(1, "rgba(220, 200, 170, 0.25)");
  ctx.fillStyle = groundBounce;
  ctx.fillRect(0, 420, 1024, 92);

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
 * Builds authentic faceted diamond geometry with crisp facet reflections,
 * flat crown table, angled crown kites, girdle rim, and steep pavilion facets.
 */
function buildFacetedDiamond(shape: string): THREE.BufferGeometry {
  const normShape = shape.toLowerCase();

  // EMERALD CUT: Classic octagonal step-cut diamond (like reference)
  if (normShape.includes("emerald") || normShape.includes("asscher") || normShape.includes("radiant")) {
    const isSquare = normShape.includes("asscher");
    const lenX = isSquare ? 1.05 : 0.95;
    const lenZ = isSquare ? 1.05 : 1.45;
    const cornerCut = 0.28;

    // 8-point octagon contour generator
    const makeOctagon = (scaleX: number, scaleZ: number, y: number) => {
      const x = (lenX * scaleX) / 2;
      const z = (lenZ * scaleZ) / 2;
      const c = cornerCut * Math.min(scaleX, scaleZ);
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

    const tablePts = makeOctagon(0.68, 0.68, 0.38);
    const crownMidPts = makeOctagon(0.85, 0.85, 0.2);
    const girdlePts = makeOctagon(1.0, 1.0, 0.0);
    const girdleLowerPts = makeOctagon(1.0, 1.0, -0.06);
    const pavilionMidPts = makeOctagon(0.55, 0.55, -0.42);
    const culetPts = [
      new THREE.Vector3(isSquare ? 0 : 0.15, -0.72, 0),
      new THREE.Vector3(isSquare ? 0 : -0.15, -0.72, 0),
    ];

    const vertices: number[] = [];

    const addQuad = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3) => {
      vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
      vertices.push(p1.x, p1.y, p1.z, p3.x, p3.y, p3.z, p4.x, p4.y, p4.z);
    };

    // Table face (Octagon fan)
    const centerTable = new THREE.Vector3(0, 0.38, 0);
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      vertices.push(centerTable.x, centerTable.y, centerTable.z);
      vertices.push(tablePts[i].x, tablePts[i].y, tablePts[i].z);
      vertices.push(tablePts[next].x, tablePts[next].y, tablePts[next].z);
    }

    // Crown step 1 (Table to Crown Mid)
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      addQuad(tablePts[i], tablePts[next], crownMidPts[next], crownMidPts[i]);
    }

    // Crown step 2 (Crown Mid to Girdle)
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      addQuad(crownMidPts[i], crownMidPts[next], girdlePts[next], girdlePts[i]);
    }

    // Girdle vertical facet
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      addQuad(girdlePts[i], girdlePts[next], girdleLowerPts[next], girdleLowerPts[i]);
    }

    // Pavilion step 1 (Girdle to Pavilion Mid)
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      addQuad(girdleLowerPts[i], girdleLowerPts[next], pavilionMidPts[next], pavilionMidPts[i]);
    }

    // Pavilion step 2 (Pavilion Mid to Culet)
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      const culetTarget = i < 4 ? culetPts[0] : culetPts[1];
      vertices.push(pavilionMidPts[i].x, pavilionMidPts[i].y, pavilionMidPts[i].z);
      vertices.push(pavilionMidPts[next].x, pavilionMidPts[next].y, pavilionMidPts[next].z);
      vertices.push(culetTarget.x, culetTarget.y, culetTarget.z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }

  // ROUND BRILLIANT / OVAL: Authentic brilliant-cut facet layout
  if (normShape.includes("round") || normShape.includes("oval") || normShape.includes("cushion")) {
    const isOval = normShape.includes("oval");
    const isCushion = normShape.includes("cushion");
    const scaleX = isOval ? 0.78 : isCushion ? 1.05 : 1.0;
    const scaleZ = isOval ? 1.25 : isCushion ? 1.05 : 1.0;

    const segments = 16;
    const tableRadius = 0.58;
    const girdleRadius = 1.0;
    const tableY = 0.36;
    const girdleY = 0.0;
    const culetY = -0.74;

    const vertices: number[] = [];
    const tableCenter = new THREE.Vector3(0, tableY, 0);
    const culet = new THREE.Vector3(0, culetY, 0);

    const getGirdlePoint = (i: number, y: number, r: number) => {
      const theta = (i / segments) * Math.PI * 2;
      let rx = Math.cos(theta) * r * scaleX;
      let rz = Math.sin(theta) * r * scaleZ;
      if (isCushion) {
        // Squircle soft pillow contour
        rx *= Math.pow(Math.abs(Math.cos(theta)), 0.3) > 0.1 ? 1 : 0.95;
      }
      return new THREE.Vector3(rx, y, rz);
    };

    // Table polygon fan
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      const p1 = getGirdlePoint(i, tableY, tableRadius);
      const p2 = getGirdlePoint(next, tableY, tableRadius);
      vertices.push(tableCenter.x, tableCenter.y, tableCenter.z);
      vertices.push(p1.x, p1.y, p1.z);
      vertices.push(p2.x, p2.y, p2.z);
    }

    // Crown triangular facets
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      const t1 = getGirdlePoint(i, tableY, tableRadius);
      const t2 = getGirdlePoint(next, tableY, tableRadius);
      const g1 = getGirdlePoint(i, girdleY, girdleRadius);
      const g2 = getGirdlePoint(next, girdleY, girdleRadius);

      // 2 triangular facets per crown segment
      vertices.push(t1.x, t1.y, t1.z, g1.x, g1.y, g1.z, g2.x, g2.y, g2.z);
      vertices.push(t1.x, t1.y, t1.z, g2.x, g2.y, g2.z, t2.x, t2.y, t2.z);
    }

    // Pavilion facets converging to culet
    for (let i = 0; i < segments; i++) {
      const next = (i + 1) % segments;
      const g1 = getGirdlePoint(i, girdleY, girdleRadius);
      const g2 = getGirdlePoint(next, girdleY, girdleRadius);
      vertices.push(g1.x, g1.y, g1.z, g2.x, g2.y, g2.z, culet.x, culet.y, culet.z);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }

  // PEAR CUT: Teardrop brilliant
  if (normShape.includes("pear")) {
    const geo = new THREE.ConeGeometry(0.95, 1.25, 16);
    geo.scale(0.8, 0.7, 1.3);
    geo.rotateX(Math.PI);
    return geo;
  }

  // PRINCESS CUT: Square inverted pyramid
  const geo = new THREE.ConeGeometry(1.05, 1.15, 4);
  geo.rotateY(Math.PI / 4);
  geo.rotateX(Math.PI);
  return geo;
}

/**
 * Constructs an authentic luxury ring shank with D-profile comfort cross section,
 * cathedral shoulder tapers, and a central collet bridge.
 */
function buildLuxuryRingShank(): THREE.BufferGeometry {
  const outerR = 1.0;
  const innerR = 0.84; // Comfort finger hole
  const tubeWidth = 0.22; // Shank thickness along finger axis
  const segments = 80;

  const vertices: number[] = [];

  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const a1 = (i / segments) * Math.PI * 2;
    const a2 = (next / segments) * Math.PI * 2;

    // Taper slightly wider near the top shoulders (a = Math.PI/2)
    const taper1 = 1 + 0.22 * Math.max(0, Math.sin(a1));
    const taper2 = 1 + 0.22 * Math.max(0, Math.sin(a2));

    const w1 = (tubeWidth * taper1) / 2;
    const w2 = (tubeWidth * taper2) / 2;

    // Cross-section points: inner-left, inner-right, outer-right, outer-left
    const cos1 = Math.cos(a1), sin1 = Math.sin(a1);
    const cos2 = Math.cos(a2), sin2 = Math.sin(a2);

    const inL1 = new THREE.Vector3(cos1 * innerR, sin1 * innerR, -w1);
    const inR1 = new THREE.Vector3(cos1 * innerR, sin1 * innerR, w1);
    const outR1 = new THREE.Vector3(cos1 * outerR, sin1 * outerR, w1);
    const outL1 = new THREE.Vector3(cos1 * outerR, sin1 * outerR, -w1);

    const inL2 = new THREE.Vector3(cos2 * innerR, sin2 * innerR, -w2);
    const inR2 = new THREE.Vector3(cos2 * innerR, sin2 * innerR, w2);
    const outR2 = new THREE.Vector3(cos2 * outerR, sin2 * outerR, w2);
    const outL2 = new THREE.Vector3(cos2 * outerR, sin2 * outerR, -w2);

    const addQuad = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3) => {
      vertices.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p3.x, p3.y, p3.z);
      vertices.push(p1.x, p1.y, p1.z, p3.x, p3.y, p3.z, p4.x, p4.y, p4.z);
    };

    // Outer face
    addQuad(outL1, outR1, outR2, outL2);
    // Inner finger hole face
    addQuad(inR1, inL1, inL2, inR2);
    // Left side face
    addQuad(outL1, outL2, inL2, inL1);
    // Right side face
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
  styles: string[];
}

export default function RingPreview({ metal, carat, shape, styles }: RingPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [activeView, setActiveView] = useState<"perspective" | "top" | "side">("perspective");
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // References to live 3D nodes
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const bandMeshRef = useRef<THREE.Mesh | null>(null);
  const diamondMeshRef = useRef<THREE.Mesh | null>(null);
  const prongsGroupRef = useRef<THREE.Group | null>(null);
  const accentsGroupRef = useRef<THREE.Group | null>(null);
  const diamondMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const metalMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // One-time Three.js Canvas Setup
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight || mount.clientWidth;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 3.4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.replaceChildren(renderer.domElement);

    // 2. High-Contrast Studio Environment Map
    const envMap = createStudioEnvMap(renderer);
    scene.environment = envMap;

    // 3. Studio Lighting Rig
    // Warm key softbox
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.8);
    keyLight.position.set(3.5, 6, 4);
    scene.add(keyLight);

    // Cool fill light for metal definition
    const fillLight = new THREE.DirectionalLight(0xe8f2ff, 1.8);
    fillLight.position.set(-4, 3, 2.5);
    scene.add(fillLight);

    // Overhead sparkle pin-spot focused onto the diamond table
    const sparkleSpot = new THREE.SpotLight(0xffffff, 4.2, 10, Math.PI / 6, 0.4);
    sparkleSpot.position.set(0, 5, 0.8);
    scene.add(sparkleSpot);

    // Subtle rim backlight
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
    rimLight.position.set(0, -1, -4);
    scene.add(rimLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // 4. Luxury Ring Group (Centered for smooth 360° spin)
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    // 5. Authentic Ring Shank
    const metalProp = METAL_PROPERTIES[metal] || METAL_PROPERTIES.YELLOW_GOLD;
    const metalMat = new THREE.MeshStandardMaterial({
      color: metalProp.color,
      metalness: metalProp.metalness,
      roughness: metalProp.roughness,
      envMapIntensity: 1.6,
    });
    metalMatRef.current = metalMat;

    const shankGeo = buildLuxuryRingShank();
    const shankMesh = new THREE.Mesh(shankGeo, metalMat);
    ringGroup.add(shankMesh);
    bandMeshRef.current = shankMesh;

    // 6. Faceted Diamond with dispersion and high IOR
    const diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      opacity: 1,
      roughness: 0.02,
      ior: 2.417, // Diamond refractive index
      thickness: 1.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      dispersion: 0.044, // Fire & sparkle dispersion
      envMapIntensity: 2.4,
      transparent: true,
    });
    diamondMatRef.current = diamondMat;

    const s = CARAT_SCALES[carat] ?? 0.62;
    const diamondGeo = buildFacetedDiamond(shape);
    const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
    diamondMesh.scale.set(s, s, s);
    diamondMesh.position.set(0, 1.02 + s * 0.42, 0);
    ringGroup.add(diamondMesh);
    diamondMeshRef.current = diamondMesh;

    // 7. Prongs & Setting Head Group
    const prongsGroup = new THREE.Group();
    ringGroup.add(prongsGroup);
    prongsGroupRef.current = prongsGroup;

    // 8. Accents Group (Halo, side stones, pave)
    const accentsGroup = new THREE.Group();
    ringGroup.add(accentsGroup);
    accentsGroupRef.current = accentsGroup;

    // 9. Interactive Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = true;
    controls.minDistance = 1.8;
    controls.maxDistance = 6.0;
    controls.target.set(0, 0.4, 0);
    controlsRef.current = controls;

    // 10. Animation Loop
    let animId: number;
    const animate = () => {
      if (isAutoRotating) {
        ringGroup.rotation.y += 0.006;
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
      diamondMat.dispose();
      metalMat.dispose();
    };
  }, []);

  // Update Metal Color & Material Properties
  useEffect(() => {
    if (metalMatRef.current) {
      const prop = METAL_PROPERTIES[metal] || METAL_PROPERTIES.YELLOW_GOLD;
      metalMatRef.current.color.setHex(prop.color);
      metalMatRef.current.metalness = prop.metalness;
      metalMatRef.current.roughness = prop.roughness;
    }
  }, [metal]);

  // Update Diamond Shape, Size & Prongs
  useEffect(() => {
    if (!diamondMeshRef.current || !prongsGroupRef.current || !metalMatRef.current) return;

    const s = CARAT_SCALES[carat] ?? 0.62;
    const isEmerald = shape.toLowerCase().includes("emerald") || shape.toLowerCase().includes("asscher");

    // Replace diamond geometry
    const oldGeo = diamondMeshRef.current.geometry;
    diamondMeshRef.current.geometry = buildFacetedDiamond(shape);
    diamondMeshRef.current.scale.set(s, s, s);
    diamondMeshRef.current.position.set(0, 1.02 + s * 0.42, 0);
    oldGeo.dispose();

    // Rebuild 4/6 Claw Prongs & Basket
    const prongsGroup = prongsGroupRef.current;
    while (prongsGroup.children.length > 0) {
      const child = prongsGroup.children[0] as THREE.Mesh;
      prongsGroup.remove(child);
      child.geometry?.dispose();
    }

    const metalMat = metalMatRef.current;
    const prongRadius = 0.038;
    const prongHeight = s * 0.95;
    const prongGeo = new THREE.CylinderGeometry(prongRadius * 0.8, prongRadius * 1.2, prongHeight, 16);
    const clawCapGeo = new THREE.SphereGeometry(prongRadius * 1.1, 12, 12);

    const prongCount = isEmerald ? 4 : 4;
    const spreadX = isEmerald ? s * 0.44 : s * 0.45;
    const spreadZ = isEmerald ? s * 0.65 : s * 0.45;

    const prongCoords = [
      { x: spreadX, z: spreadZ },
      { x: -spreadX, z: spreadZ },
      { x: -spreadX, z: -spreadZ },
      { x: spreadX, z: -spreadZ },
    ];

    prongCoords.forEach((coord) => {
      const prong = new THREE.Mesh(prongGeo, metalMat);
      prong.position.set(coord.x, 1.02 + prongHeight / 2, coord.z);
      // Incline slightly towards center
      prong.rotation.z = -coord.x * 0.22;
      prong.rotation.x = coord.z * 0.22;
      prongsGroup.add(prong);

      // Claw tip gripping the diamond crown
      const claw = new THREE.Mesh(clawCapGeo, metalMat);
      claw.position.set(coord.x * 0.92, 1.02 + prongHeight, coord.z * 0.92);
      prongsGroup.add(claw);
    });

    // Collet gallery collar holding the prongs together
    const collarRadius = Math.max(spreadX, spreadZ) * 0.85;
    const collarGeo = new THREE.TorusGeometry(collarRadius, 0.035, 12, 32);
    const collarMesh = new THREE.Mesh(collarGeo, metalMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.set(0, 1.05 + s * 0.15, 0);
    prongsGroup.add(collarMesh);
  }, [shape, carat]);

  // Update Setting Styles (Halo, Three-Stone, Eternity)
  useEffect(() => {
    const accentsGroup = accentsGroupRef.current;
    const diamondMat = diamondMatRef.current;
    if (!accentsGroup || !diamondMat) return;

    while (accentsGroup.children.length > 0) {
      const child = accentsGroup.children[0] as THREE.Mesh;
      accentsGroup.remove(child);
      child.geometry?.dispose();
    }

    const s = CARAT_SCALES[carat] ?? 0.62;
    const microDiamondGeo = new THREE.IcosahedronGeometry(0.065, 1);

    // HALO: Micro-pavé perimeter of brilliant diamonds
    if (styles.includes("halo")) {
      const count = 18;
      const haloRadius = s * 0.85;
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2;
        const micro = new THREE.Mesh(microDiamondGeo, diamondMat);
        micro.position.set(Math.cos(theta) * haloRadius, 1.02 + s * 0.35, Math.sin(theta) * haloRadius);
        accentsGroup.add(micro);
      }
    }

    // THREE-STONE: Two side diamonds flanking the center stone
    if (styles.includes("three-stone")) {
      const sideScale = s * 0.52;
      const sideGeo = buildFacetedDiamond("round");
      [-1, 1].forEach((dir) => {
        const sideDiamond = new THREE.Mesh(sideGeo, diamondMat);
        sideDiamond.scale.set(sideScale, sideScale, sideScale);
        sideDiamond.position.set(dir * (s * 0.82), 1.08, 0);
        sideDiamond.rotation.z = -dir * 0.25;
        accentsGroup.add(sideDiamond);
      });
    }

    // ETERNITY: Pave diamonds embedded across the upper shank
    if (styles.includes("eternity")) {
      const count = 16;
      for (let i = 0; i < count; i++) {
        const angle = Math.PI * 0.15 + (i / count) * (Math.PI * 0.7);
        const pave = new THREE.Mesh(microDiamondGeo, diamondMat);
        pave.position.set(Math.cos(angle) * 1.04, Math.sin(angle) * 1.04, 0);
        accentsGroup.add(pave);
      }
    }
  }, [styles, carat, shape]);

  // Camera View Presets
  const setCameraView = (view: "perspective" | "top" | "side") => {
    setActiveView(view);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (view === "perspective") {
      camera.position.set(0, 1.8, 3.4);
      controls.target.set(0, 0.4, 0);
    } else if (view === "top") {
      camera.position.set(0, 3.8, 0.05);
      controls.target.set(0, 0.8, 0);
    } else if (view === "side") {
      camera.position.set(3.4, 0.7, 0);
      controls.target.set(0, 0.7, 0);
    }
    camera.updateProjectionMatrix();
    controls.update();
  };

  return (
    <div ref={containerRef} className="relative w-full aspect-square bg-[#FBF9F5] select-none overflow-hidden">
      {/* 1. Interactive 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 2. Top Bar: View Angles & 360° Controls */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-auto">
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md border border-[#E5E0D8] p-1 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setCameraView("perspective")}
            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-lg transition-colors ${
              activeView === "perspective"
                ? "bg-[#0E382B] text-white"
                : "text-[#666666] hover:text-[#111111]"
            }`}
          >
            3D Angle
          </button>
          <button
            type="button"
            onClick={() => setCameraView("top")}
            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-lg transition-colors ${
              activeView === "top"
                ? "bg-[#0E382B] text-white"
                : "text-[#666666] hover:text-[#111111]"
            }`}
          >
            Top
          </button>
          <button
            type="button"
            onClick={() => setCameraView("side")}
            className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-lg transition-colors ${
              activeView === "side"
                ? "bg-[#0E382B] text-white"
                : "text-[#666666] hover:text-[#111111]"
            }`}
          >
            Profile
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          title={isAutoRotating ? "Pause auto-rotation" : "Enable 360° auto-rotation"}
          className={`p-2 rounded-xl border transition-all ${
            isAutoRotating
              ? "bg-[#0E382B] text-white border-[#0E382B] shadow-sm"
              : "bg-white/90 text-[#666666] border-[#E5E0D8] hover:text-[#111111]"
          }`}
        >
          <RotateCw size={13} className={isAutoRotating ? "animate-spin" : ""} style={{ animationDuration: "6s" }} />
        </button>
      </div>

      {/* 3. Bottom Trust Seal */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-[#E5E0D8] px-2.5 py-1 rounded-full text-[10px] font-medium text-[#0E382B] shadow-2xs pointer-events-none">
        <ShieldCheck size={12} className="text-[#C5A880]" />
        <span>IGI Certified Diamond · Real-Time 3D Stage</span>
      </div>

      {/* 4. Interactive Hint */}
      <div className="absolute bottom-3 right-3 z-10 text-[9px] uppercase tracking-widest font-medium text-[#888888] bg-white/70 backdrop-blur-xs px-2 py-0.5 rounded-md pointer-events-none">
        Drag to Orbit 360°
      </div>
    </div>
  );
}
