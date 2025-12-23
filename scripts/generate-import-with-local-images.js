/**
 * Generate product import CSV using local images from storefront/public/images/imports
 * 
 * This script maps products to their image folders and generates proper import CSV
 */

const fs = require('fs');
const path = require('path');

// Base URL for images - adjust this based on your setup
// For local development, images served from storefront's public folder
const IMAGE_BASE_URL = 'http://localhost:8000/images/imports';

// Mapping of product handles to their folder names in the imports directory
const productFolderMapping = {
  'fendi-frameless-sunglasses': '$54 Fendi 2025 New Style, Absolutely Gorgeous F Diamond, Metal Square Frameless Sunglasses, Sun Protection, Slimming Effect, Anti-UV, Unisex. FE4082US',
  'cartier-anti-blue-glasses': '$55 Cartier 2024 New Frameless Men\'s and Women\'s Fashion Anti-Blue Light High-Definition Ultra-light Stylish Young Portable Glasses',
  'ferragamo-fd8131-sunglasses': '$58 Salvatore Ferragamo MODEL：FD8131 SIZE：53口22-145',
  'lv-classic-sunglasses': '$60 LV classic business men\'s sunglasses, polarized metal full-frame sunshade, trendy new outdoor sport shades',
  'ferragamo-sf1092-sunglasses': '$69 ‼Salvatore Ferragamo MODEL：SF1092SLB SIZE：52口19-145',
  'gucci-retro-horsebit-bag': '1955 Gucci Retro Horsebit Bag',
  'louboutin-red-sole-heels': 'Christian Louboutin CL Red Sole Shoes Early Spring Collection',
  'dior-lady-dlite-bag': 'DIOR  Lady D-Lite Embroidered Bag',
  'gucci-mens-backpack': 'GUCCI Men\'s New Backpack',
  'gucci-miami-slippers': 'Gucci Gucci  Miami 2022',
  'lv-montsouris-backpack': 'LV Backpack Multi-purpose Bag The Montsouris BB Backpack',
  'lv-pillow-bag': 'LV Pillow Bag',
  'miumiu-mary-janes': 'MiuMiu 2022SS new High version',
  'adidas-running-shoes': 'New folder',
  'nike-air-max-dn': 'Nike Air Max Dn Comfortable Shock-Absorbing',
  'nike-vomero-18': 'Nike Air Zoom Vomero 18 GTX',
  'valentino-boots': 'VALENTINO 2021 Daigou Level'
};

