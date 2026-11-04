import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  MIN_ANTI_TARNISH_PRICE,
  MAX_ANTI_TARNISH_PRICE,
  validateAntiTarnishPrice,
  autoAdjustAntiTarnishPrice,
} from "@/lib/antiTarnishConfig";
import { Product } from "@/lib/data";

const DATA_JSON_PATH = path.join(process.cwd(), "data", "products.json");
const FRONTEND_JSON_PATH = path.join(process.cwd(), "Frontend", "data", "products.json");

interface ImportRow {
  product_name: string;
  sku: string;
  category?: string;
  subcategory?: string;
  price: number | string;
  mrp?: number | string;
  description?: string;
  image_urls?: string;
  stock?: number | string;
  tags?: string;
  image_source?: string;
  weightGrams?: number | string;
  metal?: string;
}

interface RowValidationResult {
  rowNumber: number;
  data: ImportRow;
  valid: boolean;
  isUpdate: boolean;
  errors: string[];
  adjustedPrice?: number;
  adjustedMrp?: number;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSVText(csvContent: string): ImportRow[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const rows: ImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: any = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });

    rows.push({
      product_name: row.product_name || row.title || row.name || "",
      sku: (row.sku || "").toUpperCase(),
      category: row.category || "Anti-Tarnish Jewellery",
      subcategory: row.subcategory || row.type || "Necklaces",
      price: row.price || "",
      mrp: row.mrp || row.compare_at_price || "",
      description: row.description || row.body || "",
      image_urls: row.image_urls || row.images || "",
      stock: row.stock || 50,
      tags: row.tags || "Anti-Tarnish, Waterproof, Stainless Steel",
      image_source: row.image_source || row.license_note || "Imported Catalog",
    });
  }

  return rows;
}

function getExistingProducts(): Product[] {
  try {
    if (fs.existsSync(DATA_JSON_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_JSON_PATH, "utf8"));
    }
    if (fs.existsSync(FRONTEND_JSON_PATH)) {
      return JSON.parse(fs.readFileSync(FRONTEND_JSON_PATH, "utf8"));
    }
  } catch (err) {
    console.error("Error loading products.json:", err);
  }
  return [];
}

function saveProducts(products: Product[]) {
  const jsonStr = JSON.stringify(products, null, 2);
  try {
    if (fs.existsSync(path.dirname(DATA_JSON_PATH))) {
      fs.writeFileSync(DATA_JSON_PATH, jsonStr, "utf8");
    }
    if (fs.existsSync(path.dirname(FRONTEND_JSON_PATH))) {
      fs.writeFileSync(FRONTEND_JSON_PATH, jsonStr, "utf8");
    }
  } catch (err) {
    console.error("Error writing products.json:", err);
  }
}

/**
 * Validates import rows against anti-tarnish price rules, SKU uniqueness, and mandatory fields.
 */
