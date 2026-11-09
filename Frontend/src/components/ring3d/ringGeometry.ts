import * as THREE from 'three';
import { RingStyle, Halo } from './types';

export function createRingBandGeometry(style: RingStyle, diameterMm: number): THREE.BufferGeometry {
  const innerRadius = (diameterMm / 2) * 0.1; // Three units
  const tubeRadius = 0.11;

  let geo: THREE.BufferGeometry;

  switch (style) {
    case 'cathedral': {
      geo = new THREE.TorusGeometry(innerRadius, tubeRadius, 24, 64, Math.PI * 1.85);
      geo.rotateZ(-Math.PI * 0.925);
      break;
    }
    case 'pinch': {
      geo = new THREE.TorusGeometry(innerRadius, tubeRadius * 0.85, 24, 64);
      break;
    }
    case 'split':
    case 'twoRowSplit': {
      geo = new THREE.TorusGeometry(innerRadius, tubeRadius * 1.25, 24, 64);
      break;
    }
    case 'twist':
    case 'classic':
    default: {
      geo = new THREE.TorusGeometry(innerRadius, tubeRadius, 32, 64);
      break;
    }
  }

  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}
