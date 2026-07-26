"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const METAL_COLORS: Record<string, number> = {
  YELLOW_GOLD: 0xd4af37,
  WHITE_GOLD: 0xd9d9d9,
  ROSE_GOLD: 0xe0aa94,
  CHAMPAGNE_GOLD: 0xc9a876,
  SILVER_925: 0xc7c7c7,
};

const CARAT_SCALE: Record<string, number> = {
  "Below 0.5ct": 0.28,
  "0.5ct – 1ct": 0.36,
  "1ct – 2ct": 0.46,
  "2ct and above": 0.58,
  "Not sure yet": 0.36,
};

const TORUS_RADIUS = 1;
const TUBE_RADIUS = 0.16;

// Rough silhouette per diamond shape — illustrative only, not an accurate facet pattern.
function buildGemGeometry(shape: string): THREE.BufferGeometry {
  switch (shape) {
    case "Round Brilliant":
      return new THREE.IcosahedronGeometry(1, 1);
    case "Princess": {
      const g = new THREE.BoxGeometry(1.3, 1, 1.3);
      g.rotateY(Math.PI / 4);
      return g;
    }
    case "Cushion": {
      const g = new THREE.SphereGeometry(1, 8, 6);
      g.scale(1.15, 0.9, 1.15);
      return g;
    }
    case "Oval": {
      const g = new THREE.SphereGeometry(1, 16, 10);
      g.scale(0.75, 0.85, 1.15);
      return g;
    }
    case "Emerald":
      return new THREE.BoxGeometry(0.95, 0.85, 1.45);
    case "Asscher": {
      const g = new THREE.BoxGeometry(1.15, 0.9, 1.15);
      g.rotateY(Math.PI / 4);
      return g;
    }
    case "Radiant":
      return new THREE.BoxGeometry(1.05, 0.9, 1.35);
    case "Pear (Teardrop)": {
      const p = new THREE.Shape();
      p.moveTo(0, 1.2);
      p.quadraticCurveTo(0.75, 0.8, 0.65, -0.1);
      p.quadraticCurveTo(0.55, -1.1, 0, -1.2);
      p.quadraticCurveTo(-0.55, -1.1, -0.65, -0.1);
      p.quadraticCurveTo(-0.75, 0.8, 0, 1.2);
      const g = new THREE.ExtrudeGeometry(p, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.08, bevelSegments: 2 });
      g.center();
      g.rotateX(Math.PI / 2);
      return g;
    }
    case "Marquise": {
      const g = new THREE.OctahedronGeometry(1, 0);
      g.scale(0.6, 0.5, 1.45);
      return g;
    }
    case "Heart": {
      const h = new THREE.Shape();
      h.moveTo(0, 0.9);
      h.bezierCurveTo(0, 1.1, -0.55, 1.4, -1, 0.9);
      h.bezierCurveTo(-1.5, 0.3, -0.9, -0.4, 0, -1.3);
      h.bezierCurveTo(0.9, -0.4, 1.5, 0.3, 1, 0.9);
      h.bezierCurveTo(0.55, 1.4, 0, 1.1, 0, 0.9);
      const g = new THREE.ExtrudeGeometry(h, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.06, bevelSegments: 2 });
      g.scale(0.6, 0.6, 0.6);
      g.center();
      g.rotateX(Math.PI);
      return g;
    }
    case "Trillion (Triangle)": {
      const g = new THREE.ConeGeometry(1.15, 0.85, 3);
      g.rotateX(Math.PI / 2);
      return g;
    }
    case "Kite": {
      const g = new THREE.ConeGeometry(1, 1, 4);
      g.rotateX(Math.PI / 2);
      g.scale(1, 1.3, 1);
      return g;
    }
    case "Hexagon": {
      const g = new THREE.CylinderGeometry(1, 1, 0.7, 6);
      g.rotateX(Math.PI / 2);
      return g;
    }
    case "Octagon": {
      const g = new THREE.CylinderGeometry(1, 1, 0.7, 8);
      g.rotateX(Math.PI / 2);
      return g;
    }
    case "Shield": {
      const g = new THREE.CylinderGeometry(1, 0.6, 1.2, 5);
      g.rotateX(Math.PI / 2);
      return g;
    }
    case "Tulip":
      return new THREE.ConeGeometry(0.95, 1.4, 24, 1, true);
    case "Flower (Floral Cluster)":
      return new THREE.DodecahedronGeometry(1, 0);
    case "Crown":
      return new THREE.ConeGeometry(1, 1.3, 6);
    case "Butterfly": {
      const g = new THREE.OctahedronGeometry(1, 0);
      g.scale(1.4, 0.5, 0.75);
      return g;
    }
    case "Star": {
      const points = 5, outer = 1.1, inner = 0.45;
      const s = new THREE.Shape();
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * r, py = Math.sin(a) * r;
        if (i === 0) s.moveTo(px, py); else s.lineTo(px, py);
      }
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.05, bevelSegments: 2 });
      g.center();
      g.rotateX(Math.PI / 2);
      return g;
    }
    default:
      return new THREE.IcosahedronGeometry(1, 1);
  }
}

