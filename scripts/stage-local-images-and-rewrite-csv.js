/**
 * Stage "local" CSV image paths into Next.js public folder and rewrite CSV image columns
 * to localhost (or any base URL) so Medusa Admin import accepts them.
 *
 * Why:
 * - Medusa Admin CSV import can't consume disk paths like "./My Folder/image.jpg".
 * - It CAN consume URLs like "http://localhost:8000/images/imports/My%20Folder/image.jpg".
 *
 * What it does:
 * - Reads an Admin-style product CSV (your template format)
 * - For each image field that begins with "./", tries to copy the file into:
 *     storefront/public/images/imports/<original relative path without "./">
 * - Rewrites those CSV fields to:
 *     <BASE_URL>/images/imports/<url-encoded path>
 * - Leaves existing http(s) URLs unchanged
 * - Writes a report JSON listing missing files (if your images aren't in the repo yet)
 *
 * Usage:
 *   node scripts/stage-local-images-and-rewrite-csv.js ^
 *     --in product-import-template.csv ^
 *     --out backend/data/fixed-products-admin-local.csv ^
 *     --base-url http://localhost:8000
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_BASE_URL = "http://localhost:8000";

function parseArgs(argv) {
  const args = { in: null, out: null, baseUrl: DEFAULT_BASE_URL };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--in") args.in = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--base-url") args.baseUrl = argv[++i];
  }
  args.baseUrl = String(args.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
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
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = i + 1 < text.length ? text[i + 1] : "";

    if (inQuotes) {
      if (ch === '"') {
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

  pushField();
  // If the file doesn't end with newline, we still have a last row to push
  if (row.length) pushRow();

  // Remove trailing empty row (common when file ends with newline)
  while (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") {
    rows.pop();
  }
  return rows;
}

function csvEscape(v) {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function isHttpUrl(v) {
  return /^https?:\/\//i.test(String(v || "").trim());
}

function isDotSlashPath(v) {
  const s = String(v || "").trim();
  return s.startsWith("./") || s.startsWith(".\\");
}

function normalizeRelPath(dotPath) {
  const s = String(dotPath || "").trim().replace(/^\.([\\/])/, "");
  // keep original folder structure, but normalize separators
  return s.split(/[/\\]+/).join("/");
}

function encodePathForUrl(relPath) {
  // encode each segment, keep slashes
  return relPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFileIfExists(srcAbs, destAbs) {
  if (!fs.existsSync(srcAbs)) return false;
  ensureDir(path.dirname(destAbs));
  fs.copyFileSync(srcAbs, destAbs);
  return true;
}

function main() {
  const args = parseArgs(process.argv);
  const inPath = path.resolve(PROJECT_ROOT, args.in || "product-import-template.csv");
  const outPath = path.resolve(PROJECT_ROOT, args.out || "backend/data/fixed-products-admin-local.csv");

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
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  const imgCols = ["Product Thumbnail", "Product Image 1 Url", "Product Image 2 Url"].filter((c) => idx[c] != null);

  const importsRootAbs = path.join(PROJECT_ROOT, "storefront", "public", "images", "imports");
  ensureDir(importsRootAbs);

  const rewritten = [header];
  const report = {
    input: inPath,
    output: outPath,
    base_url: args.baseUrl,
    staged_root: importsRootAbs,
    image_columns: imgCols,
    copied: [],
    missing: [],
    rewritten_fields: 0,
  };

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || (row.length === 1 && String(row[0] || "").trim() === "")) continue;

    for (const col of imgCols) {
      const i = idx[col];
      const v = i < row.length ? row[i] : "";
      if (!v) continue;
      if (isHttpUrl(v)) continue;
      if (!isDotSlashPath(v)) continue;

      const rel = normalizeRelPath(v); // e.g. "My Folder/a.jpg"
      const srcAbs = path.resolve(PROJECT_ROOT, rel);
      const destAbs = path.join(importsRootAbs, ...rel.split("/"));

      const ok = copyFileIfExists(srcAbs, destAbs);
      if (!ok) {
        report.missing.push({ row: r + 1, col, src: srcAbs, rel });
      } else {
        report.copied.push({ row: r + 1, col, from: srcAbs, to: destAbs, rel });
      }

      // rewrite even if missing: importer will accept URL; image may 404 until you add files
      const url = `${args.baseUrl}/images/imports/${encodePathForUrl(rel)}`;
      row[i] = url;
      report.rewritten_fields++;
    }

    rewritten.push(row);
  }

  const outText = rewritten.map((row) => row.map(csvEscape).join(",")).join("\r\n") + "\r\n";
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, outText, "utf8");

  const reportPath = outPath.replace(/\.csv$/i, ".stage-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`Wrote CSV:    ${outPath}`);
  console.log(`Wrote report: ${reportPath}`);
  console.log(`Rewritten fields: ${report.rewritten_fields}`);
  console.log(`Copied files:      ${report.copied.length}`);
  console.log(`Missing files:     ${report.missing.length}`);
}

main();







