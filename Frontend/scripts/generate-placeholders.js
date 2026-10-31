const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, '..', 'public', 'products');
const SITE_DIR = path.join(__dirname, '..', 'public', 'site');

if (!fs.existsSync(PRODUCTS_DIR)) fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
if (!fs.existsSync(SITE_DIR)) fs.mkdirSync(SITE_DIR, { recursive: true });

// SVG templates for categories
function generateJewelrySvg(title, subtitle, category, variant = 'a') {
  const isA = variant === 'a';
  
  // Category-specific center graphic
  let centerGraphic = '';
  
  if (category === 'Rings' || category === 'Solitaires') {
    centerGraphic = `
      <!-- Ring Band -->
      <ellipse cx="400" cy="460" rx="160" ry="85" fill="none" stroke="#D4AF37" stroke-width="14" stroke-dasharray="0" opacity="0.9" />
      <ellipse cx="400" cy="460" rx="150" ry="75" fill="none" stroke="#B89B5E" stroke-width="4" opacity="0.6" />
      <!-- Ring Prongs & Head -->
      <path d="M375 390 L390 350 L410 350 L425 390 Z" fill="#B89B5E" opacity="0.8" />
      <path d="M385 350 L400 320 L415 350 Z" fill="#B89B5E" />
      <!-- Solitaire Diamond Cut -->
      <polygon points="400,280 445,320 400,360 355,320" fill="${isA ? '#F8F6F0' : '#F2EDE2'}" stroke="#B89B5E" stroke-width="3" />
      <polygon points="400,280 400,360 380,320" fill="#EADFC7" opacity="0.7" />
      <polygon points="400,280 400,360 420,320" fill="#FFFFFF" opacity="0.8" />
      <!-- Sparkle Accents -->
      <circle cx="445" cy="285" r="3" fill="#B89B5E" />
      <line x1="445" y1="275" x2="445" y2="295" stroke="#B89B5E" stroke-width="1.5" />
      <line x1="435" y1="285" x2="455" y2="285" stroke="#B89B5E" stroke-width="1.5" />
    `;
  } else if (category === 'Earrings') {
    centerGraphic = `
      <!-- Left Earring Drop -->
      <circle cx="340" cy="300" r="14" fill="#B89B5E" />
      <path d="M340 314 L340 400" stroke="#B89B5E" stroke-width="4" />
      <polygon points="340,400 365,440 340,480 315,440" fill="#F8F6F0" stroke="#B89B5E" stroke-width="3" />
      <polygon points="340,400 340,480 325,440" fill="#FFFFFF" opacity="0.8" />
      <!-- Right Earring Drop -->
      <circle cx="460" cy="300" r="14" fill="#B89B5E" />
      <path d="M460 314 L460 400" stroke="#B89B5E" stroke-width="4" />
      <polygon points="460,400 485,440 460,480 435,440" fill="#F8F6F0" stroke="#B89B5E" stroke-width="3" />
      <polygon points="460,400 460,480 475,440" fill="#FFFFFF" opacity="0.8" />
    `;
  } else if (category === 'Pendants') {
    centerGraphic = `
      <!-- Delicate Chain -->
      <path d="M260 220 Q400 450 540 220" fill="none" stroke="#B89B5E" stroke-width="3" stroke-dasharray="3,3" opacity="0.7" />
      <!-- Pendant Bail -->
      <rect x="393" y="380" width="14" height="24" rx="7" fill="none" stroke="#B89B5E" stroke-width="3" />
      <!-- Solitaire Bezel Pendant -->
      <polygon points="400,410 440,450 400,490 360,450" fill="#F8F6F0" stroke="#B89B5E" stroke-width="4" />
      <polygon points="400,410 400,490 380,450" fill="#FFFFFF" opacity="0.9" />
      <polygon points="400,410 400,490 420,450" fill="#EADFC7" opacity="0.8" />
    `;
  } else if (category === 'Necklaces' || category === 'Bridal') {
    centerGraphic = `
      <!-- Royal Graduated Choker Arc -->
      <path d="M220 280 Q400 490 580 280" fill="none" stroke="#B89B5E" stroke-width="8" opacity="0.85" />
      <path d="M240 295 Q400 475 560 295" fill="none" stroke="#D4AF37" stroke-width="4" opacity="0.5" />
      <!-- Diamond Clusters -->
      <circle cx="400" cy="460" r="14" fill="#FFFFFF" stroke="#B89B5E" stroke-width="3" />
      <circle cx="360" cy="450" r="11" fill="#F8F6F0" stroke="#B89B5E" stroke-width="2.5" />
      <circle cx="440" cy="450" r="11" fill="#F8F6F0" stroke="#B89B5E" stroke-width="2.5" />
      <circle cx="320" cy="430" r="9" fill="#F8F6F0" stroke="#B89B5E" stroke-width="2" />
      <circle cx="480" cy="430" r="9" fill="#F8F6F0" stroke="#B89B5E" stroke-width="2" />
      <circle cx="280" cy="390" r="7" fill="#F8F6F0" stroke="#B89B5E" stroke-width="2" />
      <circle cx="520" cy="390" r="7" fill="#F8F6F0" stroke="#B89B5E" stroke-width="2" />
    `;
  } else if (category === 'Bracelets') {
    centerGraphic = `
      <!-- Tennis Bracelet Loop -->
      <ellipse cx="400" cy="400" rx="160" ry="110" fill="none" stroke="#B89B5E" stroke-width="12" stroke-dasharray="14,6" opacity="0.9" />
      <ellipse cx="400" cy="400" rx="160" ry="110" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-dasharray="6,14" />
      <circle cx="560" cy="400" r="8" fill="#B89B5E" />
    `;
  } else {
    centerGraphic = `
      <polygon points="400,320 460,370 400,420 340,370" fill="#F8F6F0" stroke="#B89B5E" stroke-width="4" />
      <polygon points="400,320 400,420 370,370" fill="#FFFFFF" opacity="0.9" />
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="70%" stop-color="#FAF8F4"/>
      <stop offset="100%" stop-color="#F2EDE4"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#B89B5E"/>
      <stop offset="100%" stop-color="#7A5E20"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="800" fill="url(#bgGrad)"/>
  
  <!-- Subtle Framing Grid -->
  <rect x="30" y="30" width="740" height="740" fill="none" stroke="#E8E5DF" stroke-width="1"/>
  <rect x="40" y="40" width="720" height="720" fill="none" stroke="#B89B5E" stroke-width="0.5" stroke-dasharray="4,6" opacity="0.4"/>
  
  <!-- Corner Floral / Geometric Accents -->
  <path d="M40 56 L56 40 M760 56 L744 40 M40 744 L56 760 M760 744 L744 760" stroke="#B89B5E" stroke-width="1" opacity="0.6"/>

  <!-- Jewelry Illustration -->
  <g transform="translate(0, -20)">
    ${centerGraphic}
  </g>

  <!-- Product Labels & Watermark -->
  <text x="400" y="650" font-family="'Georgia', serif" font-size="20" fill="#1A1A1A" font-weight="400" text-anchor="middle" letter-spacing="1">
    ${title}
  </text>
  <text x="400" y="680" font-family="system-ui, sans-serif" font-size="11" fill="#7A5E20" font-weight="600" text-anchor="middle" letter-spacing="3" text-transform="uppercase">
    ${subtitle}
  </text>
  <text x="400" y="705" font-family="system-ui, sans-serif" font-size="9" fill="#8A8680" text-anchor="middle" letter-spacing="2" text-transform="uppercase">
    ARYORA · IGI CERTIFIED LAB DIAMONDS · 18K GOLD
  </text>
</svg>`;
}

// Generate 24 product images (both primary 'a' and hover 'b')
const CATEGORIES = [
  { name: 'Rings', count: 5, prefix: 'ring' },
  { name: 'Earrings', count: 4, prefix: 'earring' },
  { name: 'Pendants', count: 3, prefix: 'pendant' },
  { name: 'Necklaces', count: 3, prefix: 'necklace' },
  { name: 'Bracelets', count: 3, prefix: 'bracelet' },
  { name: 'Solitaires', count: 3, prefix: 'solitaire' },
  { name: 'Bridal', count: 3, prefix: 'bridal' },
];

let totalGenerated = 0;
CATEGORIES.forEach(cat => {
  for (let i = 1; i <= cat.count; i++) {
    const num = String(i).padStart(2, '0');
    const title = `Sample ${cat.name.replace(/s$/, '')} ${num}`;
    const subtitle = `${cat.name.toUpperCase()} · 18K BIS HALLMARKED`;
    
    const svgA = generateJewelrySvg(title, subtitle, cat.name, 'a');
    const svgB = generateJewelrySvg(`${title} (Reverse View)`, subtitle, cat.name, 'b');
    
    fs.writeFileSync(path.join(PRODUCTS_DIR, `${cat.prefix}-${num}-a.svg`), svgA, 'utf8');
    fs.writeFileSync(path.join(PRODUCTS_DIR, `${cat.prefix}-${num}-b.svg`), svgB, 'utf8');
    totalGenerated += 2;
  }
});

console.log(`Generated ${totalGenerated} product SVGs in ${PRODUCTS_DIR}`);

// Generate Site Assets
// 1. Hero Poster
const heroPosterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1B3B30"/>
      <stop offset="40%" stop-color="#142B23"/>
      <stop offset="100%" stop-color="#0B1A15"/>
    </linearGradient>
    <radialGradient id="glow" cx="65%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#B89B5E" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#1B3B30" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#heroGrad)"/>
  <rect width="1920" height="1080" fill="url(#glow)"/>

  <!-- Shimmering Diamond Polygon Illustration -->
  <g transform="translate(1150, 480) scale(1.6)">
    <!-- Solitaire Diamond Crown -->
    <polygon points="0,-160 160,-60 0,60 -160,-60" fill="none" stroke="#D4AF37" stroke-width="3" opacity="0.9"/>
    <polygon points="0,-160 0,60 -70,-60" fill="#FFFFFF" fill-opacity="0.12"/>
    <polygon points="0,-160 0,60 70,-60" fill="#B89B5E" fill-opacity="0.18"/>
    <!-- Pavilion & Girdle -->
    <polygon points="-160,-60 160,-60 0,160" fill="none" stroke="#B89B5E" stroke-width="3" opacity="0.85"/>
    <polygon points="0,160 0,-60 -70,-60" fill="#EADFC7" fill-opacity="0.15"/>
    <polygon points="0,160 0,-60 70,-60" fill="#FFFFFF" fill-opacity="0.25"/>
    <!-- Radiance Sparkles -->
    <circle cx="160" cy="-60" r="5" fill="#FFFFFF"/>
    <circle cx="-160" cy="-60" r="5" fill="#FFFFFF"/>
    <circle cx="0" cy="-160" r="6" fill="#D4AF37"/>
    <line x1="0" y1="-190" x2="0" y2="-130" stroke="#D4AF37" stroke-width="2"/>
    <line x1="-30" y1="-160" x2="30" y2="-160" stroke="#D4AF37" stroke-width="2"/>
  </g>

  <!-- Editorial Typography Left -->
  <g transform="translate(160, 440)">
    <text x="0" y="0" font-family="system-ui, sans-serif" font-size="14" fill="#B89B5E" font-weight="600" letter-spacing="6" text-transform="uppercase">
      AWADHI ROYAL ATELIER · 100% IGI CERTIFIED
    </text>
    <text x="0" y="70" font-family="'Georgia', serif" font-size="64" fill="#FAF8F4" font-weight="300" letter-spacing="1">
      Made for you, not for your locker.
    </text>
    <text x="0" y="125" font-family="system-ui, sans-serif" font-size="20" fill="#C5C2BA" font-weight="300" max-width="600">
      Conscious lab-grown diamonds set in 18K gold. Born to be celebrated daily.
    </text>
    <text x="0" y="180" font-family="'Georgia', serif" font-size="18" fill="#B89B5E" font-style="italic" letter-spacing="4">
      Light. Legacy. You.
    </text>
  </g>
</svg>`;

fs.writeFileSync(path.join(SITE_DIR, 'hero-poster.svg'), heroPosterSvg, 'utf8');

// 2. Brand Emblem
const brandEmblemSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#B89B5E"/>
      <stop offset="100%" stop-color="#7A5E20"/>
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#emblemGold)" stroke-width="2.5" opacity="0.6"/>
  <!-- Multi-facet Lotus Star -->
  <polygon points="100,25 125,75 175,100 125,125 100,175 75,125 25,100 75,75" fill="none" stroke="url(#emblemGold)" stroke-width="3"/>
  <polygon points="100,45 115,85 155,100 115,115 100,155 85,115 45,100 85,85" fill="#FAF8F4" stroke="#B89B5E" stroke-width="1.5" opacity="0.9"/>
  <circle cx="100" cy="100" r="10" fill="url(#emblemGold)"/>
</svg>`;

fs.writeFileSync(path.join(SITE_DIR, 'brand-emblem.svg'), brandEmblemSvg, 'utf8');

// 3. Category Tile SVGs
const TILE_CATEGORIES = [
  { name: 'rings', label: 'Rings', icon: '💍', desc: 'Solitaires & Bands' },
  { name: 'earrings', label: 'Earrings', icon: '✨', desc: 'Studs & Luminary Drops' },
  { name: 'pendants', label: 'Pendants', icon: '💎', desc: 'Solitaire Bezels' },
  { name: 'necklaces', label: 'Necklaces', icon: '👑', desc: 'Tennis Lines & Chokers' },
  { name: 'bracelets', label: 'Bracelets & Bangles', icon: '⭐', desc: 'Tennis Cuffs' },
  { name: 'solitaires', label: 'Solitaires', icon: '💠', desc: 'IGI 0.5ct to 3ct' },
  { name: 'bridal', label: 'Bridal & Sets', icon: '⚜️', desc: 'Heritage Wedding Suites' },
  { name: 'mangalsutras', label: 'Modern Mangalsutras', icon: '💫', desc: 'Geometric Diamond Bars' },
];

TILE_CATEGORIES.forEach(cat => {
  const tileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
    <defs>
      <radialGradient id="tileBg_${cat.name}" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="80%" stop-color="#FAF8F4"/>
        <stop offset="100%" stop-color="#EDE7DC"/>
      </radialGradient>
    </defs>
    <rect width="500" height="500" fill="url(#tileBg_${cat.name})"/>
    <circle cx="250" cy="220" r="130" fill="none" stroke="#E8E5DF" stroke-width="1.5"/>
    <circle cx="250" cy="220" r="120" fill="none" stroke="#B89B5E" stroke-width="1" stroke-dasharray="3,3" opacity="0.6"/>
    <text x="250" y="245" font-size="70" text-anchor="middle">${cat.icon}</text>
    <text x="250" y="380" font-family="'Georgia', serif" font-size="22" fill="#1A1A1A" font-weight="400" text-anchor="middle">
      ${cat.label}
    </text>
    <text x="250" y="410" font-family="system-ui, sans-serif" font-size="11" fill="#7A5E20" font-weight="600" text-anchor="middle" letter-spacing="2" text-transform="uppercase">
      ${cat.desc}
    </text>
  </svg>`;
  fs.writeFileSync(path.join(SITE_DIR, `cat-${cat.name}.svg`), tileSvg, 'utf8');
});

console.log(`Generated site assets in ${SITE_DIR}`);