// Product data
const products = [
  {
    handle: 'fendi-frameless-sunglasses',
    title: 'Fendi 2025 Frameless Sunglasses',
    description: '$54 Fendi 2025 New Style, Absolutely Gorgeous F Diamond, Metal Square Frameless Sunglasses, Sun Protection, Slimming Effect, Anti-UV, Unisex. FE4082US',
    price: 54.00,
    sku: 'FENDI-FRAMELESS-SUNGLASSES-ONE-SIZE'
  },
  {
    handle: 'cartier-anti-blue-glasses',
    title: 'Cartier Anti-Blue Light Glasses',
    description: '$55 Cartier 2024 New Frameless Fashion Anti-Blue Light High-Definition Ultra-light Stylish Young Portable Glasses',
    price: 55.00,
    sku: 'CARTIER-ANTI-BLUE-GLASSES-ONE-SIZE'
  },
  {
    handle: 'ferragamo-fd8131-sunglasses',
    title: 'Salvatore Ferragamo FD8131 Sunglasses',
    description: '$58 Salvatore Ferragamo MODEL FD8131 SIZE 53-22-145',
    price: 58.00,
    sku: 'FERRAGAMO-FD8131-SUNGLASSES-ONE-SIZE'
  },
  {
    handle: 'lv-classic-sunglasses',
    title: 'LV Classic Business Sunglasses',
    description: '$60 LV classic business men\'s sunglasses, polarized metal full-frame sunshade, trendy new outdoor sport shades',
    price: 60.00,
    sku: 'LV-CLASSIC-SUNGLASSES-ONE-SIZE'
  },
  {
    handle: 'ferragamo-sf1092-sunglasses',
    title: 'Salvatore Ferragamo SF1092SLB Sunglasses',
    description: '$69 Salvatore Ferragamo MODEL SF1092SLB SIZE 52-19-145',
    price: 69.00,
    sku: 'FERRAGAMO-SF1092-SUNGLASSES-ONE-SIZE'
  },
  {
    handle: 'gucci-retro-horsebit-bag',
    title: '1955 Gucci Retro Horsebit Bag',
    description: '$117 The beautiful 1955 Gucci Retro Horsebit Bag. Retail counter matching high version. Classic Horsebit buckle + Monogram + piping design. Size 25 x 18 cm',
    price: 117.00,
    sku: 'GUCCI-RETRO-HORSEBIT-BAG-ONE-SIZE'
  },
  {
    handle: 'louboutin-red-sole-heels',
    title: 'Christian Louboutin CL Red Sole Shoes',
    description: '$119 Christian Louboutin Red Sole Shoes Early Spring Collection. A must-have high heel for every goddess. Heel Height 10cm. Sizes 35-39',
    price: 119.00,
    sku: 'LOUBOUTIN-RED-SOLE-HEELS-ONE-SIZE'
  },
  {
    handle: 'dior-lady-dlite-bag',
    title: 'DIOR Lady D-Lite Embroidered Bag',
    description: '$159 DIOR Lady D-Lite Embroidered Bag with cross-body strap. Three-dimensional embroidery with over 100,000 stitches. Italian waterproof environmentally friendly canvas. Size 24cm',
    price: 159.00,
    sku: 'DIOR-LADY-DLITE-BAG-ONE-SIZE'
  },
  {
    handle: 'gucci-mens-backpack',
    title: 'GUCCI Mens New Backpack',
    description: '$107 GUCCI Men\'s 2025 early spring collection backpack. Double G logo embossed on cowhide with grained texture. Multiple layered pockets plus D-ring for accessories',
    price: 107.00,
    sku: 'GUCCI-MENS-BACKPACK-ONE-SIZE'
  },
  {
    handle: 'gucci-miami-slippers',
    title: 'Gucci Miami 2022 Slippers',
    description: '$97 Gucci Miami 2022 Summer Macaron Color Thick-soled Slippers. Comfortable and versatile. TU material outsole. Shoe height 4-5CM. Sizes 35-40',
    price: 97.00,
    sku: 'GUCCI-MIAMI-SLIPPERS-ONE-SIZE'
  },
  {
    handle: 'lv-montsouris-backpack',
    title: 'LV Montsouris BB Backpack',
    description: '$130 LV Backpack Multi-purpose Bag. The Montsouris BB Backpack introduced Winter 2020. Classic Monogram canvas and calfskin leather',
    price: 130.00,
    sku: 'LV-MONTSOURIS-BACKPACK-ONE-SIZE'
  },
  {
    handle: 'lv-pillow-bag',
    title: 'LV Pillow Bag',
    description: 'LV Pillow Bag - Stylish designer bag',
    price: 99.00,
    sku: 'LV-PILLOW-BAG-ONE-SIZE'
  },
  {
    handle: 'miumiu-mary-janes',
    title: 'MiuMiu 2022SS Mary Janes',
    description: '$118 MiuMiu 2022/SS High version Miu Miu Mary Janes. Patent leather patchwork lambskin lining genuine leather sole. Size 35-39',
    price: 118.00,
    sku: 'MIUMIU-MARY-JANES-ONE-SIZE'
  },
  {
    handle: 'adidas-running-shoes',
    title: 'Adidas Adizero Running Shoes',
    description: '$57 Company Level Adidas Adizero Goukana. Versatile Comfortable Wear-Resistant Breathable Low-Top Casual Sports Running Shoes. Sizes 36-45',
    price: 57.00,
    sku: 'ADIDAS-RUNNING-SHOES-ONE-SIZE'
  },
  {
    handle: 'nike-air-max-dn',
    title: 'Nike Air Max Dn Running Shoes',
    description: '$52 Nike Air Max Dn Comfortable Shock-Absorbing Small Air Cushion Running Shoes. Unisex Ivory White. Size 36-46',
    price: 52.00,
    sku: 'NIKE-AIR-MAX-DN-ONE-SIZE'
  },
  {
    handle: 'nike-vomero-18',
    title: 'Nike Air Zoom Vomero 18 GTX',
    description: '$55 Nike Air Zoom Vomero 18 GTX. Genuine Zoom cushioning technology. Sizes 36-46',
    price: 55.00,
    sku: 'NIKE-VOMERO-18-ONE-SIZE'
  },
  {
    handle: 'valentino-boots',
    title: 'VALENTINO Daigou Level Boots',
    description: '$139 VALENTINO Daigou Level boots. Hardware highlights luxury. Imported calfskin leather lining EVE foam sole. Sizes 35-40',
    price: 139.00,
    sku: 'VALENTINO-BOOTS-ONE-SIZE'
  }
];

