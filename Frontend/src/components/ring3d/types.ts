/**
 * 3D Ring Builder Configuration & Types
 * Standard Indian ring sizes, metal PBR definitions, diamond shapes, and facet ratios.
 */

export type DiamondShape =
  | "round"
  | "oval"
  | "princess"
  | "emerald"
  | "cushion"
  | "radiant"
  | "asscher"
  | "pear"
  | "marquise";

export type BandStyle =
  | "classic"
  | "cathedral"
  | "twist"
  | "split"
  | "two-row"
  | "pinch";

export type SideSetting = "plain" | "pave" | "channel" | "prong";

export type CrownSetting = "none" | "hidden-halo" | "halo";

export type MetalKey =
  | "YELLOW_GOLD_18K"
  | "YELLOW_GOLD_14K"
  | "WHITE_GOLD_18K"
  | "WHITE_GOLD_14K"
  | "ROSE_GOLD_18K"
  | "ROSE_GOLD_14K"
  | "SILVER_925"
  | "PLATINUM_950";

export type CameraPreset = "perspective" | "360" | "top" | "side" | "front";

export interface MetalProperties {
  id: MetalKey;
  label: string;
  purity: string;
  hex: string;
  color: number;
  metalness: number;
  roughness: number;
  envMapIntensity: number;
}

export interface DiamondShapeInfo {
  id: DiamondShape;
  label: string;
  aspectRatio: number; // length / width
  facetCount: number;
  tableRatio: number;
  depthRatio: number;
  girdleRatio: number;
  description: string;
}

export interface CaratInfo {
  carat: number;
  label: string;
  scale: number;
  diameterMm: number;
  dimensionsMm: string;
}

export interface IndianRingSize {
  size: number;
  innerDiameterMm: number;
  innerCircumferenceMm: number;
}

export interface RingConfig {
  metal: MetalKey;
  shape: DiamondShape;
  carat: number; // e.g. 1.0, 1.5, 2.0
  bandStyle: BandStyle;
  sideSetting: SideSetting;
  crownSetting: CrownSetting;
  ringSize: number; // Indian ring size, e.g. 12
  prongsCount?: 4 | 6;
  isAutoRotating?: boolean;
}

// ---------------------------------------------------------------------------
// 1. Precious Metal PBR Optical Properties
// ---------------------------------------------------------------------------
export const METALS: Record<MetalKey, MetalProperties> = {
  YELLOW_GOLD_18K: {
    id: "YELLOW_GOLD_18K",
    label: "18K Yellow Gold",
    purity: "750",
    hex: "#ECD078",
    color: 0xecd078,
    metalness: 0.98,
    roughness: 0.12,
    envMapIntensity: 2.2,
  },
  YELLOW_GOLD_14K: {
    id: "YELLOW_GOLD_14K",
    label: "14K Yellow Gold",
    purity: "585",
    hex: "#E8CA82",
    color: 0xe8ca82,
    metalness: 0.96,
    roughness: 0.14,
    envMapIntensity: 2.0,
  },
  WHITE_GOLD_18K: {
    id: "WHITE_GOLD_18K",
    label: "18K White Gold",
    purity: "750",
    hex: "#F2F4F8",
    color: 0xf2f4f8,
    metalness: 1.0,
    roughness: 0.08,
    envMapIntensity: 2.5,
  },
  WHITE_GOLD_14K: {
    id: "WHITE_GOLD_14K",
    label: "14K White Gold",
    purity: "585",
    hex: "#E8ECEF",
    color: 0xe8ecef,
    metalness: 0.98,
    roughness: 0.1,
    envMapIntensity: 2.3,
  },
  ROSE_GOLD_18K: {
    id: "ROSE_GOLD_18K",
    label: "18K Rose Gold",
    purity: "750",
    hex: "#E8AD96",
    color: 0xe8ad96,
    metalness: 0.98,
    roughness: 0.14,
    envMapIntensity: 2.2,
  },
  ROSE_GOLD_14K: {
    id: "ROSE_GOLD_14K",
    label: "14K Rose Gold",
    purity: "585",
    hex: "#E29F88",
    color: 0xe29f88,
    metalness: 0.96,
    roughness: 0.15,
    envMapIntensity: 2.0,
  },
  SILVER_925: {
    id: "SILVER_925",
    label: "925 Sterling Silver",
    purity: "925",
    hex: "#E5E8EC",
    color: 0xe5e8ec,
    metalness: 0.95,
    roughness: 0.11,
    envMapIntensity: 2.1,
  },
  PLATINUM_950: {
    id: "PLATINUM_950",
    label: "Platinum 950",
    purity: "Pt950",
    hex: "#F0F3F6",
    color: 0xf0f3f6,
    metalness: 1.0,
    roughness: 0.06,
    envMapIntensity: 2.6,
  },
};

