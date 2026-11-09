import * as THREE from 'three';
import { DiamondShape } from './types';

export function createDiamondGeometry(shape: DiamondShape, carat: number): THREE.BufferGeometry {
  const mmRadius = (Math.cbrt(carat) * 6.5) / 2; // ~6.5mm diameter at 1.0 ct
  const r = mmRadius * 0.1; // scale for three scene units
  const depth = r * 0.65;
  const table = r * 0.55;

  let geo: THREE.BufferGeometry;

  switch (shape) {
    case 'princess':
    case 'cushion': {
      geo = new THREE.BoxGeometry(r * 1.8, depth * 1.2, r * 1.8, 3, 3, 3);
      break;
    }
    case 'emerald':
    case 'radiant':
    case 'asscher': {
      const aspect = shape === 'asscher' ? 1.0 : 1.35;
      geo = new THREE.BoxGeometry(r * 1.4 * aspect, depth * 1.1, r * 1.4, 2, 2, 2);
      break;
    }
    case 'oval': {
      geo = new THREE.SphereGeometry(r, 24, 16);
      geo.scale(1.3, 0.7, 0.9);
      break;
    }
    case 'pear': {
      geo = new THREE.ConeGeometry(r * 1.1, depth * 1.8, 20);
      geo.scale(1.2, 0.8, 0.9);
      break;
    }
    case 'marquise': {
      geo = new THREE.SphereGeometry(r, 24, 12);
      geo.scale(1.7, 0.6, 0.8);
      break;
    }
    case 'round':
    default: {
      const segments = 16;
      const vertices: number[] = [];
      const indices: number[] = [];

      // Crown Table
      vertices.push(0, depth * 0.4, 0); // apex 0
      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        vertices.push(Math.cos(theta) * table, depth * 0.35, Math.sin(theta) * table);
      }
      // Girdle
      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        vertices.push(Math.cos(theta) * r, 0, Math.sin(theta) * r);
      }
      // Culet
      vertices.push(0, -depth * 0.7, 0);

      const culetIdx = 1 + segments * 2;
      for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        // Table fan
        indices.push(0, 1 + i, 1 + next);
        // Crown facets
        indices.push(1 + i, 1 + segments + i, 1 + segments + next);
        indices.push(1 + i, 1 + segments + next, 1 + next);
        // Pavilion facets
        indices.push(1 + segments + i, culetIdx, 1 + segments + next);
      }

      geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geo.setIndex(indices);
      break;
    }
  }

  geo.computeVertexNormals();
  return geo;
}
