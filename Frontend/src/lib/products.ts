export interface ProductSpec {
  metal: string;
  purity: string;
  diamondCarat?: string;
  diamondColor?: string;
  diamondClarity?: string;
  certification: string;
  grossWeight?: string;
  dimensions?: string;
}

export interface PriceBreakup {
  goldWeightGrams: number;
  goldRatePerGram: number;
  goldValue: number;
  diamondCarats: number;
  diamondValue: number;
  makingCharges: number;
  gst: number;
  total: number;
}

export type MetalType =
  | "YELLOW_GOLD"
  | "WHITE_GOLD"
  | "ROSE_GOLD"
  | "CHAMPAGNE_GOLD"
  | "SILVER_925";

export type ProductCategory =
  | "rings"
  | "earrings"
  | "pendants"
  | "necklaces"
  | "bracelets"
  | "mangalsutras"
  | "solitaires"
  | "bridal"
  | "mens";

export type StoneShape =
  | "Round"
  | "Emerald"
  | "Pear"
  | "Princess"
  | "Marquise"
  | "Oval";

export type JewelleryOccasion =
  | "Everyday"
  | "Workwear"
  | "Wedding"
  | "Gifting"
  | "Anniversary"
  | "Engagement";

export type JewelleryGender = "Women" | "Men" | "Kids" | "Unisex";

