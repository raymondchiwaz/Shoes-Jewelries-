/**
 * Generate product import CSV from actual folders in storefront/public/images/imports
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const IMPORTS_DIR = path.join(PROJECT_ROOT, "storefront", "public", "images", "imports");
const BASE_URL = "http://localhost:8000";
const OUTPUT_PATH = path.join(PROJECT_ROOT, "product-import-clean.csv");

function csvEscape(v) {
    if (v == null) return "";
    const s = String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

function slugify(input) {
    return String(input || "")
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 80);
}

function encodePathForUrl(relPath) {
    return relPath
        .split("/")
        .map((seg) => encodeURIComponent(seg))
        .join("/");
}

function extractPrice(folderName) {
    const match = folderName.match(/\$(\d+)/);
    return match ? match[1] + ".00" : "";
}

function cleanProductName(folderName) {
    // Remove price prefix like "$60 " or "$54 "
    return folderName.replace(/^\$\d+\s*/, "").trim();
}

function getImagesFromFolder(folderPath) {
    if (!fs.existsSync(folderPath)) return [];
    return fs.readdirSync(folderPath)
        .filter(name => /\.(jpg|jpeg|png|gif|webp)$/i.test(name))
        .sort();
}

function main() {
    console.log("Scanning imports folder...");

    const folders = fs.readdirSync(IMPORTS_DIR)
        .filter(name => {
            const fullPath = path.join(IMPORTS_DIR, name);
            return fs.statSync(fullPath).isDirectory();
        })
        .sort();

    console.log(`Found ${folders.length} product folders`);

    // CSV header - matching Medusa Admin format
    const header = [
        "Product Id", "Product Handle", "Product Title", "Product Subtitle", "Product Description",
        "Product Status", "Product Thumbnail", "Product Weight", "Product Length", "Product Width",
        "Product Height", "Product HS Code", "Product Origin Country", "Product MID Code", "Product Material",
        "Product Collection Id", "Product Type Id", "Product Tag 1", "Product Discountable", "Product External Id",
        "Variant Id", "Variant Title", "Variant SKU", "Variant Barcode", "Variant Allow Backorder",
        "Variant Manage Inventory", "Variant Weight", "Variant Length", "Variant Width", "Variant Height",
        "Variant HS Code", "Variant Origin Country", "Variant MID Code", "Variant Material",
        "Variant Price EUR", "Variant Price USD", "Variant Option 1 Name", "Variant Option 1 Value",
        "Product Image 1 Url", "Product Image 2 Url"
    ];

    const rows = [header];
    let matched = 0;
    let skipped = 0;

    for (const folder of folders) {
        const folderPath = path.join(IMPORTS_DIR, folder);
        const images = getImagesFromFolder(folderPath);

        if (images.length === 0) {
            console.log(`✗ Skipped (no images): ${folder}`);
            skipped++;
            continue;
        }

        const urlBase = `${BASE_URL}/images/imports/${encodePathForUrl(folder)}`;
        const img1 = images[0];
        const img2 = images.length > 1 ? images[1] : images[0];

        const thumbnailUrl = `${urlBase}/${encodeURIComponent(img1)}`;
        const image1Url = `${urlBase}/${encodeURIComponent(img1)}`;
        const image2Url = `${urlBase}/${encodeURIComponent(img2)}`;

        const productName = cleanProductName(folder);
        const handle = slugify(productName);
        const price = extractPrice(folder);
        const variantTitle = `${productName} - One Size`;
        const sku = slugify(productName).toUpperCase() + "-ONE-SIZE";

        const row = [
            "", // Product Id
            handle, // Product Handle
            productName, // Product Title
            "", // Product Subtitle
            "", // Product Description
            "published", // Product Status
            thumbnailUrl, // Product Thumbnail
            "", "", "", "", "", "", "", "", "", "", "", // Weight through Tag
            "TRUE", // Product Discountable
            "", // Product External Id
            "", // Variant Id
            variantTitle, // Variant Title
            sku, // Variant SKU
            "", // Variant Barcode
            "FALSE", // Variant Allow Backorder
            "TRUE", // Variant Manage Inventory
            "", "", "", "", "", "", "", "", // Variant Weight through Material
            "", // Variant Price EUR
            price, // Variant Price USD
            "Size", // Variant Option 1 Name
            "One Size", // Variant Option 1 Value
            image1Url, // Product Image 1 Url
            image2Url // Product Image 2 Url
        ];

        rows.push(row);
        matched++;
        console.log(`✓ Added: ${productName} (${images.length} images)`);
    }

    // Write CSV
    const csvContent = rows.map(row => row.map(csvEscape).join(",")).join("\r\n") + "\r\n";
    fs.writeFileSync(OUTPUT_PATH, csvContent, "utf8");

    console.log("\n=== Summary ===");
    console.log(`Products added: ${matched}`);
    console.log(`Skipped (no images): ${skipped}`);
    console.log(`Output: ${OUTPUT_PATH}`);
}

main();