interface Props {
  metal: string;
  carat: string;
  shape: string;
  styles: string[]; // e.g. ["halo", "three-stone", "eternity", ...]
}

export default function RingPreview({ metal, carat, shape, styles }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<THREE.Mesh | null>(null);
  const gemRef = useRef<THREE.Mesh | null>(null);
  const decorGroupRef = useRef<THREE.Group | null>(null);
  const gemMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const accentMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  // One-time scene setup
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientWidth;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, 1.7, 3.6);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // Lighting tuned so metal reads as gold/silver, not black —
    // metallic materials need multiple light sources from different angles
    // to fake reflections since there's no environment map here.
    const key = new THREE.DirectionalLight(0xfff2d9, 3);
    key.position.set(3, 5, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xd9e8ff, 1.4);
    fill.position.set(-4, 2, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 1.6);
    rim.position.set(0, -2, -4);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 0.9));

    // Band — lies flat like a real ring viewed at an angle
    const bandGeo = new THREE.TorusGeometry(TORUS_RADIUS, TUBE_RADIUS, 32, 100);
    const bandMat = new THREE.MeshStandardMaterial({
      color: METAL_COLORS[metal] ?? 0xd4af37,
      metalness: 0.55,
      roughness: 0.28,
    });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.rotation.x = Math.PI / 2;
    scene.add(band);
    bandRef.current = band;

    // Main gem — sits on the front-top rim of the band, not floating above centre
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
    const gemGeo = buildGemGeometry(shape);
    const gem = new THREE.Mesh(gemGeo, gemMat);
    const s = CARAT_SCALE[carat] ?? 0.36;
    gem.scale.set(s, s, s);
    gem.position.set(0, TUBE_RADIUS + s * 0.55, TORUS_RADIUS - TUBE_RADIUS * 0.3);
    scene.add(gem);
    gemRef.current = gem;

    // Accent material for small halo/eternity/side stones
    const accentMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, transmission: 0.85, roughness: 0.1, thickness: 0.3, ior: 2.2, clearcoat: 1,
    });
    accentMatRef.current = accentMat;

    const decorGroup = new THREE.Group();
    scene.add(decorGroup);
    decorGroupRef.current = decorGroup;

    let frameId: number;
    const animate = () => {
      band.rotation.z += 0.005;
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
      accentMat.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Metal colour + gem size update
  useEffect(() => {
    if (bandRef.current) {
      (bandRef.current.material as THREE.MeshStandardMaterial).color.setHex(METAL_COLORS[metal] ?? 0xd4af37);
    }
    if (gemRef.current) {
      const s = CARAT_SCALE[carat] ?? 0.36;
      gemRef.current.scale.set(s, s, s);
      gemRef.current.position.set(0, TUBE_RADIUS + s * 0.55, TORUS_RADIUS - TUBE_RADIUS * 0.3);
    }
  }, [metal, carat]);

  // Gem shape update
  useEffect(() => {
    if (!gemRef.current) return;
    const oldGeo = gemRef.current.geometry;
    gemRef.current.geometry = buildGemGeometry(shape);
    oldGeo.dispose();
  }, [shape]);

  // Setting-style decoration: halo ring, side stones, eternity band stones
  useEffect(() => {
    const group = decorGroupRef.current;
    const accentMat = accentMatRef.current;
    if (!group || !accentMat) return;

    [...group.children].forEach((child) => {
      group.remove(child);
      if (child instanceof THREE.Mesh) child.geometry.dispose();
    });

    const s = CARAT_SCALE[carat] ?? 0.36;
    const smallGeo = new THREE.IcosahedronGeometry(1, 0);

    if (styles.includes("halo")) {
      const count = 12;
      const ringR = s * 1.35;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const m = new THREE.Mesh(smallGeo, accentMat);
        const size = s * 0.16;
        m.scale.set(size, size, size);
        m.position.set(Math.sin(a) * ringR, TUBE_RADIUS + s * 0.55, TORUS_RADIUS - TUBE_RADIUS * 0.3 + Math.cos(a) * ringR);
        group.add(m);
      }
    }

    if (styles.includes("three-stone")) {
      [-1, 1].forEach((dir) => {
        const m = new THREE.Mesh(smallGeo, accentMat);
        const size = s * 0.5;
        m.scale.set(size, size, size);
        m.position.set(dir * s * 1.6, TUBE_RADIUS + size * 0.55, TORUS_RADIUS - TUBE_RADIUS * 0.3);
        group.add(m);
      });
    }

    if (styles.includes("eternity")) {
      const count = 24;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const m = new THREE.Mesh(smallGeo, accentMat);
        const size = 0.09;
        m.scale.set(size, size, size);
        m.position.set(Math.sin(a) * TORUS_RADIUS, TUBE_RADIUS * 0.6, Math.cos(a) * TORUS_RADIUS);
        group.add(m);
      }
    }
  }, [styles, carat]);

  return (
    <div>
      <div ref={mountRef} className="w-full aspect-square bg-black/5" />
      <p className="text-[11px] text-ink/40 mt-2 text-center">
        Illustrative preview of the selected shape, metal tone, setting details, and approximate
        stone size — not a photorealistic render.
      </p>
    </div>
  );
}
