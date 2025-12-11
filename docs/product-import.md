# Product Import Guide

This guide helps you import 14 products with multiple colors and sizes (36–45) into Medusa.

## 1) Prepare Images
- Place images under `storefront/public/images/products/<handle>/`.
- Include `thumbnail.jpg` and numbered images (e.g., `1.jpg`, `2.jpg`).
- Aim for ~1200px width, compressed JPEG/WebP.

## 2) Fill the CSV Template
- Use `backend/data/products-template.csv` as a starting point.
- Columns:
  - `handle`, `title`, `description`, `collection`, `category`, `tags`
  - `thumbnail`, `images` (pipe `|` separated relative paths)
  - `material`, `origin_country`
  - `options` (pipe `|` separated e.g. `Color|Size`)
  - `color` (pipe `|` separated color names/hex like `Black|White|Navy`)
  - `size` (pipe `|` separated sizes `36|...|45`)
  - `variant_title`, `sku`, `inventory_quantity`, `manage_inventory`, `allow_backorder`
  - `currency_code`, `price` (integer minor units, e.g., USD cents)

### Auto-generate the CSV from your local images + descriptions

If you’ve placed your product assets under `storefront/public/images/products/<Product Name>/`, with a `description.txt` and images inside (or color subfolders each containing `description.txt` + images), you can auto-generate the CSV:

1. Ensure your folders are under `storefront/public/images/products/`.
   - Flat folder: images + `description.txt` inside the product folder.
   - Color folders: `storefront/public/images/products/<Product Name>/<Color>/` each with images + `description.txt`.
2. Run the generator:
   - `node scripts/generate-products-from-public.js`
3. The script writes `backend/data/auto-products.csv` following the template schema.
   - It derives `handle` from folder name.
   - Parses title/description/sizes from `description.txt`.
   - Sets color options from subfolder names (or `Default` if none).
   - Uses the first image found as `thumbnail` and includes all images as a pipe-separated list.
   - Parses price from the first line (e.g. `💰$39` → `usd, 3900`).

Note on currency: If your active region is Nigeria (`NEXT_PUBLIC_DEFAULT_REGION=ng`), set prices to NGN. The generator defaults to `usd` when it sees `$`, otherwise `ngn` if the default region is `ng`. Adjust later in Admin if needed.

## 3) Import via Medusa Admin
1. Ensure backend is running and Admin available.
2. Upload `backend/data/auto-products.csv` (or `products-template.csv`) using your Admin import plugin or CSV import tooling.
3. Verify products, variants, prices, and images.

## 4) Verify in Storefront
- Confirm images render on PDP.
- Use the color selector (swatches) and size buttons.
- Add to cart and validate cart totals.

## Notes
- If not using an import plugin, you can write a simple script against the Medusa Admin API to parse the CSV and create products/variants.
- Keep `handle` stable; changing it affects URLs and SEO.