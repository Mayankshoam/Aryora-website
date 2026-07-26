"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const METAL_COLORS: Record<string, number> = {
  YELLOW_GOLD: 0xd4af37,
  WHITE_GOLD: 0xe8e8e8,
  ROSE_GOLD: 0xe0aa94,
  CHAMPAGNE_GOLD: 0xc9a876,
  SILVER_925: 0xcfcfcf,
};

const CARAT_SCALE: Record<string, number> = {
  "Below 0.5ct": 0.35,
  "0.5ct – 1ct": 0.5,
  "1ct – 2ct": 0.65,
  "2ct and above": 0.85,
  "Not sure yet": 0.5,
};

interface Props {
  metal: string;
  carat: string;
  shape?: string;
}

// ---- 2D outline builders (units roughly -1..1) ----

function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -1.1);
  s.bezierCurveTo(-1.3, -0.1, -1.1, 0.75, -0.5, 0.85);
  s.bezierCurveTo(-0.15, 0.9, 0, 0.55, 0, 0.35);
  s.bezierCurveTo(0, 0.55, 0.15, 0.9, 0.5, 0.85);
  s.bezierCurveTo(1.1, 0.75, 1.3, -0.1, 0, -1.1);
  return s;
}

function pearShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 1.15);
  s.quadraticCurveTo(0.75, 0.65, 0.85, -0.1);
  s.quadraticCurveTo(0.95, -1.0, 0, -1.15);
  s.quadraticCurveTo(-0.95, -1.0, -0.85, -0.1);
  s.quadraticCurveTo(-0.75, 0.65, 0, 1.15);
  return s;
}

function marquiseShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 1.15);
  s.quadraticCurveTo(0.55, 0.55, 0.55, 0);
  s.quadraticCurveTo(0.55, -0.55, 0, -1.15);
  s.quadraticCurveTo(-0.55, -0.55, -0.55, 0);
  s.quadraticCurveTo(-0.55, 0.55, 0, 1.15);
  return s;
}

function ovalShape() {
  const s = new THREE.Shape();
  s.absellipse(0, 0, 0.72, 1, 0, Math.PI * 2, false, 0);
  return s;
}

function polygonShape(sides: number, radius = 1, rotate = 0) {
  const s = new THREE.Shape();
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * Math.PI * 2 + rotate;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  return s;
}

function rectCutCornersShape(w: number, h: number, cut: number) {
  const s = new THREE.Shape();
  s.moveTo(-w + cut, -h);
  s.lineTo(w - cut, -h);
  s.lineTo(w, -h + cut);
  s.lineTo(w, h - cut);
  s.lineTo(w - cut, h);
  s.lineTo(-w + cut, h);
  s.lineTo(-w, h - cut);
  s.lineTo(-w, -h + cut);
  s.closePath();
  return s;
}

function kiteShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 1.15);
  s.lineTo(0.75, 0);
  s.lineTo(0, -1.15);
  s.lineTo(-0.75, 0);
  s.closePath();
  return s;
}

function shieldShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.85, 0.9);
  s.lineTo(0.85, 0.9);
  s.lineTo(0.85, -0.1);
  s.quadraticCurveTo(0.85, -0.9, 0, -1.15);
  s.quadraticCurveTo(-0.85, -0.9, -0.85, -0.1);
  s.closePath();
  return s;
}

function starShape(points = 5, outerR = 1, innerR = 0.45) {
  const s = new THREE.Shape();
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

function flowerShape(petals = 6) {
  const s = new THREE.Shape();
  const pts: [number, number][] = [];
  for (let i = 0; i <= petals * 16; i++) {
    const a = (i / (petals * 16)) * Math.PI * 2;
    const r = 0.55 + 0.45 * Math.abs(Math.cos(petals * a * 0.5));
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  s.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(([x, y]) => s.lineTo(x, y));
  return s;
}

function butterflyShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(0.4, 0.9, 1, 0.55);
  s.quadraticCurveTo(0.6, 0.15, 0, 0);
  s.quadraticCurveTo(-0.6, 0.15, -1, 0.55);
  s.quadraticCurveTo(-0.4, 0.9, 0, 0);
  s.moveTo(0, 0);
  s.quadraticCurveTo(0.4, -0.9, 1, -0.55);
  s.quadraticCurveTo(0.6, -0.15, 0, 0);
  s.quadraticCurveTo(-0.6, -0.15, -1, -0.55);
  s.quadraticCurveTo(-0.4, -0.9, 0, 0);
  return s;
}

function crownShape() {
  const s = new THREE.Shape();
  s.moveTo(-1, -0.6);
  s.lineTo(1, -0.6);
  s.lineTo(1, 0.1);
  s.lineTo(0.6, -0.15);
  s.lineTo(0.35, 0.4);
  s.lineTo(0, -0.1);
  s.lineTo(-0.35, 0.4);
  s.lineTo(-0.6, -0.15);
  s.lineTo(-1, 0.1);
  s.closePath();
  return s;
}

function tulipShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -1.1);
  s.bezierCurveTo(-0.9, -0.7, -0.9, 0.4, -0.45, 0.7);
  s.bezierCurveTo(-0.6, 0.3, -0.25, 0.1, 0, 0.35);
  s.bezierCurveTo(0.25, 0.1, 0.6, 0.3, 0.45, 0.7);
  s.bezierCurveTo(0.9, 0.4, 0.9, -0.7, 0, -1.1);
  return s;
}

