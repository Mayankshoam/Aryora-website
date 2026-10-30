export interface ProductSpec {
  metal: string;
  purity: string;
  diamondCarat?: string;
  diamondColor?: string;
  diamondClarity?: string;
  certification: string;
  grossWeight?: string;
}

export interface ProductItem {
  id: string;
  slug: string;
  productCode: string;
  name: string;
  category: "rings" | "earrings" | "pendants" | "necklaces" | "bridal";
  collection: "bridal" | "solitaire" | "everyday";
  metalType: "YELLOW_GOLD" | "WHITE_GOLD" | "ROSE_GOLD" | "CHAMPAGNE_GOLD" | "SILVER_925";
  price: number;
  originalPrice?: number;
  shortDescription: string;
  description: string;
  specs: ProductSpec;
  images: { url: string; altText: string }[];
  isBestseller?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  occasions: string[];
}

export const PRODUCTS: ProductItem[] = [
  {
    id: "ary-001",
    slug: "emerald-cut-solitaire-ring",
    productCode: "ARY-R-101",
    name: "Emerald Cut Solitaire Ring",
    category: "rings",
    collection: "solitaire",
    metalType: "YELLOW_GOLD",
    price: 84500,
    originalPrice: 96000,
    shortDescription: "A statement 1.50ct emerald-cut lab-grown diamond perched on a tapered 18K yellow gold band.",
    description: "Architectural precision meets classical grace. Featuring a hand-selected 1.50ct emerald-cut lab-grown diamond held by four delicate claw prongs, this ring embodies quiet confidence. Laser inscribed with its unique IGI certification number.",
    specs: {
      metal: "18K Yellow Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "1.50 Carat",
      diamondColor: "E (Colourless)",
      diamondClarity: "VVS1 (Exceptional)",
      certification: "IGI Certified #LG628109341",
      grossWeight: "3.85 grams",
    },
    images: [
      { url: "/images/products/emerald-solitaire-1.jpg", altText: "Emerald cut solitaire diamond ring in 18K yellow gold" },
      { url: "/images/collection-solitaire.jpg", altText: "Emerald cut ring worn on hand" },
    ],
    isBestseller: true,
    isFeatured: true,
    occasions: ["Engagement", "Anniversary", "Everyday Luxury"],
  },
  {
    id: "ary-002",
    slug: "tulip-halo-diamond-ring",
    productCode: "ARY-R-102",
    name: "Tulip Petal Solitaire Ring",
    category: "rings",
    collection: "bridal",
    metalType: "ROSE_GOLD",
    price: 68000,
    shortDescription: "Delicate blooming tulip basket setting holding a brilliant round diamond.",
    description: "Inspired by botanical geometry, the six-prong basket blooms beneath a 1.00ct ideal-cut round lab-grown diamond. Hand-finished in radiant 18K rose gold with whisper-thin micro pavé shoulders.",
    specs: {
      metal: "18K Rose Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "1.00 Carat",
      diamondColor: "F (Colourless)",
      diamondClarity: "VS1 (Very Clean)",
      certification: "IGI Certified #LG598302194",
      grossWeight: "3.20 grams",
    },
    images: [
      { url: "/images/products/tulip.jpg", altText: "Tulip petal solitaire ring in 18K rose gold" },
      { url: "/images/craft-hands.jpg", altText: "Artisan inspecting setting" },
    ],
    isBestseller: true,
    isFeatured: true,
    occasions: ["Bridal", "Engagement", "Self Purchase"],
  },
  {
    id: "ary-003",
    slug: "heritage-bridal-emerald-necklace",
    productCode: "ARY-N-301",
    name: "Heritage Emerald & Diamond Choker",
    category: "bridal",
    collection: "bridal",
    metalType: "CHAMPAGNE_GOLD",
    price: 345000,
    shortDescription: "An heirloom choker celebrating Lucknow royalty with certified emeralds and diamonds.",
    description: "A triumph of Awadhi heritage craftsmanship. Handcrafted in 18K champagne gold with brilliant lab-grown solitaires flanking deep verdant hydrothermal emeralds. Designed to be treasured across generations.",
    specs: {
      metal: "18K Champagne Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "4.80 Total Carats",
      diamondColor: "E-F (Colourless)",
      diamondClarity: "VVS2",
      certification: "IGI Certified Suite",
      grossWeight: "38.5 grams",
    },
    images: [
      { url: "/images/hero-emerald.jpg", altText: "Heritage emerald and diamond necklace" },
      { url: "/images/collection-bridal.jpg", altText: "Bridal choker suite" },
    ],
    isBestseller: false,
    isFeatured: true,
    occasions: ["Bridal", "Weddings", "Red Carpet"],
  },
  {
    id: "ary-004",
    slug: "luminary-drop-earrings",
    productCode: "ARY-E-201",
    name: "Luminary Pear Drop Earrings",
    category: "earrings",
    collection: "everyday",
    metalType: "WHITE_GOLD",
    price: 52000,
    shortDescription: "Graceful teardrop lab-grown diamonds suspended in polished 18K white gold.",
    description: "Designed for effortless transition from boardroom to evening celebration. Twin 0.75ct pear-cut lab-grown diamonds articulated to catch every angle of ambient light with fluid movement.",
    specs: {
      metal: "18K White Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "1.50 Total Carats",
      diamondColor: "D-E",
      diamondClarity: "VVS2",
      certification: "IGI Certified Pair",
      grossWeight: "4.10 grams",
    },
    images: [
      { url: "/images/essence-earrings.jpg", altText: "Luminary pear drop diamond earrings" },
      { url: "/images/hero-emerald.jpg", altText: "Model wearing luminary earrings" },
    ],
    isBestseller: true,
    isFeatured: true,
    occasions: ["Everyday Luxury", "Evening", "Cocktail"],
  },
  {
    id: "ary-005",
    slug: "cascade-solitaire-pendant",
    productCode: "ARY-P-401",
    name: "Aura Solitaire Diamond Pendant",
    category: "pendants",
    collection: "solitaire",
    metalType: "YELLOW_GOLD",
    price: 39500,
    shortDescription: "A timeless bezel-set 0.80ct round brilliant diamond on an adjustable cable chain.",
    description: "A signature daily essential. The 0.80ct lab-grown diamond is cradled in an ultra-low profile bezel setting, allowing it to float seamlessly against the collarbone.",
    specs: {
      metal: "18K Yellow Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "0.80 Carat",
      diamondColor: "F",
      diamondClarity: "VS1",
      certification: "IGI Certified",
      grossWeight: "2.80 grams",
    },
    images: [
      { url: "/images/essence-necklace.jpg", altText: "Aura solitaire diamond pendant" },
      { url: "/images/collection-everyday.jpg", altText: "Pendant worn with layered chains" },
    ],
    isBestseller: true,
    isFeatured: false,
    occasions: ["Everyday Luxury", "Gifting", "Anniversary"],
  },
  {
    id: "ary-006",
    slug: "verve-tennis-necklace",
    productCode: "ARY-N-302",
    name: "Étoile Graduated Tennis Necklace",
    category: "necklaces",
    collection: "everyday",
    metalType: "WHITE_GOLD",
    price: 198000,
    shortDescription: "A continuous strand of 64 round brilliant lab-grown diamonds graduating gently towards the center.",
    description: "Pure light in motion. Each stone is individually four-prong set with hand-articulated links for maximum fluidity and drape. A modern heirloom designed to be worn both with a white tee and silk sari.",
    specs: {
      metal: "18K White Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "5.50 Total Carats",
      diamondColor: "E-F",
      diamondClarity: "VVS-VS",
      certification: "IGI Certified Suite",
      grossWeight: "16.4 grams",
    },
    images: [
      { url: "/images/collection-everyday.jpg", altText: "Étoile tennis necklace in white gold" },
      { url: "/images/essence-necklace.jpg", altText: "Tennis necklace detail" },
    ],
    isBestseller: false,
    isFeatured: true,
    occasions: ["Milestone Celebration", "Weddings", "Everyday Luxury"],
  },
  {
    id: "ary-007",
    slug: "artisan-silver-statement-ring",
    productCode: "ARY-R-103",
    name: "Crescent 92.5 Silver Diamond Ring",
    category: "rings",
    collection: "everyday",
    metalType: "SILVER_925",
    price: 18500,
    shortDescription: "Sculptural sterling silver band accented with a 0.50ct round lab diamond.",
    description: "Bridging architectural simplicity and modern conscious luxury. Solid 92.5 sterling silver, rhodium-plated for permanent luster and anti-tarnish durability.",
    specs: {
      metal: "92.5 Sterling Silver (Rhodium Plated)",
      purity: "925 Hallmark",
      diamondCarat: "0.50 Carat",
      diamondColor: "G",
      diamondClarity: "VS2",
      certification: "IGI Certified",
      grossWeight: "4.50 grams",
    },
    images: [
      { url: "/images/collection-solitaire.jpg", altText: "Crescent silver diamond ring" },
      { url: "/images/products/tulip.jpg", altText: "Silver ring profile" },
    ],
    isBestseller: false,
    isFeatured: false,
    occasions: ["Everyday Luxury", "Self Purchase", "Gifting"],
  },
  {
    id: "ary-008",
    slug: "radiant-heritage-bridal-set",
    productCode: "ARY-B-501",
    name: "Noor Heritage Bridal Suite",
    category: "bridal",
    collection: "bridal",
    metalType: "YELLOW_GOLD",
    price: 485000,
    shortDescription: "A complete royal bridal set comprising necklace, earrings, and matching maang tikka.",
    description: "Crafted in homage to the Nawabs of Awadh, Noor brings regal Lucknow grandeur into the modern era with guilt-free, carbon-conscious brilliance.",
    specs: {
      metal: "18K Yellow Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "8.20 Total Carats",
      diamondColor: "E-F",
      diamondClarity: "VVS1-VVS2",
      certification: "IGI Master Certified",
      grossWeight: "62.0 grams",
    },
    images: [
      { url: "/images/collection-bridal.jpg", altText: "Noor bridal necklace and earrings set" },
      { url: "/images/hero-emerald.jpg", altText: "Bridal suite modeled" },
    ],
    isBestseller: true,
    isFeatured: true,
    occasions: ["Bridal", "Weddings"],
  },
];

export const METAL_NAMES: Record<string, string> = {
  YELLOW_GOLD: "18K Yellow Gold",
  WHITE_GOLD: "18K White Gold",
  ROSE_GOLD: "18K Rose Gold",
  CHAMPAGNE_GOLD: "18K Champagne Gold",
  SILVER_925: "92.5 Sterling Silver",
};

export function getAllProducts(): ProductItem[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): ProductItem | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getBestsellers(): ProductItem[] {
  return PRODUCTS.filter((p) => p.isBestseller);
}

export function getFeaturedProducts(): ProductItem[] {
  return PRODUCTS.filter((p) => p.isFeatured);
}

export function getRelatedProducts(currentSlug: string, limit = 4): ProductItem[] {
  const current = getProductBySlug(currentSlug);
  if (!current) return PRODUCTS.slice(0, limit);
  return PRODUCTS.filter(
    (p) => p.slug !== currentSlug && (p.category === current.category || p.collection === current.collection)
  ).slice(0, limit);
}
