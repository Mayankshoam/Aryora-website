"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Eye,
  Camera,
  Layers,
} from "lucide-react";
import {
  BandStyle,
  CameraPreset,
  CARAT_PRESETS,
  CrownSetting,
  DiamondShape,
  DIAMOND_SHAPES,
  MetalKey,
  METALS,
  SideSetting,
} from "./types";
import { getProceduralStudioEnv } from "./studioEnv";
import { getDiamondGeometry } from "./diamondGeometry";
import {
  buildHaloGroup,
  buildProngsGroup,
  buildRingShankGeometry,
  buildSideStonesGroup,
} from "./ringGeometry";

export interface Ring3DViewerProps {
  metal?: MetalKey | string;
  karat?: string;
  shape?: DiamondShape | string;
  carat?: number | string;
  bandStyle?: BandStyle | string;
  ringStyle?: BandStyle | string; // Alias for bandStyle
  sideSetting?: SideSetting | string;
  crownSetting?: CrownSetting | string;
  ringSize?: number | string;
  prongsCount?: 4 | 6;
  className?: string;
}

function normalizeMetalKey(metal?: string, karat?: string): MetalKey {
  const m = (metal || "").toUpperCase();
  const k = (karat || "18").toUpperCase();
  const is14K = k.includes("14");

  if (m.includes("SILVER") || m.includes("925")) return "SILVER_925";
  if (m.includes("PLATINUM") || m.includes("950")) return "PLATINUM_950";
  if (m.includes("WHITE")) return is14K ? "WHITE_GOLD_14K" : "WHITE_GOLD_18K";
  if (m.includes("ROSE")) return is14K ? "ROSE_GOLD_14K" : "ROSE_GOLD_18K";
  return is14K ? "YELLOW_GOLD_14K" : "YELLOW_GOLD_18K";
}

function normalizeShape(shape?: string): DiamondShape {
  const s = (shape || "").toLowerCase();
  if (s.includes("oval")) return "oval";
  if (s.includes("princess")) return "princess";
  if (s.includes("asscher")) return "asscher";
  if (s.includes("emerald")) return "emerald";
  if (s.includes("cushion")) return "cushion";
  if (s.includes("radiant")) return "radiant";
  if (s.includes("pear")) return "pear";
  if (s.includes("marquise")) return "marquise";
  return "round";
}

function normalizeBandStyle(style?: string): BandStyle {
  const s = (style || "").toLowerCase();
  if (s.includes("cathedral")) return "cathedral";
  if (s.includes("twist")) return "twist";
  if (s.includes("two") || s.includes("row")) return "two-row";
  if (s.includes("split")) return "split";
  if (s.includes("pinch")) return "pinch";
  return "classic";
}

function normalizeSideSetting(setting?: string): SideSetting {
  const s = (setting || "").toLowerCase();
  if (s.includes("pave") || s.includes("pavé")) return "pave";
  if (s.includes("channel")) return "channel";
  if (s.includes("prong")) return "prong";
  return "plain";
}

function normalizeCrownSetting(setting?: string): CrownSetting {
  const s = (setting || "").toLowerCase();
  if (s.includes("hidden")) return "hidden-halo";
  if (s.includes("halo")) return "halo";
  return "none";
}

function normalizeCarat(carat?: number | string): number {
  if (typeof carat === "number") return carat;
  const parsed = parseFloat(String(carat || "").replace(/[^0-9.]/g, ""));
  return !isNaN(parsed) && parsed > 0 ? parsed : 1.5;
}

