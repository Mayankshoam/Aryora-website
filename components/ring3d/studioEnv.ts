/**
 * Zero-Network Procedural Studio Environment Generator
 * Produces crisp studio lighting with overhead softboxes, lateral strip lights,
 * and high-contrast specular reflections that ignite diamond dispersion fire and
 * render pristine polished metal shanks without any external network asset downloads.
 */

import * as THREE from "three";

let cachedStudioTexture: THREE.Texture | null = null;
let cachedRenderer: THREE.WebGLRenderer | null = null;

/**
 * Creates or retrieves a cached equirectangular studio environment texture.
 */
export function getProceduralStudioEnv(renderer: THREE.WebGLRenderer): THREE.Texture {
  if (cachedStudioTexture && cachedRenderer === renderer) {
    return cachedStudioTexture;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.Texture();
  }

  // 1. Studio ambient base (deep charcoal-graphite tone)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, "#22252a");
  bgGrad.addColorStop(0.5, "#121417");
  bgGrad.addColorStop(1, "#0a0c0e");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // 2. Main Key Overhead Softbox (Bright diffused white-gold glow)
  const topSoftbox = ctx.createRadialGradient(512, 110, 15, 512, 110, 240);
  topSoftbox.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  topSoftbox.addColorStop(0.3, "rgba(255, 252, 245, 0.95)");
  topSoftbox.addColorStop(0.7, "rgba(255, 240, 220, 0.4)");
  topSoftbox.addColorStop(1, "rgba(34, 37, 42, 0)");
  ctx.fillStyle = topSoftbox;
  ctx.fillRect(0, 0, 1024, 320);

  // 3. Left Specular Vertical Strip Softbox (produces razor-sharp metal rim reflections)
  const leftStrip = ctx.createLinearGradient(130, 0, 260, 0);
  leftStrip.addColorStop(0, "rgba(255, 255, 255, 0)");
  leftStrip.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
  leftStrip.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = leftStrip;
  ctx.fillRect(130, 60, 130, 360);

  // 4. Right Specular Vertical Strip Softbox (secondary cool-white rim reflection)
  const rightStrip = ctx.createLinearGradient(760, 0, 890, 0);
  rightStrip.addColorStop(0, "rgba(255, 255, 255, 0)");
  rightStrip.addColorStop(0.5, "rgba(242, 246, 252, 0.9)");
  rightStrip.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = rightStrip;
  ctx.fillRect(760, 60, 130, 360);

  // 5. Crown Sparkle Pinpoints (stimulates micro-facet dispersion flashes in diamonds)
  const pinpoints = [
    { x: 380, y: 140, r: 24, alpha: 0.9 },
    { x: 640, y: 140, r: 24, alpha: 0.9 },
    { x: 512, y: 60, r: 35, alpha: 1.0 },
    { x: 300, y: 90, r: 18, alpha: 0.75 },
    { x: 720, y: 90, r: 18, alpha: 0.75 },
  ];

  pinpoints.forEach((p) => {
    const pinGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    pinGrad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
    pinGrad.addColorStop(0.5, `rgba(255, 250, 240, ${p.alpha * 0.6})`);
    pinGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = pinGrad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // 6. Ground Warm Bounce Gradient (subtle luxury velvet reflection from below)
  const floorBounce = ctx.createLinearGradient(0, 400, 0, 512);
  floorBounce.addColorStop(0, "rgba(0, 0, 0, 0)");
  floorBounce.addColorStop(0.6, "rgba(245, 235, 220, 0.35)");
  floorBounce.addColorStop(1, "rgba(240, 225, 205, 0.6)");
  ctx.fillStyle = floorBounce;
  ctx.fillRect(0, 400, 1024, 112);

  // Generate Three.js Equirectangular PMREM Texture
  const canvasTexture = new THREE.CanvasTexture(canvas);
  canvasTexture.mapping = THREE.EquirectangularReflectionMapping;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const renderTarget = pmremGenerator.fromEquirectangular(canvasTexture);

  canvasTexture.dispose();
  pmremGenerator.dispose();

  cachedStudioTexture = renderTarget.texture;
  cachedRenderer = renderer;

  return cachedStudioTexture;
}

/**
 * Creates directional and ambient light cluster to complement the procedural studio HDR.
 */
export function createStudioLighting(scene: THREE.Scene) {
  // Main Key Soft Light (Warm White)
  const keyLight = new THREE.DirectionalLight(0xfff8f0, 3.4);
  keyLight.position.set(4, 7, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  // Fill Light (Subtle Cool Ambient for Silver/Platinum contrast)
  const fillLight = new THREE.DirectionalLight(0xedf4ff, 2.0);
  fillLight.position.set(-4.5, 3.5, 3.5);
  scene.add(fillLight);

  // Diamond Table Sparkle Spotlight (Pointed directly at top crown)
  const sparkleSpot = new THREE.SpotLight(0xffffff, 4.8, 14, Math.PI / 6, 0.25);
  sparkleSpot.position.set(0, 6, 1.2);
  sparkleSpot.target.position.set(0, 1.2, 0);
  scene.add(sparkleSpot);
  scene.add(sparkleSpot.target);

  // Back Rim Light (Edges of ring band)
  const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
  rimLight.position.set(0, -1, -4.5);
  scene.add(rimLight);

  // General Ambient
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
}
