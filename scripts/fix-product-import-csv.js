/**
 * Fix product-import-clean.csv by matching products to actual folders in storefront/public/images/imports
 * and generating proper URLs that will work with Medusa Admin import.
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const IMPORTS_DIR = path.join(PROJECT_ROOT, "storefront", "public", "images", "imports");
const BASE_URL = "http://localhost:8000";

// Read the input CSV
const inputPath = path.join(PROJECT_ROOT, "product-import-clean.csv");
const outputPath = path.join(PROJECT_ROOT, "product-import-fixed.csv");

// Parse CSV (handles quoted fields)
function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

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
            row.push(field);
            field = "";
            continue;
        }

        if (ch === "\r") {
            if (next === "\n") i++;
            row.push(field);
            field = "";
            rows.push(row);
            row = [];
            continue;
        }

        if (ch === "\n") {
            row.push(field);
            field = "";
            rows.push(row);
            row = [];
            continue;
        }

        field += ch;
    }

    row.push(field);
    if (row.length > 1 || row[0] !== "") rows.push(row);

    // Remove trailing empty rows
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

function encodePathForUrl(relPath) {
    return relPath
        .split("/")
        .map((seg) => encodeURIComponent(seg))
        .join("/");
}

// Get all folders in the imports directory
function getImportFolders() {
    if (!fs.existsSync(IMPORTS_DIR)) {
        console.error(`Imports directory not found: ${IMPORTS_DIR}`);
        return [];
    }

    return fs.readdirSync(IMPORTS_DIR)
        .filter(name => {
            const fullPath = path.join(IMPORTS_DIR, name);
            return fs.statSync(fullPath).isDirectory();
        });
}

// Normalize a product name for matching (remove emojis, extra spaces, special chars)
function normalizeName(name) {
    return name
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
        .replace(/[🔥💰💫💚‼️🎀🕶️]/g, '') // Remove specific emojis
        .replace(/[^\w\s-]/g, ' ') // Replace special chars with spaces
        .replace(/\s+/g, ' ') // Multiple spaces to single
        .trim()
        .toLowerCase();
}

// Get images from a folder
function getImagesFromFolder(folderName) {
    const folderPath = path.join(IMPORTS_DIR, folderName);
    if (!fs.existsSync(folderPath)) return [];

    return fs.readdirSync(folderPath)
        .filter(name => /\.(jpg|jpeg|png|gif|webp)$/i.test(name))
        .sort();
}

// Main processing
function main() {
    console.log("Reading CSV...");
    const raw = fs.readFileSync(inputPath, "utf8");
    const rows = parseCsv(raw);

    if (!rows.length) {
        console.error("No CSV rows found.");
        process.exit(1);
    }

    const header = rows[0];
    const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

    // Find image columns
    const thumbnailIdx = idx["Product Thumbnail"];
    const image1Idx = idx["Product Image 1 Url"];
    const image2Idx = idx["Product Image 2 Url"];
    const titleIdx = idx["Product Title"];

    console.log("Scanning imports folder...");
    const folders = getImportFolders();
    console.log(`Found ${folders.length} product folders`);

    // Create a lookup map for folders by normalized name
    const folderMap = new Map();
    for (const folder of folders) {
        const normalized = normalizeName(folder);
        folderMap.set(normalized, folder);
        // Also try without dollar amounts
        const noDollar = normalized.replace(/\$\d+\s*/g, '').trim();
        if (noDollar !== normalized) {
            folderMap.set(noDollar, folder);
        }
    }

    const rewritten = [header];
    let matchedCount = 0;
    let unmatchedCount = 0;

    for (let r = 1; r < rows.length; r++) {
        const row = [...rows[r]];
        if (!row || (row.length === 1 && String(row[0] || "").trim() === "")) continue;

        const title = row[titleIdx] || "";
        const normalizedTitle = normalizeName(title);

        // Try to find matching folder
        let matchedFolder = null;

        // Try exact normalized match first
        if (folderMap.has(normalizedTitle)) {
            matchedFolder = folderMap.get(normalizedTitle);
        } else {
            // Try partial matching
            for (const [normalizedFolderName, folderName] of folderMap.entries()) {
                if (normalizedFolderName.includes(normalizedTitle) || normalizedTitle.includes(normalizedFolderName)) {
                    matchedFolder = folderName;
                    break;
                }
            }
        }

        if (matchedFolder) {
            const images = getImagesFromFolder(matchedFolder);
            if (images.length > 0) {
                const urlBase = `${BASE_URL}/images/imports/${encodePathForUrl(matchedFolder)}`;

                // Set thumbnail and image URLs
                const img1 = images[0];
                const img2 = images.length > 1 ? images[1] : images[0];

                row[thumbnailIdx] = `${urlBase}/${encodeURIComponent(img1)}`;
                row[image1Idx] = `${urlBase}/${encodeURIComponent(img1)}`;
                row[image2Idx] = `${urlBase}/${encodeURIComponent(img2)}`;

                matchedCount++;
                console.log(`✓ Matched: "${title.substring(0, 50)}..." -> "${matchedFolder.substring(0, 50)}..."`);
            } else {
                // Blank out image paths if no images in folder
                row[thumbnailIdx] = "";
                row[image1Idx] = "";
                row[image2Idx] = "";
                unmatchedCount++;
                console.log(`✗ No images in folder for: "${title.substring(0, 50)}..."`);
            }
        } else {
            // Blank out image paths if no folder match - avoids import errors
            row[thumbnailIdx] = "";
            row[image1Idx] = "";
            row[image2Idx] = "";
            unmatchedCount++;
            console.log(`✗ No folder match for: "${title.substring(0, 50)}..."`);
        }

        rewritten.push(row);
    }

    // Write output CSV
    const outText = rewritten.map(row => row.map(csvEscape).join(",")).join("\r\n") + "\r\n";
    fs.writeFileSync(outputPath, outText, "utf8");

    console.log("\n=== Summary ===");
    console.log(`Matched products: ${matchedCount}`);
    console.log(`Unmatched products: ${unmatchedCount}`);
    console.log(`Output written to: ${outputPath}`);
}

main();