// ---------------------------------------------------------------------------
// Internal Procedural Environment Setup inside Three Canvas
// ---------------------------------------------------------------------------
function StudioLightingEnvironment() {
  const { scene, gl } = useThree();

  useEffect(() => {
    // Generate and apply zero-network procedural HDR studio environment
    const envMap = getProceduralStudioEnv(gl);
    scene.environment = envMap;

    // Neutral luxury atelier background
    scene.background = new THREE.Color(0xfaf8f5);
  }, [scene, gl]);

  return (
    <>
      {/* Key Studio Softbox */}
      <directionalLight
        position={[4, 7, 5]}
        intensity={3.4}
        color="#fffaf0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />
      {/* Cool Fill Light for metallic specular separation */}
      <directionalLight position={[-4.5, 3.5, 3]} intensity={2.0} color="#edf4ff" />
      {/* Diamond Sparkle Target Spotlight */}
      <spotLight
        position={[0, 6, 1.2]}
        target-position={[0, 1.2, 0]}
        intensity={4.8}
        angle={Math.PI / 6}
        penumbra={0.25}
        color="#ffffff"
      />
      {/* Back Rim Light */}
      <directionalLight position={[0, -1, -4.5]} intensity={1.8} color="#ffffff" />
      {/* Ambient Base */}
      <ambientLight intensity={0.7} color="#ffffff" />
    </>
  );
}

// ---------------------------------------------------------------------------
// 3D Procedural Ring Mesh Assembly Component
// ---------------------------------------------------------------------------
interface RingAssemblyProps {
  metal: MetalKey;
  shape: DiamondShape;
  carat: number;
  bandStyle: BandStyle;
  sideSetting: SideSetting;
  crownSetting: CrownSetting;
  prongsCount: 4 | 6;
  isAutoRotating: boolean;
}

