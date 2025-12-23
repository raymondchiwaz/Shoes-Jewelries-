import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function createPayOnCollection({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
    const regionModuleService = container.resolve(Modules.REGION)

    logger.info("Starting creation of 'Pay on Collection' shipping option...")

    // 1. Get the Default Shipping Profile
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
        type: "default",
    })

    if (!shippingProfiles.length) {
        logger.error("No default shipping profile found!")
        return
    }

    const shippingProfile = shippingProfiles[0]
    logger.info(`Using Shipping Profile: ${shippingProfile.name} (${shippingProfile.id})`)

    // 2. Get the Region (assuming we want to add it to the first available region or a specific one)
    // For this script, we'll fetch all regions and add it to the first one found, or you could filter by currency/name
    const regions = await regionModuleService.listRegions()

    if (!regions.length) {
        logger.error("No regions found!")
        return
    }

    const region = regions[0] // Use the first region
    logger.info(`Using Region: ${region.name} (${region.id})`)

    // 3. Get the Fulfillment Set (Service Zone) for this region/location
    // We need to find a fulfillment set that services this region's countries.
    // A simpler approach for the boilerplate is to list fulfillment sets and pick the one used for shipping.
    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
        type: "shipping",
    })

    if (!fulfillmentSets.length) {
        logger.error("No shipping fulfillment sets found!")
        return
    }

    const fulfillmentSet = fulfillmentSets[0]
    logger.info(`Using Fulfillment Set: ${fulfillmentSet.name} (${fulfillmentSet.id})`)

    if (!fulfillmentSet.service_zones?.length) {
        // If service zones aren't expanded, we might need to fetch them or just assume if we know the ID.
        // Let's try to fetch fulfillment set WITH service zones to be safe, or just use the first one if we can't.
        // The listFulfillmentSets might not expand service_zones by default.
        // Let's try to list service zones directly if possible or re-fetch fulfillment set with relations if needed.
        // Actually, let's just try to list service zones filtered by fulfillment_set_id if that's an option,
        // or just use the one from the seed logic if we can match it.
    }

    // Re-fetch fulfillment set with service zones to be sure
    const fullFulfillmentSet = await fulfillmentModuleService.retrieveFulfillmentSet(fulfillmentSet.id, {
        relations: ["service_zones"]
    })

    if (!fullFulfillmentSet.service_zones.length) {
        logger.error("No service zones found in fulfillment set!")
        return
    }

    const serviceZone = fullFulfillmentSet.service_zones[0]
    logger.info(`Using Service Zone: ${serviceZone.name} (${serviceZone.id})`)

    // 4. Create the Shipping Option
    try {
        const { result } = await createShippingOptionsWorkflow(container).run({
            input: [
                {
                    name: "Pay on Collection",
                    price_type: "flat",
                    provider_id: "manual_manual",
                    service_zone_id: serviceZone.id,
                    shipping_profile_id: shippingProfile.id,
                    type: {
                        label: "Pay on Collection",
                        description: "Pay shipping fees when you collect the package.",
                        code: "pay-on-collection",
                    },
                    prices: [
                        {
                            currency_code: region.currency_code,
                            amount: 0,
                        },
                        // Add USD as well just in case
                        {
                            currency_code: "usd",
                            amount: 0
                        }
                    ],
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

        logger.info("Successfully created 'Pay on Collection' shipping option!")
        logger.info(`Option ID: ${result[0].id}`)
    } catch (error) {
        logger.error(`Failed to create shipping option: ${error.message}`)
        console.error(error)
    }
}
