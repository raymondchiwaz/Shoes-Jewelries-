import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function assignProductsToDefaultProfile({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
    const productModuleService = container.resolve(Modules.PRODUCT)
    const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

    logger.info("--- Assigning All Products to Default Shipping Profile ---")

    // Get all shipping profiles
    const profiles = await fulfillmentModuleService.listShippingProfiles({})
    logger.info(`Found ${profiles.length} shipping profiles:`)
    for (const p of profiles) {
        logger.info(`  - ${p.name} (${p.id}) - Type: ${p.type}`)
    }

    // Find the default profile
    let defaultProfile = profiles.find(p => p.type === "default" || p.name.toLowerCase() === "default")
    if (!defaultProfile && profiles.length > 0) {
        defaultProfile = profiles[0]
        logger.info(`No 'default' profile found, using first profile: ${defaultProfile.name}`)
    }

    if (!defaultProfile) {
        logger.error("No shipping profiles found! Products cannot be shipped.")
        return
    }

    logger.info(`Using profile: ${defaultProfile.name} (${defaultProfile.id})`)

    // Get all products
    const products = await productModuleService.listProducts({})
    logger.info(`Found ${products.length} products`)

    // Link each product to the default shipping profile
    let linked = 0
    for (const product of products) {
        try {
            await remoteLink.create({
                [Modules.PRODUCT]: {
                    product_id: product.id,
                },
                [Modules.FULFILLMENT]: {
                    shipping_profile_id: defaultProfile.id,
                },
            })
            linked++
        } catch (e: any) {
            // Link might already exist
            if (!e.message?.includes("duplicate") && !e.message?.includes("already exists")) {
                logger.warn(`Failed to link ${product.title}: ${e.message}`)
            }
        }
    }

    logger.info(`Linked ${linked} products to ${defaultProfile.name}`)
    logger.info("--- Done! ---")
}
