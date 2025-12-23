/**
 * Fix/normalize a Medusa Admin-compatible products CSV.
 *
 * Why this exists:
 * - Medusa Admin CSV import expects valid CSV (RFC4180-ish) and often rejects rows with:
 *   - inconsistent column counts
 *   - missing Variant SKU / Variant Title
 *   - non-numeric / oddly formatted prices
 *   - image fields that are local file paths (e.g. "./foo/bar.jpg") instead of URLs
 *
 * This script:
 * - parses multiline CSV safely (quotes + embedded newlines)
 * - validates column counts
 * - fills missing Variant SKU / Title
 * - normalizes Variant Price USD/EUR to 2dp when numeric
 * - optionally blanks image fields that look like local paths (default behavior)
 *
 * Usage:
 *   node scripts/fix-products-admin-csv.js --in product-import-template.csv --out backend/data/fixed-products-admin.csv
 * Options:
 *   --keep-local-images     Keep "./..." image paths as-is (NOT recommended for Admin import)
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");

function parseArgs(argv) {
  const args = { in: null, out: null, keepLocalImages: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--in") args.in = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--keep-local-images") args.keepLocalImages = true;
  }
  return args;
}

// Minimal RFC4180-style CSV parser supporting quoted fields + embedded newlines.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    // ignore trailing empty row caused by EOF newline
    if (row.length === 1 && row[0] === "" && rows.length === 0) return;
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = i + 1 < text.length ? text[i + 1] : "";

    if (inQuotes) {
      if (ch === '"') {
        // escaped quote
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      pushField();
      continue;
    }

    if (ch === "\r") {
      // handle CRLF
      if (next === "\n") i++;
      pushField();
      pushRow();
      continue;
    }

    if (ch === "\n") {
      pushField();
      pushRow();
      continue;
    }

    field += ch;
  }

  // flush last field/row
  pushField();
  if (row.length > 1 || row[0] !== "") pushRow();

  return rows;
}

function csvEscape(v) {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePrice2dp(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  // Already looks like a decimal
  const m = s.match(/^\d+(?:\.\d+)?$/);
  if (m) return Number(s).toFixed(2);
  // If it's something like "$60" or "60 USD"
  const m2 = s.match(/(\d+(?:[.,]\d+)?)/);
  if (!m2) return s;
  return Number(m2[1].replace(",", ".")).toFixed(2);
}

function inferUsdPriceFromText(...candidates) {
  for (const c of candidates) {
    const s = String(c ?? "");
    // Prefer explicit "$123" (optionally preceded by emoji/text)
    const m = s.match(/\$\s*([0-9]+(?:[.,][0-9]+)?)/);
    if (m) return normalizePrice2dp(m[1]);
    // Sometimes written as "USD 123" / "123 USD"
    const m2 = s.match(/\bUSD\s*([0-9]+(?:[.,][0-9]+)?)\b/i) || s.match(/\b([0-9]+(?:[.,][0-9]+)?)\s*USD\b/i);
    if (m2) return normalizePrice2dp(m2[1]);
  }
  return "";
}

function looksLikeLocalPath(s) {
  const v = String(s ?? "").trim();
  if (!v) return false;
  return v.startsWith("./") || v.startsWith(".\\") || /^[A-Za-z]:\\/.test(v);
}

function looksLikeUrl(s) {
  const v = String(s ?? "").trim();
  if (!v) return false;
  return /^https?:\/\//i.test(v);
}

function main() {
  const args = parseArgs(process.argv);
  const inPath = args.in ? path.resolve(PROJECT_ROOT, args.in) : path.resolve(PROJECT_ROOT, "product-import-template.csv");
  const outPath = args.out
    ? path.resolve(PROJECT_ROOT, args.out)
    : path.resolve(PROJECT_ROOT, "backend", "data", "fixed-products-admin.csv");

  if (!fs.existsSync(inPath)) {
    console.error(`Input CSV not found: ${inPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inPath, "utf8");
  const rows = parseCsv(raw);
  if (!rows.length) {
    console.error("No CSV rows found.");
    process.exit(1);
  }

  const header = rows[0];
  const expectedCols = header.length;
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

  const requiredHeaders = [
    "Product Handle",
    "Product Title",
    "Product Status",
    "Variant Title",
    "Variant SKU",
    "Variant Manage Inventory",
    "Variant Allow Backorder",
    "Variant Option 1 Name",
    "Variant Option 1 Value",
  ];
  const missing = requiredHeaders.filter((h) => idx[h] == null);
  if (missing.length) {
    console.error(`CSV header is missing required columns: ${missing.join(", ")}`);
    process.exit(1);
  }

  const outRows = [header];
  const issues = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 1 && row[0].trim() === "") continue;

    if (row.length !== expectedCols) {
      issues.push({ row: r + 1, kind: "column_count", got: row.length, expected: expectedCols });
      // pad/truncate to keep file importable
      while (row.length < expectedCols) row.push("");
      if (row.length > expectedCols) row.length = expectedCols;
    }

    const get = (name) => row[idx[name]] ?? "";
    const set = (name, val) => {
      row[idx[name]] = val == null ? "" : String(val);
    };

    const handle = get("Product Handle").trim();
    const title = get("Product Title").trim();
    const description = get("Product Description");
    const status = get("Product Status").trim() || "published";

    set("Product Status", status);

    // Ensure option defaults
    const optName = get("Variant Option 1 Name").trim() || "Size";
    const optVal = get("Variant Option 1 Value").trim() || "One Size";
    set("Variant Option 1 Name", optName);
    set("Variant Option 1 Value", optVal);

    // Ensure booleans are upper-case TRUE/FALSE if provided
    const manageInv = get("Variant Manage Inventory").trim();
    if (manageInv) set("Variant Manage Inventory", manageInv.toUpperCase());
    const allowBack = get("Variant Allow Backorder").trim();
    if (allowBack) set("Variant Allow Backorder", allowBack.toUpperCase());
    const discountable = get("Product Discountable").trim();
    if (discountable) set("Product Discountable", discountable.toUpperCase());

    // Variant Title + SKU
    let variantTitle = get("Variant Title").trim();
    let sku = get("Variant SKU").trim();
    // Some sheets put "One Size" as title; normalize to "<Product Title> - One Size"
    if (!variantTitle || variantTitle.toLowerCase() === optVal.toLowerCase()) {
      variantTitle = title ? `${title} - ${optVal}` : `${handle} - ${optVal}`;
      set("Variant Title", variantTitle);
      issues.push({ row: r + 1, kind: "filled_variant_title" });
    }
    if (!sku) {
      const base = handle || slugify(title) || `row-${r}`;
      sku = `${base}-${slugify(optVal)}`.toUpperCase();
      set("Variant SKU", sku);
      issues.push({ row: r + 1, kind: "filled_variant_sku" });
    }

    // Price normalization
    if (idx["Variant Price USD"] != null) {
      const usd = get("Variant Price USD");
      if (usd && usd.trim()) {
        set("Variant Price USD", normalizePrice2dp(usd));
      } else {
        const inferred = inferUsdPriceFromText(title, description, variantTitle);
        if (inferred) {
          set("Variant Price USD", inferred);
          issues.push({ row: r + 1, kind: "inferred_variant_price_usd" });
        }
      }
    }
    if (idx["Variant Price EUR"] != null) {
      const eur = get("Variant Price EUR");
      if (eur && eur.trim()) set("Variant Price EUR", normalizePrice2dp(eur));
    }

    // Images: Admin import expects URLs, not local paths
    const imageCols = ["Product Thumbnail", "Product Image 1 Url", "Product Image 2 Url"];
    for (const col of imageCols) {
      if (idx[col] == null) continue;
      const v = get(col);
      if (!v) continue;
      if (!args.keepLocalImages && looksLikeLocalPath(v)) {
        // blanking prevents "invalid URL" errors in many importers
        set(col, "");
        issues.push({ row: r + 1, kind: "blanked_local_image_path", col });
      } else if (!looksLikeUrl(v) && looksLikeLocalPath(v) === false && v.trim().startsWith("/")) {
        // allow absolute path from a known base URL only if user set it later; keep as-is
      }
    }

    // If image fields are empty, fill with safe placeholders to satisfy importers that require URLs.
    const seed = encodeURIComponent(handle || slugify(title) || `row-${r}`);
    const placeholder = `https://picsum.photos/seed/${seed}/800/800`;
    if (idx["Product Thumbnail"] != null && !get("Product Thumbnail").trim()) {
      set("Product Thumbnail", placeholder);
      issues.push({ row: r + 1, kind: "placeholder_image", col: "Product Thumbnail" });
    }
    if (idx["Product Image 1 Url"] != null && !get("Product Image 1 Url").trim()) {
      set("Product Image 1 Url", `https://picsum.photos/seed/${seed}-1/800/800`);
      issues.push({ row: r + 1, kind: "placeholder_image", col: "Product Image 1 Url" });
    }
    if (idx["Product Image 2 Url"] != null && !get("Product Image 2 Url").trim()) {
      set("Product Image 2 Url", `https://picsum.photos/seed/${seed}-2/800/800`);
      issues.push({ row: r + 1, kind: "placeholder_image", col: "Product Image 2 Url" });
    }

    outRows.push(row);
  }

  const outText =
    outRows
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n") + "\r\n";

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outText, "utf8");

  // Write a small report next to the output file for transparency.
  const reportPath = outPath.replace(/\.csv$/i, ".report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ input: inPath, output: outPath, expectedCols, issues }, null, 2), "utf8");

  console.log(`Wrote fixed CSV: ${outPath}`);
  console.log(`Wrote report:    ${reportPath}`);
  console.log(`Rows in: ${rows.length - 1}, rows out: ${outRows.length - 1}, header cols: ${expectedCols}`);
  if (issues.length) console.log(`Issues fixed: ${issues.length} (see report)`);
}

main();


