import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function listProviders({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    logger.info("--- Listing Fulfillment Providers ---")

    const providers = await fulfillmentModuleService.listFulfillmentProviders()

    for (const p of providers) {
        logger.info(`Provider: ${p.name} (ID: ${p.id})`)
    }

    logger.info("--- End Listing ---")
}
