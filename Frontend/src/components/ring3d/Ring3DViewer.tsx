"use client";

import React, { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { RingConfig, METAL_COLORS, INDIAN_RING_SIZES, ViewName, DEFAULT_CONFIG } from './types';
import { makeStudioEnvTexture } from './studioEnv';
import { createDiamondGeometry } from './diamondGeometry';
import {
  getHeadLayout,
  createRingBandGeometry,
  createProngsGeometry,
  createGalleryRailGeometry,
  createHaloGeometry,
  createShoulderPaveGeometry,
} from './ringGeometry';
import { RotateCw, Sparkles, Sun, Moon, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export interface Ring3DViewerProps {
  config?: RingConfig;
  className?: string;
}

function SceneContent({
  config = DEFAULT_CONFIG,
  isDark = false,
}: {
  config: RingConfig;
  isDark?: boolean;
}) {
  const envTexture = useMemo(() => makeStudioEnvTexture(512, 256), []);

  const innerDiameter = INDIAN_RING_SIZES[config.indianSize] || 16.6;

  // 1. Calculate unified CAD layout with millimeter precision
  const layout = useMemo(
    () => getHeadLayout(config.shape, config.carat, innerDiameter),
    [config.shape, config.carat, innerDiameter]
  );

  // 2. Band Geometry
  const bandGeometry = useMemo(
    () => createRingBandGeometry(config.style, innerDiameter),
    [config.style, innerDiameter]
  );

  // 3. Jewelcraft Tapered Claws Setting with Domed Tips (_dome)
  const prongsGeometry = useMemo(
    () => createProngsGeometry(config.shape, config.carat, layout),
    [config.shape, config.carat, layout]
  );

  // 4. Under-Bezel Gallery Rail & Open Collet Basket
  const galleryGeometry = useMemo(
    () => createGalleryRailGeometry(config.shape, config.carat, layout),
    [config.shape, config.carat, layout]
  );

  // 5. Halo Setting (Hidden Halo or Single Halo)
  const haloData = useMemo(
    () => createHaloGeometry(config.shape, config.carat, config.halo, layout),
    [config.shape, config.carat, config.halo, layout]
  );

  // 6. Shoulder Pavé Micro-Diamonds & Retaining Beads
  const paveData = useMemo(
    () => createShoulderPaveGeometry(config.side, innerDiameter),
    [config.side, innerDiameter]
  );

  // 7. Center Faceted Diamond Geometry (Tolkowsky Standard)
  const diamondGeometry = useMemo(
    () => createDiamondGeometry(config.shape, config.carat),
    [config.shape, config.carat]
  );

  // Metal materials calibrated to fine jewelry atelier alloys
  const metalData = METAL_COLORS[config.metal] || METAL_COLORS.yellow;
  const metalHex = config.karat === 18 ? metalData[18] : metalData[14];

  return (
    <group>
      <primitive object={envTexture} attach="environment" />

      <Center top>
        <group>
          {/* Main Comfort-Fit D-Profile Band */}
          <mesh geometry={bandGeometry} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={metalHex}
              metalness={0.98}
              roughness={metalData.roughness}
              clearcoat={0.35}
              clearcoatRoughness={0.08}
              envMap={envTexture}
              envMapIntensity={isDark ? 2.6 : 2.2}
            />
          </mesh>

          {/* Jewelcraft Tapered Claws with Domed Spherical Caps */}
          <mesh geometry={prongsGeometry} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={metalHex}
              metalness={0.98}
              roughness={metalData.roughness}
              clearcoat={0.35}
              clearcoatRoughness={0.08}
              envMap={envTexture}
              envMapIntensity={isDark ? 2.6 : 2.2}
            />
          </mesh>

          {/* Under-Bezel Gallery Rail & Collet Basket Wires */}
          <mesh geometry={galleryGeometry} castShadow receiveShadow>
            <meshPhysicalMaterial
              color={metalHex}
              metalness={0.98}
              roughness={metalData.roughness}
              clearcoat={0.35}
              clearcoatRoughness={0.08}
              envMap={envTexture}
              envMapIntensity={isDark ? 2.6 : 2.2}
            />
          </mesh>

          {/* Halo Setting (Hidden Halo or Single Halo) */}
          {haloData && (
            <>
              <mesh geometry={haloData.diamondGeo} castShadow>
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
                  side={THREE.DoubleSide}
                  envMap={envTexture}
                  envMapIntensity={2.8}
                />
              </mesh>
              <mesh geometry={haloData.metalGeo} castShadow>
                <meshPhysicalMaterial
                  color={metalHex}
                  metalness={0.98}
                  roughness={metalData.roughness}
                  envMap={envTexture}
                  envMapIntensity={2.4}
                />
              </mesh>
            </>
          )}

          {/* Shoulder Pavé Accent Stones & Beads */}
          {paveData && (
            <>
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
                  side={THREE.DoubleSide}
                  envMap={envTexture}
                  envMapIntensity={2.8}
                />
              </mesh>
              <mesh geometry={paveData.beadGeo} castShadow>
                <meshPhysicalMaterial
                  color={metalHex}
                  metalness={0.98}
                  roughness={metalData.roughness}
                  envMap={envTexture}
                  envMapIntensity={2.4}
                />
              </mesh>
            </>
          )}

          {/* Center Solitaire: True CAD Faceted Gemstone positioned with millimeter precision */}
          <mesh
            geometry={diamondGeometry}
            position={[0, layout.girdleY, 0]}
            castShadow
          >
            <meshPhysicalMaterial
              roughness={0.0}
              transmission={1.0}
              thickness={1.5}
              ior={2.417}
              dispersion={0.044}
              specularIntensity={1.0}
              specularColor="#ffffff"
              color="#ffffff"
              transparent
              side={THREE.DoubleSide}
              envMap={envTexture}
              envMapIntensity={isDark ? 3.2 : 2.8}
            />
          </mesh>
        </group>
      </Center>

      {/* Ground Pedestal Contact Shadow */}
      <ContactShadows
        position={[0, -0.06, 0]}
        opacity={isDark ? 0.45 : 0.28}
        scale={6.5}
        blur={2.2}
        far={3.8}
      />
    </group>
  );
}

export default function Ring3DViewer({
  config = DEFAULT_CONFIG,
  className = '',
}: Ring3DViewerProps) {
  const controlsRef = useRef<any>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [activeView, setActiveView] = useState<ViewName>('angle');
  const [isDarkTheme, setIsDarkTheme] = useState(false); // Default to clean luxury light atelier

  const setCameraView = (view: ViewName) => {
    setActiveView(view);
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    switch (view) {
      case 'top':
        ctrl.object.position.set(0, 4.3, 0.01);
        break;
      case 'front':
        ctrl.object.position.set(0, 0.5, 3.8);
        break;
      case 'profile':
        ctrl.object.position.set(3.8, 0.5, 0);
        break;
      case 'angle':
      default:
        ctrl.object.position.set(2.6, 2.2, 2.6);
        break;
    }
    ctrl.target.set(0, 0.6, 0);
    ctrl.update();
  };

  const handleZoom = (delta: number) => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    camera.position.multiplyScalar(delta);
    controlsRef.current.update();
  };

  return (
    <div
      className={`relative w-full h-[520px] sm:h-[580px] lg:h-[620px] rounded-3xl overflow-hidden transition-colors duration-500 border select-none ${
        isDarkTheme
          ? 'bg-gradient-to-b from-[#13151f] via-[#0d0e15] to-[#07080c] border-white/10 shadow-2xl'
          : 'bg-gradient-to-b from-[#FFFFFF] via-[#FAF7F2] to-[#F3EEE6] border-[#E8E2D8] shadow-lg'
      } ${className}`}
    >
      <Canvas
        camera={{ position: [2.6, 2.2, 2.6], fov: 40 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isDarkTheme ? 1.2 : 1.05,
        }}
      >
        <ambientLight intensity={isDarkTheme ? 0.75 : 0.9} />
        <directionalLight position={[6, 12, 6]} intensity={isDarkTheme ? 2.2 : 1.8} castShadow />
        <directionalLight position={[-6, -4, -6]} intensity={0.6} />
        <directionalLight position={[0, 8, -6]} intensity={1.2} />
        <directionalLight position={[0, 2, 8]} intensity={0.9} />
        <SceneContent config={config} isDark={isDarkTheme} />
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
      <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10 flex-wrap">
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
              className={`px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                isActive
                  ? isDarkTheme
                    ? 'bg-white text-[#111111] shadow-md border border-white'
                    : 'bg-[#0E382B] text-white shadow-md border border-[#0E382B]'
                  : isDarkTheme
                  ? 'bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/10'
                  : 'bg-white/80 hover:bg-white text-[#444444] hover:text-[#111111] border border-[#E5E0D8] shadow-2xs'
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Top Right: Studio Theme & Auto Rotate */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {/* Auto Rotate Button */}
        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium tracking-wider rounded-xl backdrop-blur-md transition-all cursor-pointer ${
            autoRotate
              ? 'bg-[#108474] text-white border border-[#108474] shadow-sm'
              : isDarkTheme
              ? 'bg-black/40 hover:bg-black/60 text-white/80 border border-white/10'
              : 'bg-white/80 hover:bg-white text-[#444444] border border-[#E5E0D8] shadow-2xs'
          }`}
          title="Toggle Auto Rotation"
        >
          <RotateCw size={12} className={autoRotate ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">{autoRotate ? 'Spinning' : 'Auto Rotate'}</span>
        </button>

        {/* Studio Theme Switcher */}
        <button
          type="button"
          onClick={() => setIsDarkTheme((prev) => !prev)}
          className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
            isDarkTheme
              ? 'bg-black/40 hover:bg-black/60 text-[#F3C569] border border-white/10'
              : 'bg-white/80 hover:bg-white text-[#0E382B] border border-[#E5E0D8] shadow-2xs'
          }`}
          title={isDarkTheme ? 'Switch to Light Atelier Studio' : 'Switch to Dark Velvet Vault'}
          aria-label="Toggle 3D lighting theme"
        >
          {isDarkTheme ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Bottom Right: Quick Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
        <button
          type="button"
          onClick={() => handleZoom(0.85)}
          className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
            isDarkTheme
              ? 'bg-black/50 hover:bg-black/70 text-white/80 border border-white/10'
              : 'bg-white/90 hover:bg-white text-[#333333] border border-[#E5E0D8] shadow-xs'
          }`}
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(1.15)}
          className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
            isDarkTheme
              ? 'bg-black/50 hover:bg-black/70 text-white/80 border border-white/10'
              : 'bg-white/90 hover:bg-white text-[#333333] border border-[#E5E0D8] shadow-xs'
          }`}
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          type="button"
          onClick={() => setCameraView('angle')}
          className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
            isDarkTheme
              ? 'bg-black/50 hover:bg-black/70 text-white/80 border border-white/10'
              : 'bg-white/90 hover:bg-white text-[#333333] border border-[#E5E0D8] shadow-xs'
          }`}
          title="Reset Camera"
          aria-label="Reset Camera"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Bottom Center: Interactive Hint & Diamond Badge */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase backdrop-blur-sm flex items-center gap-1.5 border ${
            isDarkTheme
              ? 'bg-black/40 text-white/70 border-white/10'
              : 'bg-white/90 text-[#0E382B] border-[#E0D9CD] shadow-2xs'
          }`}
        >
          <Sparkles size={11} className="text-[#C5A880]" />
          <span>Jewelcraft CAD · Tolkowsky 57F</span>
        </span>
      </div>
    </div>
  );
}
