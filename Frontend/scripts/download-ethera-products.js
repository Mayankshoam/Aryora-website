const fs = require('fs');
const https = require('https');
const path = require('path');

const sitemapData = fs.readFileSync('Frontend/scripts/product-images-sitemap.xml', 'utf8');

const urlBlocks = sitemapData.split('<url>');
const catalog = [];
for (const b of urlBlocks) {
  const locMatch = b.match(/<loc>([^<]+)<\/loc>/);
  const imgMatches = [...b.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(m => m[1]);
  if (locMatch && imgMatches.length >= 2) {
    catalog.push({
      page: locMatch[1].toLowerCase(),
      images: imgMatches
    });
  }
}

function findMatches(keyword, excludeKeywords = [], count = 5) {
  return catalog.filter(p => {
    const hasKw = p.page.includes(keyword);
    const hasEx = excludeKeywords.some(ex => p.page.includes(ex));
    return hasKw && !hasEx;
  }).slice(0, count);
}

const productMap = {
  // Rings (5)
  'ring-01': findMatches('-ring', ['earring'], 5)[0],
  'ring-02': findMatches('-ring', ['earring'], 5)[1],
  'ring-03': findMatches('-ring', ['earring'], 5)[2],
  'ring-04': findMatches('-ring', ['earring'], 5)[3],
  'ring-05': findMatches('-ring', ['earring'], 5)[4],

  // Earrings (4)
  'earring-01': findMatches('earring', [], 4)[0],
  'earring-02': findMatches('earring', [], 4)[1],
  'earring-03': findMatches('earring', [], 4)[2],
  'earring-04': findMatches('earring', [], 4)[3],

  // Pendants (3)
  'pendant-01': findMatches('pendant', [], 3)[0],
  'pendant-02': findMatches('pendant', [], 3)[1],
  'pendant-03': findMatches('pendant', [], 3)[2],

  // Necklaces (3)
  'necklace-01': findMatches('necklace', [], 3)[0],
  'necklace-02': findMatches('necklace', [], 3)[1],
  'necklace-03': findMatches('necklace', [], 3)[2],

  // Bracelets (3)
  'bracelet-01': findMatches('bracelet', [], 3)[0],
  'bracelet-02': findMatches('bracelet', [], 3)[1],
  'bracelet-03': findMatches('bracelet', [], 3)[2],

  // Solitaires (3)
  'solitaire-01': findMatches('solitaire', [], 3)[0],
  'solitaire-02': findMatches('solitaire', [], 3)[1],
  'solitaire-03': findMatches('solitaire', [], 3)[2],

  // Bridal (3)
  'bridal-01': findMatches('cocktail', [], 3)[0],
  'bridal-02': findMatches('cocktail', [], 3)[1],
  'bridal-03': findMatches('cocktail', [], 3)[2],
};

const categoryMap = {
  'cat-rings': productMap['ring-01'].images[0],
  'cat-earrings': productMap['earring-01'].images[0],
  'cat-solitaires': productMap['solitaire-01'].images[0],
  'cat-mangalsutras': findMatches('mangalsutra', [], 1)[0].images[0],
  'cat-necklaces': productMap['necklace-01'].images[0],
  'cat-bracelets': productMap['bracelet-01'].images[0],
  'cat-pendants': productMap['pendant-01'].images[0],
  'cat-bridal': productMap['bridal-01'].images[0],
};

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    // Add transform query for webp / jpg
    const transformedUrl = url + '?tr=w-1000,q-85,c-at_max';
    const file = fs.createWriteStream(destPath);
    https.get(transformedUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${transformedUrl}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function start() {
  console.log('Downloading 48 Ethera product images into Frontend/public/products/...');
  const targetProductsDir = path.join(__dirname, '..', 'public', 'products');
  const rootProductsDir = path.join(__dirname, '..', '..', 'public', 'products');
  if (!fs.existsSync(targetProductsDir)) fs.mkdirSync(targetProductsDir, { recursive: true });
  if (!fs.existsSync(rootProductsDir)) fs.mkdirSync(rootProductsDir, { recursive: true });

  for (const [id, match] of Object.entries(productMap)) {
    const fileA = path.join(targetProductsDir, `${id}-a.jpg`);
    const fileB = path.join(targetProductsDir, `${id}-b.jpg`);
    
    console.log(`Downloading ${id} (${match.page})...`);
    await downloadImage(match.images[0], fileA);
    await downloadImage(match.images[1], fileB);

    // copy to root
    fs.copyFileSync(fileA, path.join(rootProductsDir, `${id}-a.jpg`));
    fs.copyFileSync(fileB, path.join(rootProductsDir, `${id}-b.jpg`));
  }

  console.log('\nDownloading 8 Category tile images into Frontend/public/site/...');
  const targetSiteDir = path.join(__dirname, '..', 'public', 'site');
  const rootSiteDir = path.join(__dirname, '..', '..', 'public', 'site');
  if (!fs.existsSync(targetSiteDir)) fs.mkdirSync(targetSiteDir, { recursive: true });
  if (!fs.existsSync(rootSiteDir)) fs.mkdirSync(rootSiteDir, { recursive: true });

  for (const [catName, imgUrl] of Object.entries(categoryMap)) {
    const fileDest = path.join(targetSiteDir, `${catName}.jpg`);
    console.log(`Downloading ${catName}...`);
    await downloadImage(imgUrl, fileDest);
    fs.copyFileSync(fileDest, path.join(rootSiteDir, `${catName}.jpg`));
  }

  // Update Frontend/data/products.json and data/products.json
  console.log('\nUpdating products.json and products.csv with Ethera images...');
  const jsonPath = path.join(__dirname, '..', 'data', 'products.json');
  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  for (const p of products) {
    p.images = [`/products/${p.id}-a.jpg`, `/products/${p.id}-b.jpg`];
  }

  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(__dirname, '..', '..', 'data', 'products.json'), JSON.stringify(products, null, 2));

  // Regenerate CSV
  const header = Object.keys(products[0]);
  const csvRows = [header.join(',')];
  for (const p of products) {
    const row = header.map(h => {
      const val = p[h];
      if (Array.isArray(val)) {
        return `"${val.join('|')}"`;
      }
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvRows.push(row.join(','));
  }
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'products.csv'), csvRows.join('\n'));
  fs.writeFileSync(path.join(__dirname, '..', '..', 'data', 'products.csv'), csvRows.join('\n'));

  // Update site.json
  console.log('Updating site.json category images...');
  const siteJsonPath = path.join(__dirname, '..', 'data', 'site.json');
  const siteConfig = JSON.parse(fs.readFileSync(siteJsonPath, 'utf8'));
  for (const cat of siteConfig.categorySection.categories) {
    cat.image = `/site/${cat.id}.jpg`;
  }
  fs.writeFileSync(siteJsonPath, JSON.stringify(siteConfig, null, 2));
  fs.writeFileSync(path.join(__dirname, '..', '..', 'data', 'site.json'), JSON.stringify(siteConfig, null, 2));

  console.log('All product images and category tiles successfully updated from Ethera!');
}

start().catch(err => {
  console.error('Download failed:', err);
  process.exit(1);
});
