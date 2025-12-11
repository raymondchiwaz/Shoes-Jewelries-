import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import type { IOrderModuleService } from "@medusajs/framework/types"

// Returns top-selling products based on order line item quantities.
// Public store endpoint: GET /store/trending
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)

    // Fetch recent orders with their items. Limit the dataset for performance.
    // listOrders typically returns [orders, count]
    const [orders] = await (orderModuleService as any).listOrders(
      {},
      { relations: ["items"], take: 500 }
    )

    const counts: Record<string, number> = {}

    for (const order of orders || []) {
      const items = (order as any)?.items || []
      const created = new Date((order as any)?.created_at || Date.now()).getTime()
      const daysAgo = Math.max(0, (Date.now() - created) / (1000 * 60 * 60 * 24))
      const recencyWeight = Math.exp(-daysAgo / 14) // 2-week half-life
      for (const item of items) {
        const productId = (item as any).product_id || (item as any)?.product?.id
        const qty = (item as any)?.quantity ?? 0
        if (!productId) continue
        counts[productId] = (counts[productId] || 0) + qty * recencyWeight
      }
    }

    const products = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([id, count]) => ({ id, count }))

    res.json({ products })
  } catch (e: any) {
    // Fail gracefully; return empty list so storefront can fallback
    res.status(200).json({ products: [] })
  }
}
