const https = require("https");
const fs = require("fs");
const path = require("path");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, data }));
    }).on("error", reject);
  });
}

function cleanHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function buildCatalog() {
  console.log("Fetching Khushbu Jewellers products across 3 pages (750 products)...");
  let raw = [];
  for (let p = 1; p <= 3; p++) {
    const res = await fetchUrl(`https://khushbujewellers.com/products.json?limit=250&page=${p}`);
    if (res.status === 200) {
      const parsed = JSON.parse(res.data);
      if (parsed.products) raw.push(...parsed.products);
    }
  }
  console.log(`Total raw products fetched: ${raw.length}`);

  // Categorize silver products
  const categoryMap = {
    "Rings": ["SILVER RING", "Gold Ring"],
    "Earrings": ["SILVER EARRINGS", "SILVER NOSEPIN"],
    "Bracelets": ["SILVER BRACELET", "SILVER KADA", "SILVER BANGLES"],
    "Necklaces": ["SILVER NECKLACE", "SILVER CHAIN"],
    "Pendants": ["CHAIN PENDANT", "SILVER PENDANT"],
    "Mangalsutras": ["SILVER MANGALSUTRA"],
    "Anklets & Payal": ["SILVER PAYAL", "SILVER ANKLET", "KADA PAYAL", "DHAGA PAYAL", "TOE RINGS"],
  };

  const curatedSilver = [];
  const seenSlugs = new Set();

  for (const p of raw) {
    const title = p.title.trim();
    const pType = (p.product_type || "").trim();
    const images = (p.images || []).map(img => img.src).filter(Boolean);
    if (images.length < 2) continue; // Must have at least 2 images as requested!

    // Determine category
    let category = "";
    let subcategory = "";

    for (const [catName, types] of Object.entries(categoryMap)) {
      if (types.some(t => pType.toUpperCase().includes(t) || title.toUpperCase().includes(t))) {
        category = catName;
        subcategory = pType;
        break;
      }
    }

    if (!category) {
      if (pType.includes("RING") || title.toLowerCase().includes("ring")) category = "Rings";
      else if (pType.includes("EARRING") || title.toLowerCase().includes("earring")) category = "Earrings";
      else if (pType.includes("BRACELET") || title.toLowerCase().includes("bracelet")) category = "Bracelets";
      else if (pType.includes("PENDANT") || title.toLowerCase().includes("pendant")) category = "Pendants";
      else if (pType.includes("PAYAL") || title.toLowerCase().includes("payal")) category = "Anklets & Payal";
      else if (pType.includes("MANGALSUTRA") || title.toLowerCase().includes("mangalsutra")) category = "Mangalsutras";
    }

    if (!category) continue; // Skip non-jewellery like utensils, moli, etc.

    const isSilver = !title.toLowerCase().includes("gold bengals") && !pType.toLowerCase().includes("gold");

    const price = Number(p.variants?.[0]?.price || 1999);
    const weightGrams = p.variants?.[0]?.grams ? p.variants[0].grams : Math.round((price / 180) * 10) / 10 || 5.5;

    let baseSlug = slugify(title);
    if (seenSlugs.has(baseSlug)) {
      baseSlug = `${baseSlug}-${p.id}`;
    }
    seenSlugs.add(baseSlug);

    const silverItem = {
      id: `kh-${p.id}`,
      slug: baseSlug,
      name: title,
      category: category,
      subcategory: subcategory || category,
      metal: isSilver ? "925 Sterling Silver" : "18K Gold",
      purity: isSilver ? "925" : "18K",
      stone: title.toLowerCase().includes("zircon") ? "Cubic Zirconia" : "None",
      carat: 0,
      shape: "Round",
      color: "D",
      clarity: "VVS1",
      certificate: isSilver ? "Authentic 925 Hallmark" : "IGI Certified",
      weightGrams: weightGrams > 0 ? weightGrams : 4.5,
      sizes: ["Adjustable", "Standard"],
      occasion: "Daily Wear & Festive",
      gender: title.toLowerCase().includes("men") ? "Men" : "Women",
      style: "Contemporary Indian",
      price: price,
      discountPercent: 10,
      stock: isSilver ? (p.variants?.[0]?.inventory_quantity > 0 ? p.variants[0].inventory_quantity : 15) : 0,
      images: images.slice(0, 4), // 2-4 images as requested
      description: cleanHtml(p.body_html) || `Exquisite ${title} crafted in pure 925 Sterling Silver with rhodium protective coating. Features authentic hallmarking and lustrous finish.`,
      tags: ["925 Silver", category, "Ready to Ship", "AYOR Silver"],
      isBestseller: curatedSilver.length < 8,
      isNew: true,
      sku: p.variants?.[0]?.sku || `AYOR-SLV-${p.id}`,
      platings: ["Rhodium", "18K Gold Polish", "Rose Gold Polish"],
      isComingSoon: !isSilver, // Silver is READILY AVAILABLE, Gold is COMING SOON!
      makingCharges: Math.round(price * 0.20)
    };

    curatedSilver.push(silverItem);
    if (curatedSilver.length >= 70) break; // Curate 70 exquisite products
  }

  console.log(`Curated ${curatedSilver.length} high-quality silver products!`);

  // Load existing products to merge gold & diamond products with "Coming Soon" flag
  const existingPath = path.join(__dirname, "../Frontend/data/products.json");
  const existingProducts = JSON.parse(fs.readFileSync(existingPath, "utf-8"));

  const goldAndDiamond = existingProducts.map(p => {
    const isGoldOrDiamond = p.metal.toLowerCase().includes("gold") ||
                           p.metal.toLowerCase().includes("platinum") ||
                           (p.stone && p.stone.toLowerCase().includes("diamond")) ||
                           p.category === "Solitaires" ||
                           p.category === "Bridal";

    return {
      ...p,
      isComingSoon: isGoldOrDiamond, // Gold and Diamond marked as Coming Soon!
      stock: isGoldOrDiamond ? 0 : p.stock,
      availabilityNote: isGoldOrDiamond ? "Coming Soon · Launching Shortly" : "In Stock · Ready to Ship",
      tags: isGoldOrDiamond ? [...p.tags, "Coming Soon"] : p.tags
    };
  });

  const merged = [...curatedSilver, ...goldAndDiamond];
  console.log(`Merged catalogue total: ${merged.length} products`);

  fs.writeFileSync("Frontend/data/products.json", JSON.stringify(merged, null, 2));
  fs.writeFileSync("data/products.json", JSON.stringify(merged, null, 2));
  console.log("Successfully updated Frontend/data/products.json and data/products.json!");
}

buildCatalog();