function RingAssembly({
  metal,
  shape,
  carat,
  bandStyle,
  sideSetting,
  crownSetting,
  prongsCount,
  isAutoRotating,
}: RingAssemblyProps) {
  const ringGroupRef = useRef<THREE.Group>(null);

  // Metal Material parameters
  const metalProp = METALS[metal] || METALS.YELLOW_GOLD_18K;

  // Carat scale calculation
  const caratKey = carat.toFixed(2);
  const caratScale = (CARAT_PRESETS[caratKey] || CARAT_PRESETS["1.50"]).scale;

  // Diamond & Band Geometries
  const diamondGeo = useMemo(() => getDiamondGeometry(shape), [shape]);
  const shankGeo = useMemo(() => buildRingShankGeometry(bandStyle), [bandStyle]);

  // Prongs, Halo, and Side Stones groups
  const prongsGroup = useMemo(
    () => buildProngsGroup(shape, prongsCount, caratScale),
    [shape, prongsCount, caratScale]
  );
  const haloGroup = useMemo(
    () => buildHaloGroup(shape, crownSetting, caratScale),
    [shape, crownSetting, caratScale]
  );
  const sideStonesGroup = useMemo(
    () => buildSideStonesGroup(sideSetting),
    [sideSetting]
  );

  // Apply metal material to prongs and halo rim
  useEffect(() => {
    const metalMat = new THREE.MeshStandardMaterial({
      color: metalProp.color,
      metalness: metalProp.metalness,
      roughness: metalProp.roughness,
      envMapIntensity: metalProp.envMapIntensity,
    });

    const diamondMicroMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      roughness: 0.0,
      ior: 2.417,
      thickness: 1.2,
      dispersion: 0.044,
      envMapIntensity: 3.5,
    });

    prongsGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = metalMat;
        child.castShadow = true;
      }
    });

    haloGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry instanceof THREE.TubeGeometry) {
          child.material = metalMat;
        } else {
          child.material = diamondMicroMat;
        }
        child.castShadow = true;
      }
    });

    sideStonesGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = diamondMicroMat;
        child.castShadow = true;
      }
    });
  }, [prongsGroup, haloGroup, sideStonesGroup, metalProp]);

  // Gentle 360 showroom auto-rotation
  useFrame((_, delta) => {
    if (isAutoRotating && ringGroupRef.current) {
      ringGroupRef.current.rotation.y += delta * 0.45;
    }
  });

  const headBaseY = 1.05;
  const diamondCenterY = headBaseY + caratScale * 0.38;

  return (
    <group
      ref={ringGroupRef}
      rotation={[-Math.PI * 0.12, Math.PI * 0.18, 0]}
      position={[0, 0, 0]}
    >
      {/* 1. Procedural Precious Metal Ring Shank */}
      <mesh geometry={shankGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={metalProp.color}
          metalness={metalProp.metalness}
          roughness={metalProp.roughness}
          envMapIntensity={metalProp.envMapIntensity}
        />
      </mesh>

      {/* 2. Optical Transmission Solitaire Center Diamond */}
      <mesh
        geometry={diamondGeo}
        scale={[caratScale, caratScale, caratScale]}
        position={[0, diamondCenterY, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1.0}
          opacity={1.0}
          roughness={0.0}
          ior={2.417}
          thickness={2.4}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          dispersion={0.044}
          specularIntensity={1.0}
          specularColor="#ffffff"
          envMapIntensity={3.6}
        />
      </mesh>

      {/* Internal Facet Core to enhance multi-reflection sparkle */}
      <mesh
        geometry={diamondGeo}
        scale={[caratScale * 0.96, caratScale * 0.96, caratScale * 0.96]}
        position={[0, diamondCenterY, 0]}
      >
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.85}
          roughness={0.05}
          wireframe
          transparent
          opacity={0.16}
        />
      </mesh>

      {/* 3. Prongs & Collet Basket */}
      <primitive object={prongsGroup} />

      {/* 4. Halo & Hidden Halo Micro-Diamonds */}
      <primitive object={haloGroup} />

      {/* 5. Shoulder Side Stones */}
      <primitive object={sideStonesGroup} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main Exported Ring3DViewer Canvas Component
// ---------------------------------------------------------------------------
export default function Ring3DViewer({
  metal = "YELLOW_GOLD_18K",
  karat,
  shape = "round",
  carat = 1.5,
  bandStyle = "classic",
  ringStyle,
  sideSetting = "plain",
  crownSetting = "none",
  ringSize = 12,
  prongsCount = 4,
  className = "",
}: Ring3DViewerProps) {
  const normMetal = normalizeMetalKey(metal, karat);
  const normShape = normalizeShape(shape);
  const normCarat = normalizeCarat(carat);
  const normBandStyle = normalizeBandStyle(bandStyle || ringStyle);
  const normSideSetting = normalizeSideSetting(sideSetting);
  const normCrownSetting = normalizeCrownSetting(crownSetting);

  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [activePreset, setActivePreset] = useState<CameraPreset>("perspective");
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const metalInfo = METALS[normMetal] || METALS.YELLOW_GOLD_18K;
  const shapeInfo = DIAMOND_SHAPES[normShape] || DIAMOND_SHAPES.round;
  const caratKey = normCarat.toFixed(2);
  const caratInfo = CARAT_PRESETS[caratKey] || CARAT_PRESETS["1.50"];

  // Camera Presets handler
  const setCameraPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    const controls = controlsRef.current;
    if (!controls) return;

    setIsAutoRotating(preset === "360");

    switch (preset) {
      case "360":
      case "perspective":
        controls.object.position.set(0, 1.8, 4.4);
        controls.target.set(0, 0.15, 0);
        break;
      case "top":
        controls.object.position.set(0, 4.8, 0.01);
        controls.target.set(0, 0.2, 0);
        break;
      case "side":
        controls.object.position.set(4.8, 0.5, 0);
        controls.target.set(0, 0.15, 0);
        break;
      case "front":
        controls.object.position.set(0, 0.4, 4.8);
        controls.target.set(0, 0.15, 0);
        break;
    }
    controls.update();
  };

  const handleZoom = (direction: "in" | "out") => {
    const controls = controlsRef.current;
    if (!controls) return;
    const factor = direction === "in" ? 0.82 : 1.22;
    controls.object.position.multiplyScalar(factor);
    controls.update();
  };

  const handleReset = () => {
    setCameraPreset("perspective");
    setIsAutoRotating(true);
  };

  return (
    <div
      className={`relative w-full h-full min-h-[460px] sm:min-h-[560px] lg:min-h-[640px] bg-[#FAF8F5] rounded-3xl overflow-hidden border border-[#E8E2D8] shadow-sm select-none ${className}`}
    >
      {/* 1. Real-Time 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 1.8, 4.4], fov: 35, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.35,
          powerPreference: "high-performance",
        }}
        shadows
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <StudioLightingEnvironment />

        <RingAssembly
          metal={normMetal}
          shape={normShape}
          carat={normCarat}
          bandStyle={normBandStyle}
          sideSetting={normSideSetting}
          crownSetting={normCrownSetting}
          prongsCount={prongsCount}
          isAutoRotating={isAutoRotating}
        />

        {/* Studio Ground Contact Shadow */}
        <ContactShadows
          position={[0, -0.92, 0]}
          opacity={0.35}
          scale={5.0}
          blur={1.8}
          far={2.5}
        />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={2.2}
          maxDistance={7.0}
          target={[0, 0.15, 0]}
          onChange={() => {
            if (isAutoRotating && activePreset !== "360") {
              setIsAutoRotating(false);
            }
          }}
        />
      </Canvas>

      {/* 2. Top Status HUD Badge (Miss Jo Luxury Minimal Aesthetic) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-md border border-[#E5E0D8] px-3.5 py-1.5 rounded-full shadow-2xs flex items-center gap-2 text-[11px] font-medium text-[#111111]">
          <span
            className="w-2.5 h-2.5 rounded-full shadow-2xs"
            style={{ backgroundColor: metalInfo.hex }}
          />
          <span className="font-semibold">{shapeInfo.label}</span>
          <span className="text-[#888888]">·</span>
          <span>{caratInfo.label}</span>
          <span className="text-[#888888]">·</span>
          <span className="text-[#0E382B]">{metalInfo.label}</span>
        </div>
      </div>

      {/* 3. Top Right Action Controls (Auto-Rotate, Zoom, Reset) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          title={isAutoRotating ? "Pause 360° rotation" : "Start 360° auto-rotation"}
          className={`p-2.5 rounded-full border shadow-2xs transition-all cursor-pointer ${
            isAutoRotating
              ? "bg-[#0E382B] text-white border-[#0E382B]"
              : "bg-white/90 text-[#444444] border-[#E5E0D8] hover:bg-white hover:text-[#111111]"
          }`}
        >
          <RotateCw size={15} className={isAutoRotating ? "animate-spin" : ""} />
        </button>

        <button
          type="button"
          onClick={() => handleZoom("in")}
          title="Zoom In"
          className="p-2.5 rounded-full bg-white/90 hover:bg-white text-[#444444] hover:text-[#111111] border border-[#E5E0D8] shadow-2xs transition-all cursor-pointer"
        >
          <ZoomIn size={15} />
        </button>

        <button
          type="button"
          onClick={() => handleZoom("out")}
          title="Zoom Out"
          className="p-2.5 rounded-full bg-white/90 hover:bg-white text-[#444444] hover:text-[#111111] border border-[#E5E0D8] shadow-2xs transition-all cursor-pointer"
        >
          <ZoomOut size={15} />
        </button>

        <button
          type="button"
          onClick={handleReset}
          title="Reset View"
          className="p-2.5 rounded-full bg-white/90 hover:bg-white text-[#444444] hover:text-[#111111] border border-[#E5E0D8] shadow-2xs transition-all cursor-pointer"
        >
          <Maximize2 size={15} />
        </button>
      </div>

      {/* 4. Bottom Camera Preset View Switcher Pills */}
      <div className="absolute bottom-4 inset-x-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-[#E5E0D8] p-1 rounded-2xl shadow-sm pointer-events-auto">
          {(
            [
              { id: "perspective", label: "Perspective" },
              { id: "360", label: "360°" },
              { id: "top", label: "Top" },
              { id: "side", label: "Profile" },
              { id: "front", label: "Front" },
            ] as const
          ).map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setCameraPreset(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0E382B] text-white shadow-2xs"
                    : "text-[#666666] hover:text-[#111111] hover:bg-stone-100/70"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#666666] bg-white/80 backdrop-blur-md border border-[#E5E0D8] px-3 py-1.5 rounded-xl shadow-2xs pointer-events-auto">
          <Eye size={12} className="text-[#C5A880]" />
          <span>Interactive 3D Stage · Drag to rotate · Pinch to zoom</span>
        </div>
      </div>
    </div>
  );
}