function buildExtrudedGem(shape: THREE.Shape, depth = 0.55) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.14,
    bevelSize: 0.1,
    bevelSegments: 2,
    curveSegments: 12,
  });
  geo.center();
  geo.rotateX(Math.PI / 2);
  return geo;
}

function getGemGeometry(shapeName: string): THREE.BufferGeometry {
  switch (shapeName) {
    case "Round Brilliant":
      return new THREE.SphereGeometry(0.62, 10, 7);
    case "Princess":
      return buildExtrudedGem(rectCutCornersShape(0.7, 0.7, 0), 0.5);
    case "Cushion":
      return buildExtrudedGem(polygonShape(24, 0.72), 0.5);
    case "Oval":
      return buildExtrudedGem(ovalShape(), 0.5);
    case "Emerald":
      return buildExtrudedGem(rectCutCornersShape(0.55, 0.85, 0.25), 0.5);
    case "Pear (Teardrop)":
      return buildExtrudedGem(pearShape(), 0.45);
    case "Marquise":
      return buildExtrudedGem(marquiseShape(), 0.4);
    case "Heart":
      return buildExtrudedGem(heartShape(), 0.45);
    case "Asscher":
      return buildExtrudedGem(rectCutCornersShape(0.68, 0.68, 0.28), 0.5);
    case "Radiant":
      return buildExtrudedGem(rectCutCornersShape(0.58, 0.8, 0.18), 0.5);
    case "Trillion (Triangle)":
      return buildExtrudedGem(polygonShape(3, 0.85, Math.PI / 2), 0.45);
    case "Kite":
      return buildExtrudedGem(kiteShape(), 0.4);
    case "Hexagon":
      return buildExtrudedGem(polygonShape(6, 0.75), 0.5);
    case "Octagon":
      return buildExtrudedGem(polygonShape(8, 0.75), 0.5);
    case "Shield":
      return buildExtrudedGem(shieldShape(), 0.45);
    case "Tulip":
      return buildExtrudedGem(tulipShape(), 0.45);
    case "Flower (Floral Cluster)":
      return buildExtrudedGem(flowerShape(6), 0.4);
    case "Crown":
      return buildExtrudedGem(crownShape(), 0.4);
    case "Butterfly":
      return buildExtrudedGem(butterflyShape(), 0.35);
    case "Star":
      return buildExtrudedGem(starShape(5, 0.85, 0.4), 0.4);
    default:
      return new THREE.OctahedronGeometry(0.75, 0);
  }
}

export default function RingPreview({ metal, carat, shape = "Round Brilliant" }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const gemRef = useRef<THREE.Mesh | null>(null);
  const bandRef = useRef<THREE.Mesh | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const gemMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  // Set up scene once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientWidth;

    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.8);
    fill.position.set(-4, 2, -3);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const bandGeo = new THREE.TorusGeometry(1, 0.16, 32, 100);
    const bandMat = new THREE.MeshStandardMaterial({ color: METAL_COLORS[metal] ?? 0xd4af37, metalness: 0.9, roughness: 0.25 });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.rotation.x = Math.PI / 2;
    scene.add(band);
    bandRef.current = band;

    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      roughness: 0.05,
      metalness: 0,
      thickness: 0.5,
      ior: 2.4,
      clearcoat: 1,
    });
    gemMatRef.current = gemMat;

    const gemGeo = getGemGeometry(shape);
    const gem = new THREE.Mesh(gemGeo, gemMat);
    const s = CARAT_SCALE[carat] ?? 0.5;
    gem.scale.set(s, s, s);
    gem.position.set(0, 1 + s * 0.6, 0);
    scene.add(gem);
    gemRef.current = gem;

    let frameId: number;
    const animate = () => {
      band.rotation.z += 0.006;
      gem.rotation.y += 0.012;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      renderer.setSize(w, w);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
      bandGeo.dispose();
      bandMat.dispose();
      gemGeo.dispose();
      gemMat.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-update metal color and carat scale
  useEffect(() => {
    if (bandRef.current) {
      (bandRef.current.material as THREE.MeshStandardMaterial).color.setHex(METAL_COLORS[metal] ?? 0xd4af37);
    }
    if (gemRef.current) {
      const s = CARAT_SCALE[carat] ?? 0.5;
      gemRef.current.scale.set(s, s, s);
      gemRef.current.position.y = 1 + s * 0.6;
    }
  }, [metal, carat]);

  // Live-update gem geometry when shape changes
  useEffect(() => {
    if (!gemRef.current || !sceneRef.current || !gemMatRef.current) return;
    const oldGeo = gemRef.current.geometry;
    const newGeo = getGemGeometry(shape);
    gemRef.current.geometry = newGeo;
    oldGeo.dispose();
  }, [shape]);

  return (
    <div>
      <div ref={mountRef} className="w-full aspect-square bg-black/5" />
      <p className="text-[11px] text-ink/40 mt-2 text-center">
        Illustrative preview of the selected shape, metal tone, and approximate stone size — not a
        photorealistic render.
      </p>
    </div>
  );
}
