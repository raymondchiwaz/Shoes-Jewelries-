import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function mapOptionsToProfiles({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    logger.info("--- Mapping Options to Profiles ---")

    const options = await fulfillmentModuleService.listShippingOptions({
        name: "Pay on Collection" // Filter roughly by name if possible, or just list all
    }, {
        relations: ["shipping_profile"]
    })

    // If filter didn't work (search might not be supported on name in all versions), list all
    const allOptions = await fulfillmentModuleService.listShippingOptions({}, {
        relations: ["shipping_profile"]
    })

    for (const opt of allOptions) {
        logger.info(`Option: ${opt.name}`)
        logger.info(`  ID: ${opt.id}`)
        logger.info(`  Profile: ${opt.shipping_profile?.name} (${opt.shipping_profile_id})`)
        logger.info(`  Price Type: ${opt.price_type}`)
        logger.info(`  Amount: ${opt.prices?.[0]?.amount ?? 'N/A'}`) // Check price if loaded
    }

    logger.info("--- End Mapping ---")
}
