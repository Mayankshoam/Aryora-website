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
}

export default function RingPreview({ metal, carat }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const gemRef = useRef<THREE.Mesh | null>(null);
  const bandRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientWidth;

    const scene = new THREE.Scene();
    scene.background = null;

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

    const gemGeo = new THREE.OctahedronGeometry(1, 0);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      roughness: 0.05,
      metalness: 0,
      thickness: 0.5,
      ior: 2.4,
      clearcoat: 1,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    const s = CARAT_SCALE[carat] ?? 0.5;
    gem.scale.set(s, s, s);
    gem.position.set(0, 1 + s * 0.5, 0);
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

  useEffect(() => {
    if (bandRef.current) {
      (bandRef.current.material as THREE.MeshStandardMaterial).color.setHex(METAL_COLORS[metal] ?? 0xd4af37);
    }
    if (gemRef.current) {
      const s = CARAT_SCALE[carat] ?? 0.5;
      gemRef.current.scale.set(s, s, s);
      gemRef.current.position.y = 1 + s * 0.5;
    }
  }, [metal, carat]);

  return (
    <div>
      <div ref={mountRef} className="w-full aspect-square bg-black/5" />
      <p className="text-[11px] text-ink/40 mt-2 text-center">
        Illustrative preview — reflects metal tone and approximate stone size, not the exact setting style.
      </p>
    </div>
  );
}
