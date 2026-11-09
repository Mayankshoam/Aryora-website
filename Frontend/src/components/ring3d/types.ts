/**
 * Jewelcraft-calibrated 3D Ring Builder Configuration & Types
 * PBR Precious Metals, Tolkowsky Gem Proportions, and BIS Ring Standards
 */

export type RingStyle = 'classic' | 'cathedral' | 'twist' | 'split' | 'twoRowSplit' | 'pinch';
export type SideSetting = 'plain' | 'pave' | 'prong' | 'channel';
export type DiamondShape =
  | 'round'
  | 'princess'
  | 'oval'
  | 'emerald'
  | 'cushion'
  | 'pear'
  | 'radiant'
  | 'asscher'
  | 'marquise';
export type Halo = 'none' | 'hidden' | 'single';
export type Metal = 'yellow' | 'white' | 'rose' | 'silver';
export type ViewName = 'angle' | 'front' | 'top' | 'profile';

export interface RingConfig {
  style: RingStyle;
  side: SideSetting;
  shape: DiamondShape;
  carat: number; // 0.5 - 3.0
  halo: Halo;
  metal: Metal;
  karat: 14 | 18;
  indianSize: number; // 8 - 22
}

export const DEFAULT_CONFIG: RingConfig = {
  style: 'classic',
  side: 'plain',
  shape: 'round',
  carat: 1.5,
  halo: 'none',
  metal: 'yellow',
  karat: 18,
  indianSize: 12,
};

// PBR base optical colors, roughness, and metalness calibrated to fine jewelry atelier alloys
export const METAL_COLORS: Record<
  Metal,
  {
    14: string;
    18: string;
    color14: number;
    color18: number;
    roughness: number;
    metalness: number;
    envIntensity: number;
  }
> = {
  yellow: {
    18: '#F3C569',
    14: '#E9CB85',
    color18: 0xf3c569,
    color14: 0xe9cb85,
    roughness: 0.11,
    metalness: 0.98,
    envIntensity: 2.2,
  },
  white: {
    18: '#F2F4F7',
    14: '#EAEDF1',
    color18: 0xf2f4f7,
    color14: 0xeaedf1,
    roughness: 0.08,
    metalness: 1.0,
    envIntensity: 2.5,
  },
  rose: {
    18: '#EFA491',
    14: '#E8B6A5',
    color18: 0xefa491,
    color14: 0xe8b6a5,
    roughness: 0.12,
    metalness: 0.98,
    envIntensity: 2.2,
  },
  silver: {
    18: '#E3E6EB',
    14: '#E3E6EB',
    color18: 0xe3e6eb,
    color14: 0xe3e6eb,
    roughness: 0.13,
    metalness: 0.95,
    envIntensity: 2.0,
  },
};

// BIS Indian Ring Size -> Inner Diameter (mm)
export const INDIAN_RING_SIZES: Record<number, number> = {
  8: 15.3,
  9: 15.6,
  10: 15.9,
  11: 16.2,
  12: 16.6,
  13: 16.9,
  14: 17.2,
  15: 17.5,
  16: 17.8,
  17: 18.2,
  18: 18.5,
  19: 18.8,
  20: 19.2,
  21: 19.5,
  22: 19.8,
};

// Jewelcraft-calibrated millimeter dimension table for round and fancy cuts
export function getGemDimensionsMm(shape: DiamondShape, carat: number): {
  lengthMm: number;
  widthMm: number;
  depthMm: number;
} {
  // Jewelcraft carat formula base: 1.0ct round ~ 6.5mm
  const baseSize = Math.cbrt(carat / 0.00365) * 0.77; // ~6.5mm at 1.0ct

  switch (shape) {
    case 'oval':
      return { lengthMm: baseSize * 1.34, widthMm: baseSize * 0.94, depthMm: baseSize * 0.62 };
    case 'princess':
      return { lengthMm: baseSize * 0.88, widthMm: baseSize * 0.88, depthMm: baseSize * 0.73 };
    case 'emerald':
      return { lengthMm: baseSize * 1.36, widthMm: baseSize * 0.96, depthMm: baseSize * 0.65 };
    case 'asscher':
      return { lengthMm: baseSize * 0.92, widthMm: baseSize * 0.92, depthMm: baseSize * 0.68 };
    case 'cushion':
      return { lengthMm: baseSize * 1.04, widthMm: baseSize * 0.98, depthMm: baseSize * 0.67 };
    case 'radiant':
      return { lengthMm: baseSize * 1.25, widthMm: baseSize * 0.96, depthMm: baseSize * 0.68 };
    case 'pear':
      return { lengthMm: baseSize * 1.48, widthMm: baseSize * 0.94, depthMm: baseSize * 0.62 };
    case 'marquise':
      return { lengthMm: baseSize * 1.82, widthMm: baseSize * 0.90, depthMm: baseSize * 0.60 };
    case 'round':
    default:
      return { lengthMm: baseSize, widthMm: baseSize, depthMm: baseSize * 0.615 };
  }
}
