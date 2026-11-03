const https = require("https");
const fs = require("fs");

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

async function inspectCatalog() {
  let allProducts = [];
  let page = 1;
  while (page <= 5) { // Check first 5 pages (up to 1250 products)
    console.log(`Fetching page ${page}...`);
    const res = await fetchUrl(`https://khushbujewellers.com/products.json?limit=250&page=${page}`);
    if (res.status !== 200) break;
    const parsed = JSON.parse(res.data);
    if (!parsed.products || parsed.products.length === 0) break;
    allProducts.push(...parsed.products);
    console.log(`Page ${page}: got ${parsed.products.length} products. Total so far: ${allProducts.length}`);
    page++;
  }

  console.log("Total products fetched:", allProducts.length);
  fs.writeFileSync("scripts/khushbu-products-sample.json", JSON.stringify(allProducts.slice(0, 50), null, 2));

  // Analyze product types / tags / titles to classify silver vs gold vs diamond
  const types = {};
  const metals = { silver: 0, gold: 0, diamond: 0, other: 0 };

  allProducts.forEach(p => {
    const pt = p.product_type || "Uncategorized";
    types[pt] = (types[pt] || 0) + 1;

    const fullText = (p.title + " " + (p.product_type || "") + " " + (p.tags ? p.tags.join(" ") : "")).toLowerCase();
    if (fullText.includes("silver") || fullText.includes("chandi") || fullText.includes("925")) {
      metals.silver++;
    } else if (fullText.includes("gold") || fullText.includes("sona")) {
      metals.gold++;
    } else if (fullText.includes("diamond") || fullText.includes("heera") || fullText.includes("solitaire")) {
      metals.diamond++;
    } else {
      metals.other++;
    }
  });

  console.log("Product types breakdown:", types);
  console.log("Metals breakdown:", metals);
}

inspectCatalog();

