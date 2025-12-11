/**
 * Generate a Medusa-compatible products CSV from local assets.
 *
 * Scans `storefront/public/images/products` for product folders.
 * Each product folder may either:
 *  - contain images and a `description.txt`, or
 *  - contain subfolders per color (each with images and `description.txt`).
 *
 * The script outputs `backend/data/auto-products.csv` using the template schema:
 * handle,title,description,collection,category,tags,thumbnail,images,material,origin_country,options,color,size,variant_title,sku,inventory_quantity,manage_inventory,allow_backorder,currency_code,price
 *
 * Assumptions and defaults:
 *  - currency: inferred from `description.txt` first line if it contains `$` (usd) otherwise defaults to `ngn` when DEFAULT_REGION=ng, else `usd`.
 *  - price: parsed as a number from `description.txt` first line (e.g., "💰$39" -> 3900 minor units).
 *  - sizes: parsed from a line like "Sizes: 36–45" or "Sizes: 36-45". If missing, defaults to [36..45].
 *  - colors: derived from subfolder names; if no subfolders, color is "Default".
 *  - inventory: default 20; manage_inventory=true; allow_backorder=false.
 *  - category: "shoes"; collection and tags empty; material/origin_country empty.
 *  - thumbnail: first image discovered; images: pipe-separated list of all images under product folder.
 *
 * Run: `node scripts/generate-products-from-public.js`
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const BASE_DIR = path.join(PROJECT_ROOT, 'storefront', 'public', 'images', 'products');
const OUTPUT_CSV = path.join(PROJECT_ROOT, 'backend', 'data', 'auto-products.csv');

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[“”"']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function posixImagePath(absFile) {
  const rel = path.relative(path.join(PROJECT_ROOT, 'storefront', 'public'), absFile);
  return '/' + rel.split(path.sep).join('/');
}

function isImage(file) {
  return /\.(jpe?g|png|webp|gif)$/i.test(file);
}

function readDescription(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let priceLine = lines.find(l => /\$|₦|eur|usd|ngn/i.test(l)) || '';
  let titleLine = lines[1] || lines[0] || '';
  let descLines = [];
  let sizesLine = lines.find(l => /^sizes\s*[:：]/i.test(l)) || '';
  // Build description from lines between title and any trailing metadata
  for (let i = 2; i < lines.length; i++) {
    const l = lines[i];
    if (/^model\s*[:：]/i.test(l) || /^sizes\s*[:：]/i.test(l)) break;
    descLines.push(l);
  }
  return { raw, priceLine, titleLine, descLines, sizesLine };
}

function parseCurrencyAndPrice(priceLine, defaultCurrency) {
  let currency = defaultCurrency || 'usd';
  // Heuristics: `$` => usd; `₦` => ngn
  if (/₦/.test(priceLine)) currency = 'ngn';
  else if (/\$/ .test(priceLine)) currency = 'usd';
  else if (/\bungn\b/i.test(priceLine)) currency = 'ngn';
  else if (/\busd\b/i.test(priceLine)) currency = 'usd';

  const m = priceLine.match(/([0-9]+(?:[\.,][0-9]+)?)/);
  const float = m ? parseFloat(m[1].replace(',', '.')) : 0;
  const minor = Math.round(float * 100);
  return { currency, minor };
}

function parseSizes(sizesLine) {
  // Support ranges like 36–45 or 36-45, or list like 36|37|...
  const range = sizesLine.match(/([0-9]{2})\s*[–-]\s*([0-9]{2})/);
  if (range) {
    const start = parseInt(range[1], 10);
    const end = parseInt(range[2], 10);
    const res = [];
    for (let s = start; s <= end; s++) res.push(String(s));
    return res;
  }
  const list = sizesLine.match(/([0-9]{2}(?:\s*\|\s*[0-9]{2})+)/);
  if (list) {
    return list[0].split('|').map(s => s.trim());
  }
  // default
  return Array.from({ length: 10 }, (_, i) => String(36 + i));
}

function collectImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && isImage(e.name)).map(e => path.join(dir, e.name));
  return files.sort();
}

function collectColors(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const colorDirs = entries.filter(e => e.isDirectory());
  return colorDirs.map(d => ({ name: d.name, path: path.join(dir, d.name) }));
}

function buildRowsForProduct(productDir) {
  const productName = path.basename(productDir);
  const handle = slugify(productName);
  const desc = readDescription(path.join(productDir, 'description.txt'));

  // Default currency based on environment
  const defaultCurrency = process.env.DEFAULT_CURRENCY || (process.env.NEXT_PUBLIC_DEFAULT_REGION === 'ng' ? 'ngn' : 'usd');
  const { currency, minor } = desc ? parseCurrencyAndPrice(desc.priceLine, defaultCurrency) : { currency: defaultCurrency, minor: 0 };
  const sizes = desc ? parseSizes(desc.sizesLine) : Array.from({ length: 10 }, (_, i) => String(36 + i));
  const title = desc && desc.titleLine ? desc.titleLine : productName;
  const description = desc ? desc.descLines.join('\n') : '';

  const colorFolders = collectColors(productDir);

  let colors = [];
  let allImages = [];
  let thumbnail = null;

  if (colorFolders.length > 0) {
    colors = colorFolders.map(c => c.name);
    for (const c of colorFolders) {
      const imgs = collectImages(c.path);
      if (!thumbnail && imgs.length) thumbnail = imgs[0];
      allImages.push(...imgs);
    }
  } else {
    colors = ['Default'];
    const imgs = collectImages(productDir);
    if (imgs.length) {
      thumbnail = imgs[0];
      allImages.push(...imgs);
    }
  }

  const imagesField = allImages.map(posixImagePath).join('|');
  const thumbnailField = thumbnail ? posixImagePath(thumbnail) : '';

  // Build one row per color x size
  const rows = [];
  for (const color of colors) {
    for (const size of sizes) {
      const variantTitle = `${title} - ${color} ${size}`;
      const sku = `${handle}-${slugify(color)}-${size}`.toUpperCase();
      rows.push({
        handle,
        title,
        description,
        collection: '',
        category: 'shoes',
        tags: '',
        thumbnail: thumbnailField,
        images: imagesField,
        material: '',
        origin_country: '',
        options: 'Color|Size',
        color: colors.join('|'),
        size: sizes.join('|'),
        variant_title: variantTitle,
        sku,
        inventory_quantity: 20,
        manage_inventory: true,
        allow_backorder: false,
        currency_code: currency,
        price: minor,
      });
    }
  }
  return rows;
}

function generate() {
  if (!fs.existsSync(BASE_DIR)) {
    console.error(`Base directory not found: ${BASE_DIR}`);
    process.exit(1);
  }
  const productDirs = fs.readdirSync(BASE_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => path.join(BASE_DIR, e.name));

  const allRows = [];
  for (const dir of productDirs) {
    const rows = buildRowsForProduct(dir);
    allRows.push(...rows);
  }

  const header = [
    'handle','title','description','collection','category','tags','thumbnail','images','material','origin_country','options','color','size','variant_title','sku','inventory_quantity','manage_inventory','allow_backorder','currency_code','price'
  ];
  const lines = [header.join(',')];
  for (const r of allRows) {
    const vals = header.map(h => {
      let v = r[h];
      if (typeof v === 'boolean') v = v ? 'true' : 'false';
      if (v == null) v = '';
      // Escape commas in description
      if (h === 'description' || h === 'tags') {
        if (String(v).includes(',')) v = '"' + String(v).replace(/"/g, '""') + '"';
      }
      if (h === 'images') {
        v = '"' + String(v) + '"';
      }
      return String(v);
    });
    lines.push(vals.join(','));
  }

  fs.writeFileSync(OUTPUT_CSV, lines.join('\n'), 'utf8');
  console.log(`Wrote ${allRows.length} rows to ${OUTPUT_CSV}`);
}

generate();