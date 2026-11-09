"use client";

import React, { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { RingConfig, METAL_COLORS, INDIAN_RING_SIZES, ViewName, DEFAULT_CONFIG } from './types';
import { makeStudioEnvTexture } from './studioEnv';
import { createDiamondGeometry } from './diamondGeometry';
import { createRingBandGeometry } from './ringGeometry';

export interface Ring3DViewerProps {
  config?: RingConfig;
}

function SceneContent({ config = DEFAULT_CONFIG }: { config: RingConfig }) {
  const envTexture = useMemo(() => makeStudioEnvTexture(512, 256), []);

  const innerDiameter = INDIAN_RING_SIZES[config.indianSize] || 16.6;
  const bandRadius = (innerDiameter / 2) * 0.1;
  const headHeight = bandRadius + 0.14;

  const bandGeometry = useMemo(
    () => createRingBandGeometry(config.style, innerDiameter),
    [config.style, innerDiameter]
  );

  const diamondGeometry = useMemo(
    () => createDiamondGeometry(config.shape, config.carat),
    [config.shape, config.carat]
  );

  const metalData = METAL_COLORS[config.metal] || METAL_COLORS.yellow;
  const metalHex = config.karat === 18 ? metalData[18] : metalData[14];

  return (
    <group>
      <primitive object={envTexture} attach="environment" />

      <Center top>
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.15}>
          {/* Main Band */}
          <mesh geometry={bandGeometry} castShadow receiveShadow>
            <meshStandardMaterial
              color={metalHex}
              metalness={0.98}
              roughness={metalData.roughness}
              envMap={envTexture}
              envMapIntensity={2.0}
            />
          </mesh>

          {/* 4 Prongs Setting */}
          {[0, 1, 2, 3].map((idx) => {
            const angle = (idx * Math.PI) / 2 + Math.PI / 4;
            const spread = 0.24 * Math.cbrt(config.carat);
            return (
              <mesh
                key={idx}
                position={[
                  Math.cos(angle) * spread,
                  headHeight + 0.12,
                  Math.sin(angle) * spread,
                ]}
                rotation={[0, 0, (Math.cos(angle) * Math.PI) / 16]}
                castShadow
              >
                <cylinderGeometry args={[0.028, 0.035, 0.35, 16]} />
                <meshStandardMaterial
                  color={metalHex}
                  metalness={0.98}
                  roughness={metalData.roughness}
                  envMap={envTexture}
                  envMapIntensity={2.0}
                />
              </mesh>
            );
          })}

          {/* Center Gem with Refraction & Fire */}
          <mesh
            geometry={diamondGeometry}
            position={[0, headHeight + 0.22, 0]}
            castShadow
          >
            <meshPhysicalMaterial
              roughness={0.0}
              transmission={0.98}
              thickness={1.4}
              ior={2.417}
              dispersion={0.044}
              specularIntensity={1.0}
              specularColor={new THREE.Color('#ffffff')}
              color="#ffffff"
              transparent
              envMap={envTexture}
              envMapIntensity={2.4}
            />
          </mesh>
        </Float>
      </Center>

      <ContactShadows
        position={[0, -0.05, 0]}
        opacity={0.55}
        scale={6}
        blur={2.4}
        far={3.5}
      />
    </group>
  );
}

export default function Ring3DViewer({ config = DEFAULT_CONFIG }: Ring3DViewerProps) {
  const controlsRef = useRef<any>(null);

  const setCameraView = (view: ViewName) => {
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
    <div className="relative w-full h-[520px] bg-gradient-to-b from-[#0c0d12] to-[#161822] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <Canvas
        camera={{ position: [2.6, 2.2, 2.6], fov: 40 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 12, 6]} intensity={1.8} castShadow />
        <directionalLight position={[-6, -4, -6]} intensity={0.5} />
        <SceneContent config={config} />
        <OrbitControls ref={controlsRef} enablePan={false} minDistance={1.8} maxDistance={6.0} />
      </Canvas>

      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {[
          { label: '360°', view: 'angle' },
          { label: 'Top', view: 'top' },
          { label: 'Front', view: 'front' },
          { label: 'Profile', view: 'profile' },
        ].map((btn) => (
          <button
            key={btn.view}
            type="button"
            onClick={() => setCameraView(btn.view as ViewName)}
            className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md transition border border-white/10 cursor-pointer"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
