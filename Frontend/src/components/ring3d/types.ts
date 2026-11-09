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

// PBR base colors and roughness matched to fine jewellery metals
export const METAL_COLORS: Record<Metal, { 14: string; 18: string; roughness: number }> = {
  yellow: { 18: '#F2C26B', 14: '#E8CB85', roughness: 0.12 },
  white: { 18: '#F0F0F2', 14: '#E8E8EC', roughness: 0.10 },
  rose: { 18: '#EDA490', 14: '#E9B6A5', roughness: 0.13 },
  silver: { 18: '#E3E4E6', 14: '#E3E4E6', roughness: 0.16 },
};

// Indian Ring Size -> Inner Diameter (mm)
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
