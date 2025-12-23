import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function inspectLatestCart({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const cartModuleService = container.resolve(Modules.CART)
    const productModuleService = container.resolve(Modules.PRODUCT)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    logger.info("--- Inspecting Latest Cart ---")

    // 1. Get Latest Cart
    const carts = await cartModuleService.listCarts({}, {
        take: 1,
        order: { created_at: "DESC" },
        relations: ["items", "shipping_methods", "shipping_address"]
    })

    if (!carts.length) {
        logger.info("No carts found.")
        return
    }

    const cart = carts[0]
    logger.info(`Cart ID: ${cart.id}`)
    logger.info(`Region ID: ${cart.region_id}`)
    logger.info(`Shipping Address Country: ${cart.shipping_address?.country_code}`)

    // 2. Inspect Items and their Profiles
    logger.info(`Items (${cart.items?.length || 0}):`)

    const requiredProfiles = new Set<string>()

    if (cart.items) {
        for (const item of cart.items) {
            let profileId = "unknown"
            let productTitle = "unknown"

            if (item.product_id) {
                // Fetch product without relations first
                const product = await productModuleService.retrieveProduct(item.product_id)

                productTitle = product.title
                // Cast to any to access shipping_profile_id if it's not in DTO
                profileId = (product as any).shipping_profile_id

                if (!profileId) {
                    // If null, it uses the default profile. We need to find it.
                    // Usually we can assume it's the "Default Shipping Profile"
                    // Let's try to fetch all profiles and find type=default
                    const profiles = await fulfillmentModuleService.listShippingProfiles({ type: "default" })
                    if (profiles.length) {
                        profileId = profiles[0].id + " (Default)"
                    } else {
                        profileId = "null (Default not found)"
                    }
                }
            }

            logger.info(`- Item: ${item.title} (Product: ${productTitle})`)
            logger.info(`  Quantity: ${item.quantity}`)
            logger.info(`  Required Profile: ${profileId}`)

            if (profileId) requiredProfiles.add(profileId.replace(" (Default)", ""))
        }
    }

    logger.info(`Unique Required Profiles: ${Array.from(requiredProfiles).join(", ")}`)

    // 3. Inspect Selected Shipping Methods
    logger.info(`Selected Shipping Methods (${cart.shipping_methods?.length || 0}):`)
    if (cart.shipping_methods) {
        for (const sm of cart.shipping_methods) {
            try {
                const option = await fulfillmentModuleService.retrieveShippingOption(sm.shipping_option_id)
                logger.info(`- Method ID: ${sm.id}`)
                logger.info(`  Option ID: ${sm.shipping_option_id}`)
                logger.info(`  Option Name: ${option.name}`)
                logger.info(`  Option Profile: ${option.shipping_profile_id}`)
            } catch (e) {
                logger.info(`- Method ID: ${sm.id} (Option not found: ${sm.shipping_option_id})`)
            }
        }
    }

    logger.info("--- End Inspection ---")
}
