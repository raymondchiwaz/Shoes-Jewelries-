# n8n CSV Specification — Product Automation

## Columns (Exact Order)
1. `title`
2. `description`
3. `handle`
4. `collections` (comma-separated)
5. `tags` (comma-separated)
6. `colors` (comma-separated)
7. `sizes` (comma-separated)
8. `image_urls` (pipe-separated URLs)
9. `price_eur`
10. `price_usd`
11. `metadata` (JSON: { "campaign": "Black Friday", "vip_only": false })

## Variant Matrix
- Generate variants for every color×size combination; attach SKU rule `{handle}-{color}-{size}`

## Image Pipeline
- Download → compress → upload to file provider → capture URLs → link on product

## Workflow Steps
- Create product → create variants → upload images → assign price list → assign collections → set tags → publish
- Quality gate: send preview to Slack; ✅ publish; ❌ mark draft

## Error Handling
- Retry 3× on 429/5xx; move to dead-letter queue with Slack alert on failure

