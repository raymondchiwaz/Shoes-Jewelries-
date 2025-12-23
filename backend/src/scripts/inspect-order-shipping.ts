import type { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService, IFulfillmentModuleService } from "@medusajs/framework/types"

export default async function inspectOrderShipping({ container }: ExecArgs) {
    const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
    const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    // Get the most recent order
    const orders = await orderModuleService.listOrders(
        {},
        {
            take: 1,
            order: { created_at: "DESC" },
        }
    )

    if (orders.length === 0) {
        console.log("No orders found")
        return
    }

    const latestOrder = orders[0]

    // Retrieve full order with shipping methods
    const order = await orderModuleService.retrieveOrder(latestOrder.id, {
        relations: ['shipping_methods']
    })

    console.log("\n📦 Order:", order.id, `(#${order.display_id})`)
    console.log("   Created:", order.created_at)
    console.log("   Email:", order.email)

    const shippingMethods = (order as any).shipping_methods || []
    console.log("\n🚚 Shipping Methods:", shippingMethods.length)

    for (const method of shippingMethods) {
        console.log("\n  ━━━━━━━━━━━━━━━━━━━━━━━━━━")
        console.log("  Method ID:", method.id)
        console.log("  Shipping Option ID:", method.shipping_option_id)
        console.log("  Name:", method.name)
        console.log("  Amount:", method.amount, method.currency_code || order.currency_code)

        // Try to get the shipping option details
        try {
            const shippingOptions = await fulfillmentModuleService.listShippingOptions({
                id: [method.shipping_option_id]
            })

            if (shippingOptions.length > 0) {
                const option = shippingOptions[0]
                console.log("\n  📋 Shipping Option Details:")
                console.log("     Name:", option.name)
                console.log("     Provider:", option.provider_id)
                console.log("     Type:", option.type)
                console.log("     Data:", JSON.stringify(option.data, null, 4))
            }
        } catch (e: any) {
            console.log("  ⚠️  Could not fetch shipping option details:", e.message)
        }
    }

    console.log("\n✅ Done!\n")
}
