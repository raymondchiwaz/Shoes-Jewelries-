import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function inspectCartOptions({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const cartModuleService = container.resolve(Modules.CART)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    logger.info("--- Inspecting Cart Options ---")

    // 1. Get Latest Cart
    const carts = await cartModuleService.listCarts({}, {
        take: 1,
        order: { created_at: "DESC" },
        relations: ["shipping_address"]
    })

    if (!carts.length) {
        logger.info("No carts found.")
        return
    }

    const cart = carts[0]
    logger.info(`Cart ID: ${cart.id}`)
    logger.info(`Region ID: ${cart.region_id}`)
    logger.info(`Country: ${cart.shipping_address?.country_code}`)

    // 2. List Shipping Options for Cart
    // We can't easily call the Store API logic directly here without mocking context,
    // but we can check what the Fulfillment Module thinks is valid for the location.

    // Find the fulfillment set for the region (we know it from previous steps, but let's be dynamic if possible or hardcode for speed)
    // Actually, let's just list ALL options and check their service_zone -> geo_zones to see if they cover 'bw'

    const options = await fulfillmentModuleService.listShippingOptions({}, {
        relations: ["service_zone", "service_zone.geo_zones", "shipping_profile"]
    })

    logger.info(`Total Options: ${options.length}`)

    const cartCountry = cart.shipping_address?.country_code

    for (const opt of options) {
        const zones = opt.service_zone?.geo_zones || []
        const coversCountry = zones.some(z => z.country_code === cartCountry)

        logger.info(`Option: ${opt.name} (${opt.id})`)
        logger.info(`  Profile: ${opt.shipping_profile?.name}`)
        logger.info(`  Zone: ${opt.service_zone?.name}`)
        logger.info(`  Covers ${cartCountry}?: ${coversCountry}`)
        logger.info(`  Provider: ${opt.provider_id}`)

        if (opt.name.includes("Pay on Collection") && coversCountry) {
            logger.info(`  *** MATCH CANDIDATE ***`)
        }
    }

    logger.info("--- End Inspection ---")
}
