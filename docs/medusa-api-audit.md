# Medusa API Audit — Products, Variants, Images, Pricing, Collections, Tags

## Authentication
- Admin: Bearer token from Admin login (secure endpoints)
- Storefront: Publishable API key for store endpoints; cookies carry cart/session

## Endpoints
- Products
  - Create product: `POST /admin/products` (title, description, handle, metadata)
  - Upload images: `POST /admin/uploads` then attach image URLs on product
  - Update product: `POST /admin/products/:id`
- Variants
  - Create variant: `POST /admin/products/:id/variants` (options: size, color)
  - Update variant: `POST /admin/variants/:id`
- Price Lists (VIP)
  - Create price list: `POST /admin/price-lists`
  - Add prices: `POST /admin/price-lists/:id/prices`
  - Rules: customer group rule for VIP
- Promotions
  - Create promotion: `POST /admin/promotions` (rule: % off for VIP)
- Collections
  - Create collection: `POST /admin/collections`
  - Assign products: `POST /admin/collections/:id/products`
- Tags
  - Create tags: `POST /admin/product-tags`; assign on product payload
- Sales Channels
  - Create channel: `POST /admin/sales-channels` and assign products
  - Publishable API keys: `POST /admin/publishable-api-keys`, link to channel
- Orders (Store)
  - Complete cart: `POST /store/carts/:id/complete` (records order)
  - Update cart metadata: `POST /store/carts/:id` (metadata fields)

## Rate Limits & Notes
- Respect pagination; batch writes; 429 retry with exponential backoff
- Upload images to file provider (local/MinIO/CDN) before linking to products
- Use tags/collections consistently for campaign rails

## Modules in Use
- Sales Channel, Inventory, Promotion, Price Lists, Customers (VIP), Product Tags

