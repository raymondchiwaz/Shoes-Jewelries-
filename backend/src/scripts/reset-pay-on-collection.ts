import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow, deleteShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function resetPayOnCollection({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
    const regionModuleService = container.resolve(Modules.REGION)

    logger.info("--- Resetting Pay on Collection Options ---")

    // 1. Find existing "Pay on Collection" options
    const allOptions = await fulfillmentModuleService.listShippingOptions({})

    const optionsToDelete = allOptions.filter(o =>
        o.name.includes("Pay on Collection") ||
        (o.price_type === "flat" && o.provider_id === "manual_manual" && o.name.toLowerCase().includes("pay"))
    )

    if (optionsToDelete.length > 0) {
        logger.info(`Found ${optionsToDelete.length} options to delete.`)
        try {
            await deleteShippingOptionsWorkflow(container).run({
                input: { ids: optionsToDelete.map(o => o.id) }
            })
            logger.info("Deleted existing options.")
        } catch (e) {
            logger.error(`Failed to delete options: ${e.message}`)
        }
    } else {
        logger.info("No existing options to delete.")
    }

    // 2. Re-create Options (One per Profile per Zone)
    logger.info("Re-creating options...")

    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles()
    const regions = await regionModuleService.listRegions()
    const allCurrencies = [...new Set(regions.map(r => r.currency_code))]

    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
        type: "shipping"
    })

    for (const fs of fulfillmentSets) {
        // Fetch full FS with service zones separately
        const fullFs = await fulfillmentModuleService.retrieveFulfillmentSet(fs.id, {
            relations: ["service_zones", "service_zones.geo_zones"]
        })

        if (!fullFs.service_zones?.length) continue

        for (const serviceZone of fullFs.service_zones) {
            for (const profile of shippingProfiles) {
                const name = `Pay on Collection` // Simple name for UI

                try {
                    const { result } = await createShippingOptionsWorkflow(container).run({
                        input: [
                            {
                                name: name,
                                price_type: "flat",
                                provider_id: "manual_manual",
                                service_zone_id: serviceZone.id,
                                shipping_profile_id: profile.id,
                                type: {
                                    label: "Pay on Collection",
                                    description: "Pay shipping fees when you collect the package.",
                                    code: "pay-on-collection",
                                },
                                prices: allCurrencies.map(code => ({
                                    currency_code: code,
                                    amount: 0
                                })),
                                rules: [
                                    {
                                        attribute: "enabled_in_store",
                                        value: "true",
                                        operator: "eq",
                                    },
                                    {
                                        attribute: "is_return",
                                        value: "false",
                                        operator: "eq",
                                    }
                                ],
                            },
                        ],
                    })
                    logger.info(`Created option for ${profile.name} in ${serviceZone.name}: ${result[0].id}`)
                } catch (error) {
                    logger.error(`Failed to create option: ${error.message}`)
                }
            }
        }
    }

    logger.info("--- Reset Complete ---")
}
