"use client";

import React, { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { RingConfig, METAL_COLORS, INDIAN_RING_SIZES, ViewName, DEFAULT_CONFIG } from './types';
import { makeStudioEnvTexture } from './studioEnv';
import { createDiamondGeometry } from './diamondGeometry';
import {
  createRingBandGeometry,
  createProngsGeometry,
  createGalleryRailGeometry,
  createShoulderPaveGeometry,
} from './ringGeometry';
import { RotateCw, Sparkles } from 'lucide-react';

export interface Ring3DViewerProps {
  config?: RingConfig;
}

function SceneContent({
  config = DEFAULT_CONFIG,
  autoRotate = false,
}: {
  config: RingConfig;
  autoRotate?: boolean;
}) {
  const envTexture = useMemo(() => makeStudioEnvTexture(512, 256), []);

  const innerDiameter = INDIAN_RING_SIZES[config.indianSize] || 16.6;
  const bandRadius = (innerDiameter / 2) * 0.1;
  const headBaseY = bandRadius + 0.085;

  // 1. Band Geometry
  const bandGeometry = useMemo(
    () => createRingBandGeometry(config.style, innerDiameter),
    [config.style, innerDiameter]
  );

  // 2. Jewelcraft Tapered Claws Setting with Domed Tips (_dome)
  const prongsGeometry = useMemo(
    () => createProngsGeometry(config.shape, config.carat, headBaseY),
    [config.shape, config.carat, headBaseY]
  );

  // 3. Under-Bezel Gallery Rail & Collet Basket
  const galleryGeometry = useMemo(
    () => createGalleryRailGeometry(config.shape, config.carat, headBaseY),
    [config.shape, config.carat, headBaseY]
  );

  // 4. Shoulder Pavé Micro-Diamonds & Beads (if active)
  const paveData = useMemo(
    () => createShoulderPaveGeometry(config.side, innerDiameter),
    [config.side, innerDiameter]
  );

  // 5. Center Faceted Diamond Geometry
  const diamondGeometry = useMemo(
    () => createDiamondGeometry(config.shape, config.carat),
    [config.shape, config.carat]
  );

  // Gem vertical placement: aligned right at the prong girdle level
  const gemY = headBaseY + Math.cbrt(config.carat) * 0.28;

  // Metal materials calibrated to fine jewelry atelier alloys
  const metalData = METAL_COLORS[config.metal] || METAL_COLORS.yellow;
  const metalHex = config.karat === 18 ? metalData[18] : metalData[14];

  return (
    <group>
      <primitive object={envTexture} attach="environment" />

      <Center top>
        <group>
          {/* Main D-Profile Band */}
          <mesh geometry={bandGeometry} castShadow receiveShadow>
            <meshStandardMaterial
              color={metalHex}
              metalness={0.98}
              roughness={metalData.roughness}
              envMap={envTexture}
              envMapIntensity={2.4}
            />
          </mesh>

          {/* Jewelcraft Tapered Claws with Domed Spherical Caps */}
          <mesh geometry={prongsGeometry} castShadow receiveShadow>
            <meshStandardMaterial
              color={metalHex}
              metalness={0.98}
              roughness={metalData.roughness}
              envMap={envTexture}
              envMapIntensity={2.4}
            />
          </mesh>

          {/* Under-Bezel Gallery Rail & Collet Basket Wires */}
          <mesh geometry={galleryGeometry} castShadow receiveShadow>
            <meshStandardMaterial
              color={metalHex}
              metalness={0.98}
              roughness={metalData.roughness}
              envMap={envTexture}
              envMapIntensity={2.4}
            />
          </mesh>

          {/* Shoulder Pavé Accent Stones & Beads */}
          {paveData && (
            <>
              {/* Micro-Diamonds */}
              <mesh geometry={paveData.diamondGeo} castShadow>
                <meshPhysicalMaterial
                  roughness={0.0}
                  transmission={1.0}
                  thickness={0.8}
                  ior={2.417}
                  dispersion={0.044}
                  specularIntensity={1.0}
                  specularColor="#ffffff"
                  color="#ffffff"
                  transparent
                  envMap={envTexture}
                  envMapIntensity={2.6}
                />
              </mesh>
              {/* Pavé Retaining Micro Beads */}
              <mesh geometry={paveData.beadGeo} castShadow>
                <meshStandardMaterial
                  color={metalHex}
                  metalness={0.98}
                  roughness={metalData.roughness}
                  envMap={envTexture}
                  envMapIntensity={2.4}
                />
              </mesh>
            </>
          )}

          {/* Center Solitaire: True CAD Faceted Gemstone with Optical Refraction & Dispersion Fire */}
          <mesh
            geometry={diamondGeometry}
            position={[0, gemY, 0]}
            castShadow
          >
            <meshPhysicalMaterial
              roughness={0.0}
              transmission={1.0}
              thickness={1.4}
              ior={2.417}
              dispersion={0.044}
              specularIntensity={1.0}
              specularColor="#ffffff"
              color="#ffffff"
              transparent
              envMap={envTexture}
              envMapIntensity={2.8}
            />
          </mesh>
        </group>
      </Center>

      {/* Ground Contact Shadow */}
      <ContactShadows
        position={[0, -0.06, 0]}
        opacity={0.48}
        scale={6.5}
        blur={2.2}
        far={3.8}
      />
    </group>
  );
}

export default function Ring3DViewer({ config = DEFAULT_CONFIG }: Ring3DViewerProps) {
  const controlsRef = useRef<any>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [activeView, setActiveView] = useState<ViewName>('angle');

  const setCameraView = (view: ViewName) => {
    setActiveView(view);
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    switch (view) {
      case 'top':
        ctrl.object.position.set(0, 4.2, 0.01);
        break;
      case 'front':
        ctrl.object.position.set(0, 0.6, 3.8);
        break;
      case 'profile':
        ctrl.object.position.set(3.8, 0.6, 0);
        break;
      case 'angle':
      default:
        ctrl.object.position.set(2.6, 2.2, 2.6);
        break;
    }
    ctrl.target.set(0, 0.6, 0);
    ctrl.update();
  };

  return (
    <div className="relative w-full h-[540px] bg-gradient-to-b from-[#0f1117] via-[#141724] to-[#0c0d13] rounded-2xl overflow-hidden border border-white/10 shadow-2xl select-none">
      <Canvas
        camera={{ position: [2.6, 2.2, 2.6], fov: 40 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[6, 12, 6]} intensity={2.0} castShadow />
        <directionalLight position={[-6, -4, -6]} intensity={0.6} />
        <directionalLight position={[0, 8, -6]} intensity={1.2} />
        <SceneContent config={config} autoRotate={autoRotate} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={1.8}
          maxDistance={6.0}
          autoRotate={autoRotate}
          autoRotateSpeed={1.8}
        />
      </Canvas>

      {/* Top Left: Camera Preset Views */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
        {[
          { label: '360°', view: 'angle' },
          { label: 'Top', view: 'top' },
          { label: 'Front', view: 'front' },
          { label: 'Profile', view: 'profile' },
        ].map((btn) => {
          const isActive = activeView === btn.view;
          return (
            <button
              key={btn.view}
              type="button"
              onClick={() => setCameraView(btn.view as ViewName)}
              className={`px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase rounded-lg backdrop-blur-md transition-all border cursor-pointer ${
                isActive
                  ? 'bg-white text-[#111111] border-white shadow-md'
                  : 'bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border-white/10'
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Top Right: Auto Rotate & Realism Pill */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium tracking-wider rounded-lg backdrop-blur-md transition-all border cursor-pointer ${
            autoRotate
              ? 'bg-[#108474] text-white border-[#108474]'
              : 'bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border-white/10'
          }`}
          title="Toggle Auto Rotation"
        >
          <RotateCw size={12} className={autoRotate ? 'animate-spin' : ''} />
          <span>{autoRotate ? 'Spinning' : 'Auto Rotate'}</span>
        </button>

        <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium tracking-wider bg-white/5 border border-white/10 text-white/70 rounded-lg backdrop-blur-md">
          <Sparkles size={11} className="text-[#F3C569]" />
          <span>Tolkowsky CAD 3D</span>
        </span>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-10">
        <span className="text-[10px] tracking-widest uppercase text-white/40 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
          Drag to orbit · Scroll to zoom
        </span>
      </div>
    </div>
  );
}
