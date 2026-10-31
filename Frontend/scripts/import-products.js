const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'data', 'products.csv');
const JSON_PATH = path.join(__dirname, '..', 'data', 'products.json');
const ROOT_CSV_PATH = path.join(__dirname, '..', '..', 'data', 'products.csv');
const ROOT_JSON_PATH = path.join(__dirname, '..', '..', 'data', 'products.json');

function parseCsv(content) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip CRLF
      }
      currentLine.push(currentField.trim());
      if (currentLine.length > 0 && currentLine.some(f => f.length > 0)) {
        lines.push(currentLine);
      }
      currentLine = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    lines.push(currentLine);
  }

  return lines;
}

function runImport() {
  const sourcePath = fs.existsSync(CSV_PATH) ? CSV_PATH : ROOT_CSV_PATH;
  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: Could not find products.csv at ${CSV_PATH} or ${ROOT_CSV_PATH}`);
    process.exit(1);
  }

  const rawCsv = fs.readFileSync(sourcePath, 'utf8');
  const rows = parseCsv(rawCsv);

  if (rows.length < 2) {
    console.error('Error: CSV file must contain a header and at least one data row.');
    process.exit(1);
  }

  const headers = rows[0];
  const products = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const product = {};

    headers.forEach((h, idx) => {
      let val = row[idx] || '';

      // Type conversions
      if (h === 'carat' || h === 'weightGrams' || h === 'price' || h === 'discountPercent' || h === 'stock') {
        val = parseFloat(val) || 0;
      } else if (h === 'sizes' || h === 'images' || h === 'tags') {
        val = val ? val.split('|').map(s => s.trim()).filter(Boolean) : [];
      } else if (h === 'isBestseller' || h === 'isNew') {
        val = val.toLowerCase() === 'true' || val === '1';
      }

      product[h] = val;
    });

    products.push(product);
  }

  const jsonString = JSON.stringify(products, null, 2);

  // Write to both Frontend/data and root data/
  fs.writeFileSync(JSON_PATH, jsonString, 'utf8');
  if (fs.existsSync(path.dirname(ROOT_JSON_PATH))) {
    fs.writeFileSync(ROOT_JSON_PATH, jsonString, 'utf8');
  }

  console.log(`Successfully imported ${products.length} products from CSV to products.json!`);
}

runImport();