function validateImportRows(
  rows: ImportRow[],
  existingProducts: Product[],
  autoAdjust: boolean = false
): {
  results: RowValidationResult[];
  summary: { total: number; valid: number; updates: number; failed: number };
} {
  const seenSkusInFile = new Set<string>();
  const existingSkuMap = new Map<string, Product>();
  existingProducts.forEach((p) => {
    if (p.sku) existingSkuMap.set(p.sku.toUpperCase(), p);
  });

  const results: RowValidationResult[] = [];
  let validCount = 0;
  let updateCount = 0;
  let failedCount = 0;

  rows.forEach((row, idx) => {
    const rowErrors: string[] = [];
    const rowNumber = idx + 2; // +1 header, +1 1-based index
    const cleanSku = (row.sku || "").trim().toUpperCase();

    // 1. Mandatory Product Name
    if (!row.product_name || !row.product_name.trim()) {
      rowErrors.push("Missing required field: product_name");
    }

    // 2. Mandatory SKU & Duplicates within file
    if (!cleanSku) {
      rowErrors.push("Missing required field: sku");
    } else if (seenSkusInFile.has(cleanSku)) {
      rowErrors.push(`Duplicate SKU '${cleanSku}' within import file`);
    } else {
      seenSkusInFile.add(cleanSku);
    }

    // 3. Price Validation & Auto-Adjust
    const rawPrice = parseFloat(String(row.price).replace(/[^0-9.]/g, ""));
    const rawMrp = parseFloat(String(row.mrp).replace(/[^0-9.]/g, ""));

    let finalPrice = rawPrice;
    let finalMrp = rawMrp;

    if (isNaN(rawPrice) || rawPrice <= 0) {
      rowErrors.push(`Invalid price '${row.price}': must be a positive number`);
    } else if (autoAdjust) {
      // Auto-adjust supplier/clearance price into [499, 2999] rounded to 9 ending
      const adjusted = autoAdjustAntiTarnishPrice(rawPrice, rawMrp);
      finalPrice = adjusted.price;
      finalMrp = adjusted.mrp;
    } else {
      // Strict rule enforcement
      const priceVal = validateAntiTarnishPrice(rawPrice);
      if (!priceVal.valid) {
        rowErrors.push(priceVal.reason || "Price outside permitted range");
      }
    }

    const isUpdate = cleanSku ? existingSkuMap.has(cleanSku) : false;
    const isValid = rowErrors.length === 0;

    if (isValid) {
      validCount++;
      if (isUpdate) updateCount++;
    } else {
      failedCount++;
    }

    results.push({
      rowNumber,
      data: row,
      valid: isValid,
      isUpdate,
      errors: rowErrors,
      adjustedPrice: finalPrice,
      adjustedMrp: finalMrp,
    });
  });

  return {
    results,
    summary: {
      total: rows.length,
      valid: validCount,
      updates: updateCount,
      failed: failedCount,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      csvText,
      rows: rawRows,
      autoAdjust = true,
      defaultLicense = "Imported from prao.com under catalog distribution license",
      mode = "preview", // "preview" | "commit" | "prao_direct_sync"
    } = body;

    const existingProducts = getExistingProducts();

    // SPECIAL MODE: PRAO DIRECT LIVE SYNC
    if (mode === "prao_direct_sync") {
      try {
        const praoRes = await fetch("https://prao.com/products.json?limit=250");
        const praoData = await praoRes.json();
        const praoProducts: any[] = praoData.products || [];

        let syncedCount = 0;
        let updatedCount = 0;

        const updatedProducts = [...existingProducts];
        const skuIndexMap = new Map<string, number>();
        updatedProducts.forEach((p, idx) => {
          if (p.sku) skuIndexMap.set(p.sku.toUpperCase(), idx);
        });

        praoProducts.forEach((item: any) => {
          const variant = item.variants?.[0] || {};
          const sku = (variant.sku || `PRAO-${item.id}`).toUpperCase();
          const rawPrice = parseFloat(variant.price) || 99;
          const rawMrp = parseFloat(variant.compare_at_price) || 1400;

          const { price, mrp } = autoAdjustAntiTarnishPrice(rawPrice, rawMrp);

          const images = (item.images || []).map((img: any) => img.src);
          if (images.length === 0) images.push("/site/cat-bracelets.svg");

          const cleanType = item.product_type || "Jewellery";
          const tags = Array.isArray(item.tags)
            ? [...item.tags, "Anti-Tarnish", "Waterproof"]
            : ["Anti-Tarnish", "Waterproof"];

          const productSlug = `anti-tarnish-${item.handle || sku.toLowerCase()}`;

          const productRecord: Product = {
            id: `prao-${item.id}`,
            slug: productSlug,
            name: item.title, // Exact name preserved
            category: "Anti-Tarnish Jewellery",
            subcategory: cleanType,
            metal: "316L Stainless Steel / PVD Gold",
            purity: "Anti-Tarnish PVD",
            stone: "Austrian Crystals / Enamel",
            carat: 0,
            shape: "Artisan",
            color: "Gold/Silver",
            clarity: "AAA+",
            certificate: "Anti-Tarnish Certified",
            weightGrams: variant.grams || 25,
            sizes: ["Adjustable / Standard"],
            occasion: "Daily Wear & Travel",
            gender: "Women",
            style: "Waterproof Minimalist",
            price: price,
            mrp: mrp,
            discountPercent: Math.round(((mrp - price) / mrp) * 100),
            stock: 99,
            images: images,
            description:
              item.body_html?.replace(/<[^>]+>/g, " ").trim() ||
              "Waterproof anti-tarnish fine fashion jewellery crafted with multi-layer PVD vacuum coating. Sweat-proof, perfume-safe, and skin-friendly.",
            tags: tags,
            isBestseller: syncedCount % 5 === 0,
            isNew: true,
            sku: sku,
            image_source: defaultLicense,
            isAntiTarnish: true,
            waterproof: true,
          };

          if (skuIndexMap.has(sku)) {
            const idx = skuIndexMap.get(sku)!;
            updatedProducts[idx] = { ...updatedProducts[idx], ...productRecord };
            updatedCount++;
          } else {
            updatedProducts.push(productRecord);
            skuIndexMap.set(sku, updatedProducts.length - 1);
            syncedCount++;
          }
        });

        saveProducts(updatedProducts);

        return NextResponse.json({
          success: true,
          mode: "prao_direct_sync",
          summary: {
            totalFromPrao: praoProducts.length,
            created: syncedCount,
            updated: updatedCount,
            totalProductsNow: updatedProducts.length,
          },
        });
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: `Failed to fetch from prao.com: ${err.message}` },
          { status: 502 }
        );
      }
    }

    // NORMAL CSV / EXCEL PARSING
    let rowsToProcess: ImportRow[] = [];
    if (csvText) {
      rowsToProcess = parseCSVText(csvText);
    } else if (Array.isArray(rawRows)) {
      rowsToProcess = rawRows;
    }

    if (rowsToProcess.length === 0) {
      return NextResponse.json(
        { success: false, error: "No product rows found in input." },
        { status: 400 }
      );
    }

    // Run Validation
    const validation = validateImportRows(rowsToProcess, existingProducts, autoAdjust);

    // If PREVIEW MODE -> Return validation results & error report
    if (mode === "preview") {
      return NextResponse.json({
        success: true,
        mode: "preview",
        summary: validation.summary,
        preview: validation.results.slice(0, 50),
        totalPreviewCount: validation.results.length,
        errors: validation.results.filter((r) => !r.valid),
      });
    }

    // If COMMIT MODE -> Save valid rows into database
    if (mode === "commit") {
      const validRows = validation.results.filter((r) => r.valid);
      const updatedProducts = [...existingProducts];
      const skuIndexMap = new Map<string, number>();
      updatedProducts.forEach((p, idx) => {
        if (p.sku) skuIndexMap.set(p.sku.toUpperCase(), idx);
      });

      let created = 0;
      let updated = 0;

      validRows.forEach((item) => {
        const row = item.data;
        const sku = row.sku.trim().toUpperCase();
        const price = item.adjustedPrice ?? (parseFloat(String(row.price)) || 599);
        const mrp = item.adjustedMrp ?? (parseFloat(String(row.mrp)) || Math.round(price * 1.8));

        const imageList = row.image_urls
          ? row.image_urls.split(/[,|]/).map((s) => s.trim()).filter(Boolean)
          : ["/site/cat-bracelets.svg"];

        const tagList = row.tags
          ? row.tags.split(/[,|]/).map((s) => s.trim()).filter(Boolean)
          : ["Anti-Tarnish", "Waterproof"];

        const slug = `anti-tarnish-${sku.toLowerCase()}-${row.product_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 40)}`;

        const productRecord: Product = {
          id: `prod-${sku.toLowerCase()}`,
          slug: slug,
          name: row.product_name, // Exact name preserved
          category: row.category || "Anti-Tarnish Jewellery",
          subcategory: row.subcategory || "Necklaces",
          metal: row.metal || "316L Stainless Steel / PVD Gold",
          purity: "Anti-Tarnish PVD",
          stone: "Austrian Crystals / None",
          carat: 0,
          shape: "Artisan",
          color: "Gold / Silver",
          clarity: "AAA+",
          certificate: "Anti-Tarnish Certified",
          weightGrams: parseFloat(String(row.weightGrams)) || 20,
          sizes: ["Standard / Adjustable"],
          occasion: "Daily Wear & Travel",
          gender: "Women",
          style: "Anti-Tarnish Waterproof",
          price: price,
          mrp: mrp,
          discountPercent: Math.round(((mrp - price) / mrp) * 100),
          stock: parseInt(String(row.stock), 10) || 50,
          images: imageList,
          description: row.description || "100% Waterproof, sweat-proof anti-tarnish jewellery.",
          tags: tagList,
          isBestseller: false,
          isNew: true,
          sku: sku,
          image_source: row.image_source || defaultLicense,
          isAntiTarnish: true,
          waterproof: true,
        };

        if (skuIndexMap.has(sku)) {
          const existingIdx = skuIndexMap.get(sku)!;
          // Re-import updates price, stock, and details without duplicate
          updatedProducts[existingIdx] = {
            ...updatedProducts[existingIdx],
            ...productRecord,
          };
          updated++;
        } else {
          updatedProducts.push(productRecord);
          skuIndexMap.set(sku, updatedProducts.length - 1);
          created++;
        }
      });

      saveProducts(updatedProducts);

      return NextResponse.json({
        success: true,
        mode: "commit",
        summary: {
          total: rowsToProcess.length,
          valid: validRows.length,
          created,
          updated,
          failed: validation.summary.failed,
          totalProducts: updatedProducts.length,
        },
      });
    }

    return NextResponse.json({ success: false, error: "Invalid mode." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
