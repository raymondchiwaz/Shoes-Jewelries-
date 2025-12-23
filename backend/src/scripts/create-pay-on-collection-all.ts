import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function createPayOnCollectionAll({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
    const regionModuleService = container.resolve(Modules.REGION)

    logger.info("Starting creation of 'Pay on Collection' for ALL profiles...")

    // 1. Get ALL Shipping Profiles
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles()

    if (!shippingProfiles.length) {
        logger.error("No shipping profiles found!")
        return
    }
    logger.info(`Found ${shippingProfiles.length} shipping profiles.`)

    // 2. Get ALL Regions
    const regions = await regionModuleService.listRegions()
    if (!regions.length) {
        logger.error("No regions found!")
        return
    }
    logger.info(`Found ${regions.length} regions.`)

    // 3. Get ALL Fulfillment Sets
    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
        type: "shipping",
    })

    if (!fulfillmentSets.length) {
        logger.error("No shipping fulfillment sets found!")
        return
    }

    // 4. Iterate Regions, then Profiles
    const allCurrencies = [...new Set(regions.map(r => r.currency_code))]
    logger.info(`Currencies to support: ${allCurrencies.join(", ")}`)

    for (const fs of fulfillmentSets) {
        // Fetch full FS with service zones
        const fullFs = await fulfillmentModuleService.retrieveFulfillmentSet(fs.id, {
            relations: ["service_zones"]
        })

        if (!fullFs.service_zones?.length) {
            logger.info(`Skipping Fulfillment Set ${fs.name} (no service zones)`)
            continue
        }

        for (const serviceZone of fullFs.service_zones) {
            logger.info(`Processing Service Zone: ${serviceZone.name} (${serviceZone.id}) in FS: ${fs.name}`)

            for (const profile of shippingProfiles) {
                const name = `Pay on Collection - ${profile.name} - ${serviceZone.name}`
                logger.info(`Creating option: ${name}`)

                try {
                    const { result } = await createShippingOptionsWorkflow(container).run({
                        input: [
                            {
                                name: "Pay on Collection",
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
                    logger.info(`Successfully created option: ${result[0].id}`)
                } catch (error) {
                    logger.error(`Failed to create option: ${error.message}`)
                }
            }
        }
    }

    logger.info("Finished creating shipping options.")
}
