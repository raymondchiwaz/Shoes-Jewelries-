/**
 * Generate a Medusa Admin-compatible products CSV from local assets.
 *
 * Target schema (based on your template):
 * Product Id,Product Handle,Product Title,Product Subtitle,Product Description,Product Status,Product Thumbnail,Product Weight,Product Length,Product Width,Product Height,Product HS Code,Product Origin Country,Product MID Code,Product Material,Product Collection Id,Product Type Id,Product Tag 1,Product Discountable,Product External Id,Variant Id,Variant Title,Variant SKU,Variant Barcode,Variant Allow Backorder,Variant Manage Inventory,Variant Weight,Variant Length,Variant Width,Variant Height,Variant HS Code,Variant Origin Country,Variant MID Code,Variant Material,Variant Price EUR,Variant Price USD,Variant Option 1 Name,Variant Option 1 Value,Product Image 1 Url,Product Image 2 Url
 *
 * Source folders: `storefront/public/images/products/<Product Name>/`
 * - Flat product: images + `description.txt`
 * - Color variants: subfolders `<Color>/` each with images + `description.txt`
 *
 * Notes:
 * - We encode Color in Variant Title and SKU but use Size as the single variant option (Option 1).
 * - Price: parses `$` as USD decimal (e.g., $39 -> 39.00). If only ₦ is present, Variant Price USD is left blank.
 * - Images: Product Thumbnail = first image URL; Product Image 1/2 = next two images, when available.
 * - Absolute image URLs are built using `NEXT_PUBLIC_BASE_URL` from `storefront/.env.local` (fallback: http://localhost:8000).
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PRODUCTS_DIR = path.join(PROJECT_ROOT, 'storefront', 'public', 'images', 'products');
const OUTPUT_CSV = path.join(PROJECT_ROOT, 'backend', 'data', 'auto-products-admin.csv');
const ENV_LOCAL = path.join(PROJECT_ROOT, 'storefront', '.env.local');
const ADMIN_TEMPLATE = path.join(PROJECT_ROOT, 'product-import-template(1).csv');

function readBaseUrl() {
  try {
    const raw = fs.readFileSync(ENV_LOCAL, 'utf8');
    const line = raw.split(/\r?\n/).find(l => l.startsWith('NEXT_PUBLIC_BASE_URL='));
    if (line) return line.split('=')[1].trim();
  } catch (_) {}
  return 'http://localhost:8000';
}

const BASE_URL = readBaseUrl().replace(/\/$/, '');

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[“”"']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isImage(file) {
  return /\.(jpe?g|png|webp|gif)$/i.test(file);
}

function toAbsoluteUrl(absFile) {
  const rel = path.relative(path.join(PROJECT_ROOT, 'storefront', 'public'), absFile).split(path.sep).join('/');
  return `${BASE_URL}/${rel}`;
}

function readDescription(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).map(l => l.trim());
  let priceLine = lines.find(l => /\$|₦|eur|usd|ngn/i.test(l)) || '';
  let titleLine = lines.find(l => l && !/^\p{So}/u.test(l)) || lines[0] || '';
  // Description: lines after title until metadata
  const descLines = [];
  let started = false;
  for (const l of lines) {
    if (!started) {
      if (l === titleLine) { started = true; continue; }
      else continue;
    }
    if (/^model\s*[:：]/i.test(l) || /^sizes\s*[:：]/i.test(l)) break;
    if (l) descLines.push(l);
  }
  const sizesLine = lines.find(l => /^sizes\s*[:：]/i.test(l)) || '';
  return { raw, priceLine, titleLine, descLines, sizesLine };
}

function parseUsdPrice(priceLine) {
  if (!/\$|usd/i.test(priceLine)) return '';
  const m = priceLine.match(/([0-9]+(?:[\.,][0-9]+)?)/);
  if (!m) return '';
  const val = parseFloat(m[1].replace(',', '.'));
  return val.toFixed(2);
}

function parseSizes(sizesLine) {
  const range = sizesLine.match(/([0-9]{2})\s*[–-]\s*([0-9]{2})/);
  if (range) {
    const start = parseInt(range[1], 10);
    const end = parseInt(range[2], 10);
    const res = [];
    for (let s = start; s <= end; s++) res.push(String(s));
    return res;
  }
  const list = sizesLine.match(/([0-9]{2}(?:\s*\|\s*[0-9]{2})+)/);
  if (list) return list[0].split('|').map(s => s.trim());
  return Array.from({ length: 10 }, (_, i) => String(36 + i));
}

function collectImages(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries
    .filter(e => e.isFile() && isImage(e.name))
    .map(e => path.join(dir, e.name))
    .sort();
}

function collectColors(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(d => ({ name: d.name, path: path.join(dir, d.name) }));
}

function rowsForProduct(productDir) {
  const productName = path.basename(productDir);
  const handle = slugify(productName);
  const desc = readDescription(path.join(productDir, 'description.txt'));
  const title = desc && desc.titleLine ? desc.titleLine : productName;
  const description = desc ? desc.descLines.join('\n') : '';
  const usdPrice = desc ? parseUsdPrice(desc.priceLine) : '';
  const sizes = desc ? parseSizes(desc.sizesLine) : Array.from({ length: 10 }, (_, i) => String(36 + i));

  const colorFolders = collectColors(productDir);
  let colors = [];
  let allImages = [];
  if (colorFolders.length) {
    colors = colorFolders.map(c => c.name);
    for (const c of colorFolders) allImages.push(...collectImages(c.path));
  } else {
    colors = ['Default'];
    allImages = collectImages(productDir);
  }

  const [thumbAbs, img1Abs, img2Abs] = [allImages[0], allImages[1], allImages[2]];
  const productThumbnail = thumbAbs ? toAbsoluteUrl(thumbAbs) : '';
  const productImage1 = img1Abs ? toAbsoluteUrl(img1Abs) : '';
  const productImage2 = img2Abs ? toAbsoluteUrl(img2Abs) : '';

  const rows = [];
  for (const color of colors) {
    for (const size of sizes) {
      const variantTitle = `${title} - ${color} ${size}`;
      const sku = `${handle}-${slugify(color)}-${size}`.toUpperCase();
      rows.push({
        product_id: '',
        product_handle: handle,
        product_title: title,
        product_subtitle: '',
        product_description: description,
        product_status: 'published',
        product_thumbnail: productThumbnail,
        product_weight: '400',
        product_length: '',
        product_width: '',
        product_height: '',
        product_hs_code: '',
        product_origin_country: '',
        product_mid_code: '',
        product_material: '',
        product_collection_id: '',
        product_type_id: '',
        product_tag_1: '',
        product_discountable: 'TRUE',
        product_external_id: '',
        variant_id: '',
        variant_title: variantTitle,
        variant_sku: sku,
        variant_barcode: '',
        variant_allow_backorder: 'FALSE',
        variant_manage_inventory: 'TRUE',
        variant_weight: '',
        variant_length: '',
        variant_width: '',
        variant_height: '',
        variant_hs_code: '',
        variant_origin_country: '',
        variant_mid_code: '',
        variant_material: '',
        variant_price_eur: '',
        variant_price_usd: usdPrice,
        variant_option_1_name: 'Size',
        variant_option_1_value: size,
        product_image_1_url: productImage1,
        product_image_2_url: productImage2,
      });
    }
  }
  return rows;
}

function generate() {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    console.error(`Directory not found: ${PRODUCTS_DIR}`);
    process.exit(1);
  }

  const productDirs = fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => path.join(PRODUCTS_DIR, e.name));

  // Load header from Admin template to match exact casing/spaces
  let header;
  if (fs.existsSync(ADMIN_TEMPLATE)) {
    const raw = fs.readFileSync(ADMIN_TEMPLATE, 'utf8');
    const firstLine = raw.split(/\r?\n/)[0];
    header = firstLine.split(',').map(h => h.trim());
  } else {
    header = ['Product Id','Product Handle','Product Title','Product Subtitle','Product Description','Product Status','Product Thumbnail','Product Weight','Product Length','Product Width','Product Height','Product HS Code','Product Origin Country','Product MID Code','Product Material','Product Collection Id','Product Type Id','Product Tag 1','Product Discountable','Product External Id','Variant Id','Variant Title','Variant SKU','Variant Barcode','Variant Allow Backorder','Variant Manage Inventory','Variant Weight','Variant Length','Variant Width','Variant Height','Variant HS Code','Variant Origin Country','Variant MID Code','Variant Material','Variant Price EUR','Variant Price USD','Variant Option 1 Name','Variant Option 1 Value','Product Image 1 Url','Product Image 2 Url'];
  }

  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const headerMap = Object.fromEntries(header.map(h => [normalize(h), h]));
  // Map normalized template headers to our row object keys
  const headerToRowKey = {
    productid: 'product_id',
    producthandle: 'product_handle',
    producttitle: 'product_title',
    productsubtitle: 'product_subtitle',
    productdescription: 'product_description',
    productstatus: 'product_status',
    productthumbnail: 'product_thumbnail',
    productweight: 'product_weight',
    productlength: 'product_length',
    productwidth: 'product_width',
    productheight: 'product_height',
    producthscode: 'product_hs_code',
    productorigincountry: 'product_origin_country',
    productmidcode: 'product_mid_code',
    productmaterial: 'product_material',
    productcollectionid: 'product_collection_id',
    producttypeid: 'product_type_id',
    producttag1: 'product_tag_1',
    productdiscountable: 'product_discountable',
    productexternalid: 'product_external_id',
    variantid: 'variant_id',
    varianttitle: 'variant_title',
    variantsku: 'variant_sku',
    variantbarcode: 'variant_barcode',
    variantallowbackorder: 'variant_allow_backorder',
    variantmanageinventory: 'variant_manage_inventory',
    variantweight: 'variant_weight',
    variantlength: 'variant_length',
    variantwidth: 'variant_width',
    variantheight: 'variant_height',
    varianthscode: 'variant_hs_code',
    variantorigincountry: 'variant_origin_country',
    variantmidcode: 'variant_mid_code',
    variantmaterial: 'variant_material',
    variantpriceeur: 'variant_price_eur',
    variantpriceusd: 'variant_price_usd',
    variantoption1name: 'variant_option_1_name',
    variantoption1value: 'variant_option_1_value',
    productimage1url: 'product_image_1_url',
    productimage2url: 'product_image_2_url',
  };

  const csvEscape = (v) => {
    if (v == null) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };

  const lines = [header.join(',')];

  let total = 0;
  for (const dir of productDirs) {
    const rows = rowsForProduct(dir);
    for (const row of rows) {
      const vals = header.map(h => {
        const norm = normalize(h);
        const rowKey = headerToRowKey[norm] ?? norm;
        const v = row[rowKey];
        return csvEscape(v);
      });
      lines.push(vals.join(','));
      total++;
    }
  }

  fs.writeFileSync(OUTPUT_CSV, lines.join('\n'), 'utf8');
  console.log(`Wrote ${total} rows to ${OUTPUT_CSV}`);
}

generate();