const importsDir = path.join(__dirname, '..', 'storefront', 'public', 'images', 'imports');

function getImagesForProduct(handle) {
  const folderName = productFolderMapping[handle];
  if (!folderName) {
    console.warn(`No folder mapping for product: ${handle}`);
    return { thumbnail: '', images: [] };
  }
  
  const folderPath = path.join(importsDir, folderName);
  
  if (!fs.existsSync(folderPath)) {
    console.warn(`Folder not found: ${folderPath}`);
    return { thumbnail: '', images: [] };
  }
  
  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.webp'))
    .sort(); // Sort to ensure consistent order
  
  if (files.length === 0) {
    console.warn(`No images found in: ${folderPath}`);
    return { thumbnail: '', images: [] };
  }
  
  // URL encode the folder name for the URL
  const encodedFolderName = encodeURIComponent(folderName);
  
  const imageUrls = files.map(file => `${IMAGE_BASE_URL}/${encodedFolderName}/${encodeURIComponent(file)}`);
  
  return {
    thumbnail: imageUrls[0],
    images: imageUrls
  };
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCSV() {
  // CSV Header - Medusa product import format
  const headers = [
    'Product Id',
    'Product Handle',
    'Product Title',
    'Product Subtitle',
    'Product Description',
    'Product Status',
    'Product Thumbnail',
    'Product Weight',
    'Product Length',
    'Product Width',
    'Product Height',
    'Product HS Code',
    'Product Origin Country',
    'Product MID Code',
    'Product Material',
    'Product Collection Id',
    'Product Type Id',
    'Product Tag 1',
    'Product Discountable',
    'Product External Id',
    'Variant Id',
    'Variant Title',
    'Variant SKU',
    'Variant Barcode',
    'Variant Allow Backorder',
    'Variant Manage Inventory',
    'Variant Weight',
    'Variant Length',
    'Variant Width',
    'Variant Height',
    'Variant HS Code',
    'Variant Origin Country',
    'Variant MID Code',
    'Variant Material',
    'Variant Price EUR',
    'Variant Price USD',
    'Variant Option 1 Name',
    'Variant Option 1 Value',
    'Product Image 1 Url',
    'Product Image 2 Url',
    'Product Image 3 Url',
    'Product Image 4 Url',
    'Product Image 5 Url'
  ];
  
  const rows = [headers.join(',')];
  
  for (const product of products) {
    const { thumbnail, images } = getImagesForProduct(product.handle);
    
    console.log(`${product.handle}: ${images.length} images found`);
    
    const row = [
      '', // Product Id
      product.handle, // Product Handle
      product.title, // Product Title
      '', // Product Subtitle
      product.description, // Product Description
      'published', // Product Status
      thumbnail, // Product Thumbnail
      '', // Product Weight
      '', // Product Length
      '', // Product Width
      '', // Product Height
      '', // Product HS Code
      '', // Product Origin Country
      '', // Product MID Code
      '', // Product Material
      '', // Product Collection Id
      '', // Product Type Id
      '', // Product Tag 1
      'TRUE', // Product Discountable
      '', // Product External Id
      '', // Variant Id
      `${product.title} - One Size`, // Variant Title
      product.sku, // Variant SKU
      '', // Variant Barcode
      'FALSE', // Variant Allow Backorder
      'TRUE', // Variant Manage Inventory
      '', // Variant Weight
      '', // Variant Length
      '', // Variant Width
      '', // Variant Height
      '', // Variant HS Code
      '', // Variant Origin Country
      '', // Variant MID Code
      '', // Variant Material
      '', // Variant Price EUR
      product.price.toFixed(2), // Variant Price USD
      'Size', // Variant Option 1 Name
      'One Size', // Variant Option 1 Value
      images[0] || '', // Product Image 1 Url
      images[1] || '', // Product Image 2 Url
      images[2] || '', // Product Image 3 Url
      images[3] || '', // Product Image 4 Url
      images[4] || '' // Product Image 5 Url
    ];
    
    rows.push(row.map(escapeCSV).join(','));
  }
  
  return rows.join('\n');
}

// Generate and save CSV
const csv = generateCSV();
const outputPath = path.join(__dirname, '..', 'product-import-local-images.csv');
fs.writeFileSync(outputPath, csv, 'utf-8');
console.log(`\nCSV saved to: ${outputPath}`);
console.log(`Total products: ${products.length}`);
