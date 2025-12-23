import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function inspectShippingProfiles({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const productModuleService = container.resolve(Modules.PRODUCT)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    logger.info("--- Inspecting Shipping Profiles ---")

    // 1. List all Shipping Profiles
    const profiles = await fulfillmentModuleService.listShippingProfiles()
    logger.info(`Found ${profiles.length} Shipping Profiles:`)
    profiles.forEach(p => logger.info(`- [${p.id}] ${p.name} (Type: ${p.type})`))

    // 2. List all Shipping Options
    const options = await fulfillmentModuleService.listShippingOptions()
    logger.info(`Found ${options.length} Shipping Options:`)
    options.forEach(o => {
        logger.info(`- [${o.id}] ${o.name}`)
        logger.info(`  Provider: ${o.provider_id}`)
        logger.info(`  Profile ID: ${o.shipping_profile_id}`)
    })

    // 3. List Products
    const [products] = await productModuleService.listAndCountProducts({}, { take: 10 })

    logger.info(`Found ${products.length} Products (showing first 10):`)
    products.forEach(p => {
        logger.info(`- [${p.id}] ${p.title}`)
        // Try to access shipping_profile_id if it exists on the object
        logger.info(`  Profile ID: ${(p as any).shipping_profile_id}`)
    })

    logger.info("--- End Inspection ---")
}
