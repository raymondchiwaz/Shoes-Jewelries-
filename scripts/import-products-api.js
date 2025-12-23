/**
 * Import products with local images via Medusa Admin API
 * 
 * This script:
 * 1. Reads the staged product CSV
 * 2. Authenticates with Medusa Admin
 * 3. Creates products via API
 * 4. Uploads images directly to the file service
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:9000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@medusa-test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'supersecret';

// Paths
const PRODUCTS_DIR = path.join(__dirname, '..', 'backend', 'static', 'products');

// Product data with image files
const products = [
  {
    handle: 'fendi-frameless-sunglasses',
    title: 'Fendi 2025 Frameless Sunglasses',
    description: '$54 Fendi 2025 New Style, Absolutely Gorgeous F Diamond, Metal Square Frameless Sunglasses, Sun Protection, Slimming Effect, Anti-UV, Unisex. FE4082US',
    price: 5400, // in cents
  },
  {
    handle: 'cartier-anti-blue-glasses',
    title: 'Cartier Anti-Blue Light Glasses',
    description: '$55 Cartier 2024 New Frameless Fashion Anti-Blue Light High-Definition Ultra-light Stylish Young Portable Glasses',
    price: 5500,
  },
  {
    handle: 'ferragamo-fd8131-sunglasses',
    title: 'Salvatore Ferragamo FD8131 Sunglasses',
    description: '$58 Salvatore Ferragamo MODEL FD8131 SIZE 53-22-145',
    price: 5800,
  },
  {
    handle: 'lv-classic-sunglasses',
    title: 'LV Classic Business Sunglasses',
    description: '$60 LV classic business men\'s sunglasses, polarized metal full-frame sunshade, trendy new outdoor sport shades',
    price: 6000,
  },
  {
    handle: 'ferragamo-sf1092-sunglasses',
    title: 'Salvatore Ferragamo SF1092SLB Sunglasses',
    description: '$69 Salvatore Ferragamo MODEL SF1092SLB SIZE 52-19-145',
    price: 6900,
  },
  {
    handle: 'gucci-retro-horsebit-bag',
    title: '1955 Gucci Retro Horsebit Bag',
    description: '$117 The beautiful 1955 Gucci Retro Horsebit Bag. Retail counter matching high version. Classic Horsebit buckle + Monogram + piping design. Size 25 x 18 cm',
    price: 11700,
  },
  {
    handle: 'louboutin-red-sole-heels',
    title: 'Christian Louboutin CL Red Sole Shoes',
    description: '$119 Christian Louboutin Red Sole Shoes Early Spring Collection. A must-have high heel for every goddess. Heel Height 10cm. Sizes 35-39',
    price: 11900,
  },
  {
    handle: 'dior-lady-dlite-bag',
    title: 'DIOR Lady D-Lite Embroidered Bag',
    description: '$159 DIOR Lady D-Lite Embroidered Bag with cross-body strap. Three-dimensional embroidery with over 100,000 stitches. Italian waterproof environmentally friendly canvas. Size 24cm',
    price: 15900,
  },
  {
    handle: 'gucci-mens-backpack',
    title: 'GUCCI Mens New Backpack',
    description: '$107 GUCCI Men\'s 2025 early spring collection backpack. Double G logo embossed on cowhide with grained texture. Multiple layered pockets plus D-ring for accessories',
    price: 10700,
  },
  {
    handle: 'gucci-miami-slippers',
    title: 'Gucci Miami 2022 Slippers',
    description: '$97 Gucci Miami 2022 Summer Macaron Color Thick-soled Slippers. Comfortable and versatile. TU material outsole. Shoe height 4-5CM. Sizes 35-40',
    price: 9700,
  },
  {
    handle: 'lv-montsouris-backpack',
    title: 'LV Montsouris BB Backpack',
    description: '$130 LV Backpack Multi-purpose Bag. The Montsouris BB Backpack introduced Winter 2020. Classic Monogram canvas and calfskin leather',
    price: 13000,
  },
  {
    handle: 'lv-pillow-bag',
    title: 'LV Pillow Bag',
    description: 'LV Pillow Bag - Stylish designer bag',
    price: 9900,
  },
  {
    handle: 'miumiu-mary-janes',
    title: 'MiuMiu 2022SS Mary Janes',
    description: '$118 MiuMiu 2022/SS High version Miu Miu Mary Janes. Patent leather patchwork lambskin lining genuine leather sole. Size 35-39',
    price: 11800,
  },
  {
    handle: 'adidas-running-shoes',
    title: 'Adidas Adizero Running Shoes',
    description: '$57 Company Level Adidas Adizero Goukana. Versatile Comfortable Wear-Resistant Breathable Low-Top Casual Sports Running Shoes. Sizes 36-45',
    price: 5700,
  },
  {
    handle: 'nike-air-max-dn',
    title: 'Nike Air Max Dn Running Shoes',
    description: '$52 Nike Air Max Dn Comfortable Shock-Absorbing Small Air Cushion Running Shoes. Unisex Ivory White. Size 36-46',
    price: 5200,
  },
  {
    handle: 'nike-vomero-18',
    title: 'Nike Air Zoom Vomero 18 GTX',
    description: '$55 Nike Air Zoom Vomero 18 GTX. Genuine Zoom cushioning technology. Sizes 36-46',
    price: 5500,
  },
  {
    handle: 'valentino-boots',
    title: 'VALENTINO Daigou Level Boots',
    description: '$139 VALENTINO Daigou Level boots. Hardware highlights luxury. Imported calfskin leather lining EVE foam sole. Sizes 35-40',
    price: 13900,
  }
];

let authToken = null;

async function authenticate() {
  console.log('Authenticating with Medusa Admin...');
  
  const response = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Authentication failed: ${response.status} - ${text}`);
  }
  
  const data = await response.json();
  authToken = data.token;
  console.log('Authentication successful!');
  return authToken;
}

async function adminRequest(endpoint, options = {}) {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed: ${response.status} - ${text}`);
  }
  
  return response.json();
}

async function uploadImage(filePath) {
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('files', fs.createReadStream(filePath));
  
  const response = await fetch(`${BACKEND_URL}/admin/uploads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      ...form.getHeaders()
    },
    body: form
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${text}`);
  }
  
  const data = await response.json();
  return data.uploads[0].url;
}

function getProductImages(handle) {
  const dir = path.join(PRODUCTS_DIR, handle);
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(f => path.join(dir, f));
}

async function getShippingProfile() {
  const data = await adminRequest('/admin/shipping-profiles');
  return data.shipping_profiles[0]?.id;
}

async function getSalesChannel() {
  const data = await adminRequest('/admin/sales-channels');
  return data.sales_channels[0]?.id;
}

async function getRegion() {
  const data = await adminRequest('/admin/regions');
  // Prefer US region
  const usRegion = data.regions.find(r => r.currency_code === 'usd');
  return usRegion?.id || data.regions[0]?.id;
}

async function createProduct(product, shippingProfileId, salesChannelId, regionId) {
  console.log(`\nCreating product: ${product.title}`);
  
  // Get local image files
  const imageFiles = getProductImages(product.handle);
  console.log(`  Found ${imageFiles.length} images`);
  
  // For now, use static URLs since the files are served from static folder
  const imageUrls = imageFiles.map((_, i) => 
    `${BACKEND_URL}/static/products/${product.handle}/${i + 1}.jpg`
  );
  
  const productData = {
    title: product.title,
    handle: product.handle,
    description: product.description,
    status: 'published',
    is_giftcard: false,
    discountable: true,
    shipping_profile_id: shippingProfileId,
    thumbnail: imageUrls[0] || null,
    images: imageUrls.map(url => ({ url })),
    options: [
      { title: 'Size', values: ['One Size'] }
    ],
    variants: [
      {
        title: `${product.title} - One Size`,
        sku: `${product.handle.toUpperCase().replace(/-/g, '-')}-ONE-SIZE`,
        manage_inventory: true,
        allow_backorder: false,
        options: { Size: 'One Size' },
        prices: [
          {
            amount: product.price,
            currency_code: 'usd'
          }
        ]
      }
    ],
    sales_channels: [{ id: salesChannelId }]
  };
  
  try {
    const result = await adminRequest('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    console.log(`  ✓ Created: ${result.product.id}`);
    return result.product;
  } catch (error) {
    console.error(`  ✗ Failed: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Product Import via Medusa Admin API');
  console.log('='.repeat(60));
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Products directory: ${PRODUCTS_DIR}`);
  console.log('');
  
  try {
    await authenticate();
    
    const shippingProfileId = await getShippingProfile();
    const salesChannelId = await getSalesChannel();
    const regionId = await getRegion();
    
    console.log(`\nShipping Profile: ${shippingProfileId}`);
    console.log(`Sales Channel: ${salesChannelId}`);
    console.log(`Region: ${regionId}`);
    
    let created = 0;
    let failed = 0;
    
    for (const product of products) {
      const result = await createProduct(product, shippingProfileId, salesChannelId, regionId);
      if (result) created++;
      else failed++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Import complete: ${created} created, ${failed} failed`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