// ---------------------------------------------------------------------------
// 2. Diamond Shapes & Accurate Optical Facet Ratios
// ---------------------------------------------------------------------------
export const DIAMOND_SHAPES: Record<DiamondShape, DiamondShapeInfo> = {
  round: {
    id: "round",
    label: "Round Brilliant",
    aspectRatio: 1.0,
    facetCount: 57,
    tableRatio: 0.57,
    depthRatio: 0.615,
    girdleRatio: 0.035,
    description: "Classic 57-facet Tolkowsky cut with optimal light refraction & fire",
  },
  oval: {
    id: "oval",
    label: "Oval Brilliant",
    aspectRatio: 1.42,
    facetCount: 57,
    tableRatio: 0.58,
    depthRatio: 0.63,
    girdleRatio: 0.035,
    description: "Elongated brilliant silhouette offering slender finger coverage",
  },
  princess: {
    id: "princess",
    label: "Princess Cut",
    aspectRatio: 1.0,
    facetCount: 49,
    tableRatio: 0.72,
    depthRatio: 0.74,
    girdleRatio: 0.04,
    description: "Square inverted pyramid with distinctive chevron pavilion facets",
  },
  emerald: {
    id: "emerald",
    label: "Emerald Cut",
    aspectRatio: 1.45,
    facetCount: 49,
    tableRatio: 0.65,
    depthRatio: 0.64,
    girdleRatio: 0.045,
    description: "Step-cut rectangular octagon with hall-of-mirrors planar flashes",
  },
  cushion: {
    id: "cushion",
    label: "Cushion Cut",
    aspectRatio: 1.08,
    facetCount: 58,
    tableRatio: 0.61,
    depthRatio: 0.66,
    girdleRatio: 0.04,
    description: "Pillow contour combining antique romantic curves with modern sparkle",
  },
  radiant: {
    id: "radiant",
    label: "Radiant Cut",
    aspectRatio: 1.28,
    facetCount: 70,
    tableRatio: 0.67,
    depthRatio: 0.68,
    girdleRatio: 0.04,
    description: "Step-cut cropped corners with an intense 70-facet brilliant pavilion",
  },
  asscher: {
    id: "asscher",
    label: "Asscher Cut",
    aspectRatio: 1.0,
    facetCount: 49,
    tableRatio: 0.64,
    depthRatio: 0.67,
    girdleRatio: 0.045,
    description: "Square step cut with dramatic high crown and windmill reflection pattern",
  },
  pear: {
    id: "pear",
    label: "Pear Cut",
    aspectRatio: 1.55,
    facetCount: 58,
    tableRatio: 0.58,
    depthRatio: 0.62,
    girdleRatio: 0.035,
    description: "Teardrop blending round brilliant base with tapered tip",
  },
  marquise: {
    id: "marquise",
    label: "Marquise Cut",
    aspectRatio: 1.85,
    facetCount: 58,
    tableRatio: 0.57,
    depthRatio: 0.61,
    girdleRatio: 0.04,
    description: "Navette boat-shaped silhouette with dramatic pointed extremities",
  },
};

// ---------------------------------------------------------------------------
// 3. Carat Weight Scales & Physical Millimeter Table
// ---------------------------------------------------------------------------
export const CARAT_PRESETS: Record<string, CaratInfo> = {
  "0.50": { carat: 0.5, label: "0.50 ct", scale: 0.4, diameterMm: 5.1, dimensionsMm: "5.1 × 5.1 mm" },
  "0.75": { carat: 0.75, label: "0.75 ct", scale: 0.46, diameterMm: 5.8, dimensionsMm: "5.8 × 5.8 mm" },
  "1.00": { carat: 1.0, label: "1.00 ct", scale: 0.52, diameterMm: 6.5, dimensionsMm: "6.5 × 6.5 mm" },
  "1.50": { carat: 1.5, label: "1.50 ct", scale: 0.6, diameterMm: 7.4, dimensionsMm: "7.4 × 7.4 mm" },
  "2.00": { carat: 2.0, label: "2.00 ct", scale: 0.68, diameterMm: 8.1, dimensionsMm: "8.1 × 8.1 mm" },
  "3.00": { carat: 3.0, label: "3.00 ct", scale: 0.78, diameterMm: 9.2, dimensionsMm: "9.2 × 9.2 mm" },
};

// ---------------------------------------------------------------------------
// 4. Standard Indian Ring Sizes (BIS Standard Size 6 to 25)
// ---------------------------------------------------------------------------
export const INDIAN_RING_SIZES: IndianRingSize[] = [
  { size: 6, innerDiameterMm: 14.6, innerCircumferenceMm: 45.9 },
  { size: 7, innerDiameterMm: 15.0, innerCircumferenceMm: 47.1 },
  { size: 8, innerDiameterMm: 15.3, innerCircumferenceMm: 48.1 },
  { size: 9, innerDiameterMm: 15.6, innerCircumferenceMm: 49.0 },
  { size: 10, innerDiameterMm: 16.0, innerCircumferenceMm: 50.3 },
  { size: 11, innerDiameterMm: 16.3, innerCircumferenceMm: 51.2 },
  { size: 12, innerDiameterMm: 16.6, innerCircumferenceMm: 52.2 },
  { size: 13, innerDiameterMm: 17.0, innerCircumferenceMm: 53.4 },
  { size: 14, innerDiameterMm: 17.3, innerCircumferenceMm: 54.3 },
  { size: 15, innerDiameterMm: 17.6, innerCircumferenceMm: 55.3 },
  { size: 16, innerDiameterMm: 18.0, innerCircumferenceMm: 56.5 },
  { size: 17, innerDiameterMm: 18.3, innerCircumferenceMm: 57.5 },
  { size: 18, innerDiameterMm: 18.6, innerCircumferenceMm: 58.4 },
  { size: 19, innerDiameterMm: 19.0, innerCircumferenceMm: 59.7 },
  { size: 20, innerDiameterMm: 19.3, innerCircumferenceMm: 60.6 },
  { size: 21, innerDiameterMm: 19.6, innerCircumferenceMm: 61.6 },
  { size: 22, innerDiameterMm: 20.0, innerCircumferenceMm: 62.8 },
  { size: 23, innerDiameterMm: 20.3, innerCircumferenceMm: 63.8 },
  { size: 24, innerDiameterMm: 20.6, innerCircumferenceMm: 64.7 },
  { size: 25, innerDiameterMm: 21.0, innerCircumferenceMm: 66.0 },
];
