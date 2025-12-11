const Medusa = require("@medusajs/js-sdk").default

async function main() {
  const baseUrl = "http://localhost:9000"
  const publishableKey = "pk_5dd07bd433be90eac93f2a49ef7a463c1d2c2b3c97d002ea530760a3d62aa9b5"

  const sdk = new Medusa({ baseUrl, publishableKey })

  const { regions } = await sdk.store.region.list()
  if (!regions?.length) {
    throw new Error("No regions available for the publishable key")
  }
  const regionId = regions[0].id

  const { cart } = await sdk.store.cart.create({ region_id: regionId })

  const { products } = await sdk.store.product.list({ limit: 100 })
  const allVariants = (products || []).flatMap((p) => p.variants || [])
  const candidate = allVariants.find(
    (v) => v && (v.manage_inventory === false || v.allow_backorder === true)
  )
  if (!candidate) {
    throw new Error("No non-inventory/allow-backorder variants available to add to cart")
  }
  const variantId = candidate.id

  await sdk.store.cart.createLineItem(cart.id, { variant_id: variantId, quantity: 1 })

  const { cart: updated } = await sdk.store.cart.retrieve(cart.id)

  console.log(
    JSON.stringify({ regionId, cartId: cart.id, variantId, items: updated.items?.length || 0 }, null, 2)
  )
}

main().catch((err) => {
  console.error(err?.message || err)
  process.exit(1)
})
