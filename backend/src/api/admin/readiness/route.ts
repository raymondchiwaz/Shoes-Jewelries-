import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const salesChannelService: any = req.scope.resolve(Modules.SALES_CHANNEL)
    const pricingService: any = req.scope.resolve((Modules as any).PRICING)
    const inventoryService: any = req.scope.resolve(Modules.INVENTORY)
    const customerService: any = req.scope.resolve(Modules.CUSTOMER)

    const channels = await salesChannelService.listSalesChannels?.({})
    const primary = channels?.find((c: any) => /store/i.test(c?.name || "")) || channels?.[0]

    const priceLists = await pricingService?.listPriceLists?.({})
    const vipList = (priceLists || []).find((p: any) => /vip/i.test(p?.name || ""))

    const locations = await inventoryService?.listStockLocations?.({})
    const customers = await customerService?.listCustomerGroups?.({ name: "VIP" })

    const readiness = {
      sales_channel_ready: !!primary,
      vip_price_list_ready: !!vipList,
      inventory_location_ready: !!(locations && locations.length),
      vip_group_ready: !!(customers && customers.length),
    }

    res.json({ readiness, details: { channels, priceLists, locations, customers } })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Unknown error" })
  }
}