export interface ProductItem {
  id: string;
  slug: string;
  productCode: string;
  name: string;
  category: ProductCategory;
  collection: "bridal" | "solitaire" | "everyday";
  metalType: MetalType;
  availableMetals: MetalType[];
  purity: "14kt" | "18kt" | "22kt" | "925 Silver";
  stone: "lab-grown-diamond" | "gemstone";
  stoneShape: StoneShape;
  style: string;
  gender: JewelleryGender;
  price: number;
  originalPrice?: number;
  offerBadge?: string;
  readyToShip?: boolean;
  shortDescription: string;
  description: string;
  specs: ProductSpec;
  priceBreakup: PriceBreakup;
  images: { url: string; altText: string }[];
  isBestseller?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  occasions: string[];
  rating?: number;
  reviewCount?: number;
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
    availableMetals: ["YELLOW_GOLD", "WHITE_GOLD", "ROSE_GOLD"],
    purity: "18kt",
    stone: "lab-grown-diamond",
    stoneShape: "Emerald",
    style: "Solitaire",
    gender: "Women",
    price: 84500,
    originalPrice: 96000,
    offerBadge: "Bestseller",
    readyToShip: true,
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
    priceBreakup: {
      goldWeightGrams: 3.55,
      goldRatePerGram: 6200,
      goldValue: 22010,
      diamondCarats: 1.5,
      diamondValue: 51200,
      makingCharges: 8826,
      gst: 2464,
      total: 84500,
    },
    images: [
      { url: "/images/products/emerald-solitaire-1.jpg", altText: "Emerald cut solitaire diamond ring in 18K yellow gold" },
      { url: "/images/collection-solitaire.jpg", altText: "Emerald cut ring worn on hand" },
    ],
    isBestseller: true,
    isFeatured: true,
    occasions: ["Engagement", "Anniversary", "Everyday", "Gifting"],
    rating: 4.9,
    reviewCount: 24,
  },
  {
    id: "ary-002",
    slug: "tulip-petal-solitaire-ring",
    productCode: "ARY-R-102",
    name: "Tulip Petal Solitaire Ring",
    category: "rings",
    collection: "bridal",
    metalType: "ROSE_GOLD",
    availableMetals: ["ROSE_GOLD", "YELLOW_GOLD", "WHITE_GOLD"],
    purity: "18kt",
    stone: "lab-grown-diamond",
    stoneShape: "Round",
    style: "Solitaire",
    gender: "Women",
    price: 68000,
    originalPrice: 76000,
    offerBadge: "Ready to Ship",
    readyToShip: true,
    shortDescription: "Delicate blooming tulip basket setting holding a 1.00ct brilliant round diamond.",
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
    priceBreakup: {
      goldWeightGrams: 3.0,
      goldRatePerGram: 6200,
      goldValue: 18600,
      diamondCarats: 1.0,
      diamondValue: 40500,
      makingCharges: 6917,
      gst: 1983,
      total: 68000,
    },
    images: [
      { url: "/images/products/tulip.jpg", altText: "Tulip petal solitaire ring in 18K rose gold" },
      { url: "/images/craft-hands.jpg", altText: "Artisan inspecting setting" },
    ],
    isBestseller: true,
    isFeatured: true,
    occasions: ["Wedding", "Engagement", "Workwear", "Gifting"],
    rating: 4.8,
    reviewCount: 18,
  },
  {
    id: "ary-003",
    slug: "heritage-bridal-emerald-necklace",
    productCode: "ARY-N-301",
    name: "Heritage Emerald & Diamond Choker",
    category: "bridal",
    collection: "bridal",
    metalType: "CHAMPAGNE_GOLD",
    availableMetals: ["CHAMPAGNE_GOLD", "YELLOW_GOLD"],
    purity: "18kt",
    stone: "gemstone",
    stoneShape: "Emerald",
    style: "Choker",
    gender: "Women",
    price: 345000,
    originalPrice: 380000,
    offerBadge: "Royal Heirloom",
    readyToShip: false,
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
    priceBreakup: {
      goldWeightGrams: 34.0,
      goldRatePerGram: 6200,
      goldValue: 210800,
      diamondCarats: 4.8,
      diamondValue: 98000,
      makingCharges: 26150,
      gst: 10050,
      total: 345000,
    },
    images: [
      { url: "/images/hero-emerald.jpg", altText: "Heritage emerald and diamond necklace" },
      { url: "/images/collection-bridal.jpg", altText: "Bridal choker suite" },
    ],
    isBestseller: false,
    isFeatured: true,
    occasions: ["Wedding", "Anniversary"],
    rating: 5.0,
    reviewCount: 9,
  },
  {
    id: "ary-004",
    slug: "luminary-drop-earrings",
    productCode: "ARY-E-201",
    name: "Luminary Pear Drop Earrings",
    category: "earrings",
    collection: "everyday",
    metalType: "WHITE_GOLD",
    availableMetals: ["WHITE_GOLD", "YELLOW_GOLD", "ROSE_GOLD"],
    purity: "18kt",
    stone: "lab-grown-diamond",
    stoneShape: "Pear",
    style: "Drops",
    gender: "Women",
    price: 52000,
    originalPrice: 58000,
    offerBadge: "Bestseller",
    readyToShip: true,
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
    priceBreakup: {
      goldWeightGrams: 3.8,
      goldRatePerGram: 6200,
      goldValue: 23560,
      diamondCarats: 1.5,
      diamondValue: 21000,
      makingCharges: 5925,
      gst: 1515,
      total: 52000,
    },
    images: [
      { url: "/images/essence-earrings.jpg", altText: "Luminary pear drop diamond earrings" },
      { url: "/images/hero-emerald.jpg", altText: "Model wearing luminary earrings" },
    ],
    isBestseller: true,
    isFeatured: true,
    occasions: ["Everyday", "Workwear", "Gifting"],
    rating: 4.9,
    reviewCount: 31,
  },
  {
    id: "ary-005",
    slug: "celeste-solitaire-diamond-studs",
    productCode: "ARY-E-202",
    name: "Celeste Solitaire Diamond Studs",
    category: "earrings",
    collection: "solitaire",
    metalType: "YELLOW_GOLD",
    availableMetals: ["YELLOW_GOLD", "WHITE_GOLD", "ROSE_GOLD"],
    purity: "18kt",
    stone: "lab-grown-diamond",
    stoneShape: "Round",
    style: "Studs",
    gender: "Women",
    price: 44000,
    originalPrice: 49000,
    offerBadge: "Ready to Ship",
    readyToShip: true,
    shortDescription: "Classic 4-prong round brilliant diamond studs in polished 18K yellow gold.",
    description: "The quintessential fine jewellery foundation piece. Twin 0.50ct round ideal-cut lab diamonds set in secure screw-back 18K gold baskets. Engineered for perpetual daily wear with maximum light refraction.",
    specs: {
      metal: "18K Yellow Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "1.00 Total Carat",
      diamondColor: "E-F (Colourless)",
      diamondClarity: "VVS2",
      certification: "IGI Certified Pair",
      grossWeight: "2.60 grams",
    },
    priceBreakup: {
      goldWeightGrams: 2.4,
      goldRatePerGram: 6200,
      goldValue: 14880,
      diamondCarats: 1.0,
      diamondValue: 23000,
      makingCharges: 4839,
      gst: 1281,
      total: 44000,
    },
    images: [
      { url: "/images/products/solitaire-studs.jpg", altText: "Celeste solitaire diamond stud earrings in 18K gold" },
      { url: "/images/essence-earrings.jpg", altText: "Stud earrings profile on ear" },
    ],
    isBestseller: true,
    isFeatured: true,
    occasions: ["Everyday", "Workwear", "Gifting", "Anniversary"],
    rating: 4.9,
    reviewCount: 42,
  },
  {
    id: "ary-006",
    slug: "etoile-diamond-tennis-bracelet",
    productCode: "ARY-B-601",
    name: "Étoile Diamond Tennis Bracelet",
    category: "bracelets",
    collection: "everyday",
    metalType: "WHITE_GOLD",
    availableMetals: ["WHITE_GOLD", "YELLOW_GOLD", "ROSE_GOLD"],
    purity: "18kt",
    stone: "lab-grown-diamond",
    stoneShape: "Round",
    style: "Tennis",
    gender: "Women",
    price: 135000,
    originalPrice: 152000,
    offerBadge: "Making charges off",
    readyToShip: true,
    shortDescription: "A continuous ribbon of 52 calibrated round lab diamonds in 18K white gold.",
    description: "Sleek, fluid, and timelessly decadent. Fifty-two hand-selected lab-grown diamonds set in a continuous 4-prong articulated line with double security box clasp. Sits effortlessly flush on the wrist.",
    specs: {
      metal: "18K White Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "3.50 Total Carats",
      diamondColor: "E-F",
      diamondClarity: "VVS-VS",
      certification: "IGI Certified Line",
      grossWeight: "9.20 grams",
    },
    priceBreakup: {
      goldWeightGrams: 8.5,
      goldRatePerGram: 6200,
      goldValue: 52700,
      diamondCarats: 3.5,
      diamondValue: 68000,
      makingCharges: 10368,
      gst: 3932,
      total: 135000,
    },
    images: [
      { url: "/images/products/tennis-bracelet.jpg", altText: "Étoile diamond tennis bracelet on ivory silk" },
      { url: "/images/collection-everyday.jpg", altText: "Tennis bracelet worn on wrist" },
    ],
    isBestseller: true,
    isFeatured: true,
    occasions: ["Wedding", "Anniversary", "Everyday", "Gifting"],
    rating: 5.0,
    reviewCount: 15,
  },
  {
    id: "ary-007",
    slug: "sutram-diamond-bar-mangalsutra",
    productCode: "ARY-M-701",
    name: "Sutram Diamond Bar Mangalsutra",
    category: "mangalsutras",
    collection: "bridal",
    metalType: "YELLOW_GOLD",
    availableMetals: ["YELLOW_GOLD", "ROSE_GOLD"],
    purity: "18kt",
    stone: "lab-grown-diamond",
    stoneShape: "Round",
    style: "Lightweight",
    gender: "Women",
    price: 49500,
    originalPrice: 56000,
    offerBadge: "New Launch",
    readyToShip: true,
    shortDescription: "Modern geometric diamond bar with auspicious black beads on 18K yellow gold chain.",
    description: "Reimagined sacred union for the contemporary woman. Features seven aligned round brilliant lab-grown diamonds channel-set in an architectural 18K gold horizontal bar, flanked by sacred black glass beads.",
    specs: {
      metal: "18K Yellow Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "0.65 Total Carat",
      diamondColor: "F (Colourless)",
      diamondClarity: "VVS2",
      certification: "IGI Certified",
      grossWeight: "4.80 grams",
    },
    priceBreakup: {
      goldWeightGrams: 4.5,
      goldRatePerGram: 6200,
      goldValue: 27900,
      diamondCarats: 0.65,
      diamondValue: 14500,
      makingCharges: 5657,
      gst: 1443,
      total: 49500,
    },
    images: [
      { url: "/images/products/modern-mangalsutra.jpg", altText: "Sutram modern diamond bar mangalsutra on raw silk" },
      { url: "/images/hero-emerald.jpg", altText: "Mangalsutra necklace detail" },
    ],
    isBestseller: true,
    isFeatured: true,
    occasions: ["Everyday", "Workwear", "Wedding", "Anniversary"],
    rating: 4.9,
    reviewCount: 28,
  },
  {
    id: "ary-008",
    slug: "kavach-mens-diamond-band",
    productCode: "ARY-M-801",
    name: "Kavach Men's Diamond Band",
    category: "mens",
    collection: "everyday",
    metalType: "YELLOW_GOLD",
    availableMetals: ["YELLOW_GOLD", "WHITE_GOLD"],
    purity: "18kt",
    stone: "lab-grown-diamond",
    stoneShape: "Princess",
    style: "Band",
    gender: "Men",
    price: 72000,
    originalPrice: 81000,
    offerBadge: "Ready to Ship",
    readyToShip: true,
    shortDescription: "Satin-brushed 18K gold band with a channel-set row of princess-cut diamonds.",
    description: "Robust architectural proportion with a comfort-fit interior. Satin-brushed exterior borders with a recessed channel holding nine calibrated square princess-cut lab diamonds.",
    specs: {
      metal: "18K Yellow Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "0.90 Total Carats",
      diamondColor: "E-F",
      diamondClarity: "VS1",
      certification: "IGI Certified",
      grossWeight: "6.80 grams",
    },
    priceBreakup: {
      goldWeightGrams: 6.5,
      goldRatePerGram: 6200,
      goldValue: 40300,
      diamondCarats: 0.9,
      diamondValue: 22000,
      makingCharges: 7601,
      gst: 2099,
      total: 72000,
    },
    images: [
      { url: "/images/products/mens-diamond-band.jpg", altText: "Kavach men's diamond band in brushed gold" },
      { url: "/images/craft-hands.jpg", altText: "Artisan handcrafting ring" },
    ],
    isBestseller: false,
    isFeatured: true,
    occasions: ["Everyday", "Workwear", "Wedding", "Gifting"],
    rating: 4.8,
    reviewCount: 14,
  },
  {
    id: "ary-009",
    slug: "cascade-solitaire-pendant",
    productCode: "ARY-P-401",
    name: "Aura Solitaire Diamond Pendant",
    category: "pendants",
    collection: "solitaire",
    metalType: "YELLOW_GOLD",
    availableMetals: ["YELLOW_GOLD", "WHITE_GOLD", "ROSE_GOLD"],
    purity: "18kt",
    stone: "lab-grown-diamond",
    stoneShape: "Round",
    style: "Solitaire",
    gender: "Women",
    price: 39500,
    originalPrice: 45000,
    offerBadge: "Bestseller",
    readyToShip: true,
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
    priceBreakup: {
      goldWeightGrams: 2.6,
      goldRatePerGram: 6200,
      goldValue: 16120,
      diamondCarats: 0.8,
      diamondValue: 18000,
      makingCharges: 4230,
      gst: 1150,
      total: 39500,
    },
    images: [
      { url: "/images/essence-necklace.jpg", altText: "Aura solitaire diamond pendant" },
      { url: "/images/collection-everyday.jpg", altText: "Pendant worn with layered chains" },
    ],
    isBestseller: true,
    isFeatured: false,
    occasions: ["Everyday", "Workwear", "Gifting", "Anniversary"],
    rating: 4.9,
    reviewCount: 22,
  },
  {
    id: "ary-010",
    slug: "verve-tennis-necklace",
    productCode: "ARY-N-302",
    name: "Étoile Graduated Tennis Necklace",
    category: "necklaces",
    collection: "everyday",
    metalType: "WHITE_GOLD",
    availableMetals: ["WHITE_GOLD", "YELLOW_GOLD"],
    purity: "18kt",
    stone: "lab-grown-diamond",
    stoneShape: "Round",
    style: "Tennis",
    gender: "Women",
    price: 198000,
    originalPrice: 220000,
    offerBadge: "Making charges off",
    readyToShip: false,
    shortDescription: "A continuous strand of 64 round brilliant lab-grown diamonds graduating gently towards center.",
    description: "Pure light in motion. Each stone is individually four-prong set with hand-articulated links for maximum fluidity and drape. A modern heirloom designed to be worn both with a white shirt and silk sari.",
    specs: {
      metal: "18K White Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "5.50 Total Carats",
      diamondColor: "E-F",
      diamondClarity: "VVS-VS",
      certification: "IGI Certified Suite",
      grossWeight: "16.4 grams",
    },
    priceBreakup: {
      goldWeightGrams: 15.0,
      goldRatePerGram: 6200,
      goldValue: 93000,
      diamondCarats: 5.5,
      diamondValue: 85000,
      makingCharges: 14233,
      gst: 5767,
      total: 198000,
    },
    images: [
      { url: "/images/collection-everyday.jpg", altText: "Étoile tennis necklace in white gold" },
      { url: "/images/essence-necklace.jpg", altText: "Tennis necklace detail" },
    ],
    isBestseller: false,
    isFeatured: true,
    occasions: ["Wedding", "Anniversary", "Gifting"],
    rating: 5.0,
    reviewCount: 11,
  },
  {
    id: "ary-011",
    slug: "artisan-silver-statement-ring",
    productCode: "ARY-R-103",
    name: "Crescent 92.5 Silver Diamond Ring",
    category: "rings",
    collection: "everyday",
    metalType: "SILVER_925",
    availableMetals: ["SILVER_925"],
    purity: "925 Silver",
    stone: "lab-grown-diamond",
    stoneShape: "Round",
    style: "Lightweight",
    gender: "Women",
    price: 18500,
    originalPrice: 21000,
    offerBadge: "Under 20k",
    readyToShip: true,
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
    priceBreakup: {
      goldWeightGrams: 4.5,
      goldRatePerGram: 95,
      goldValue: 428,
      diamondCarats: 0.5,
      diamondValue: 14500,
      makingCharges: 3033,
      gst: 539,
      total: 18500,
    },
    images: [
      { url: "/images/collection-solitaire.jpg", altText: "Crescent silver diamond ring" },
      { url: "/images/products/tulip.jpg", altText: "Silver ring profile" },
    ],
    isBestseller: false,
    isFeatured: false,
    occasions: ["Everyday", "Workwear", "Gifting"],
    rating: 4.7,
    reviewCount: 16,
  },
  {
    id: "ary-012",
    slug: "radiant-heritage-bridal-set",
    productCode: "ARY-B-501",
    name: "Noor Heritage Bridal Suite",
    category: "bridal",
    collection: "bridal",
    metalType: "YELLOW_GOLD",
    availableMetals: ["YELLOW_GOLD", "CHAMPAGNE_GOLD"],
    purity: "18kt",
    stone: "lab-grown-diamond",
    stoneShape: "Round",
    style: "Cocktail",
    gender: "Women",
    price: 485000,
    originalPrice: 530000,
    offerBadge: "Royal Heirloom",
    readyToShip: false,
    shortDescription: "A complete royal bridal set comprising necklace, earrings, and matching maang tikka.",
    description: "Crafted in homage to the royal ateliers of Awadh, Noor brings regal Lucknow grandeur into the modern era with guilt-free, carbon-conscious brilliance.",
    specs: {
      metal: "18K Yellow Gold",
      purity: "18K (750 Hallmark)",
      diamondCarat: "8.20 Total Carats",
      diamondColor: "E-F",
      diamondClarity: "VVS1-VVS2",
      certification: "IGI Master Certified",
      grossWeight: "62.0 grams",
    },
    priceBreakup: {
      goldWeightGrams: 58.0,
      goldRatePerGram: 6200,
      goldValue: 359600,
      diamondCarats: 8.2,
      diamondValue: 85000,
      makingCharges: 26272,
      gst: 14128,
      total: 485000,
    },
    images: [
      { url: "/images/collection-bridal.jpg", altText: "Noor bridal necklace and earrings set" },
      { url: "/images/hero-emerald.jpg", altText: "Bridal suite modeled" },
    ],
    isBestseller: true,
    isFeatured: true,
    occasions: ["Wedding", "Anniversary"],
    rating: 5.0,
    reviewCount: 8,
  },
];

export const METAL_NAMES: Record<MetalType, string> = {
  YELLOW_GOLD: "18K Yellow Gold",
  WHITE_GOLD: "18K White Gold",
  ROSE_GOLD: "18K Rose Gold",
  CHAMPAGNE_GOLD: "18K Champagne Gold",
  SILVER_925: "92.5 Sterling Silver",
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  rings: "Rings",
  earrings: "Earrings",
  pendants: "Pendants",
  necklaces: "Necklaces",
  bracelets: "Bracelets & Bangles",
  mangalsutras: "Mangalsutras",
  solitaires: "Solitaires",
  bridal: "Bridal & Sets",
  mens: "Men's Collection",
};

/** Formats number into Indian Currency format, e.g. ₹84,500 */
export function formatPriceINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

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
    (p) =>
      p.slug !== currentSlug &&
      (p.category === current.category || p.collection === current.collection)
  ).slice(0, limit);
}
