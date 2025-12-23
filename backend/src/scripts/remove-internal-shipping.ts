import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { deleteShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function removeInternalShippingOptions({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    logger.info("--- Removing Internal Shipping Options ---")

    // Get all shipping options
    const allOptions = await fulfillmentModuleService.listShippingOptions({})

    // Filter to only internal (non-ShipRank) options
    const internalOptions = allOptions.filter(o =>
        o.provider_id !== "external-shipping_external-shipping"
    )

    logger.info(`Found ${allOptions.length} total shipping options`)
    logger.info(`Found ${internalOptions.length} internal (non-ShipRank) options to delete`)

    if (internalOptions.length === 0) {
        logger.info("No internal shipping options to delete.")
        return
    }

    // List them before deleting
    for (const option of internalOptions) {
        logger.info(`  - ${option.name} (${option.id}) - Provider: ${option.provider_id}`)
    }

    // Delete them
    logger.info("Deleting internal shipping options...")
    await deleteShippingOptionsWorkflow(container).run({
        input: { ids: internalOptions.map(o => o.id) }
    })

    logger.info("--- Done! All internal shipping options removed. ---")
}
