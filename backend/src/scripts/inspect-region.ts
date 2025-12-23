import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function inspectRegion({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const regionModuleService = container.resolve(Modules.REGION)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    logger.info("--- Inspecting Region ---")

    const regions = await regionModuleService.listRegions({
        id: ["reg_01KCECAQ03P89NXK1QXF6WEVEK"]
    }, {
        relations: ["countries"]
    })

    if (!regions.length) {
        logger.info("Region not found.")
        return
    }

    const region = regions[0]
    logger.info(`Region: ${region.name} (${region.id})`)
    logger.info(`Currency: ${region.currency_code}`)
    logger.info(`Countries: ${region.countries?.map(c => c.iso_2).join(", ")}`)

    // Check Fulfillment Sets
    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
        type: "shipping"
    })

    logger.info(`Fulfillment Sets (${fulfillmentSets.length}):`)
    for (const fs of fulfillmentSets) {
        logger.info(`- Set: ${fs.name} (${fs.id})`)

        // Fetch Service Zones
        const fullFs = await fulfillmentModuleService.retrieveFulfillmentSet(fs.id, {
            relations: ["service_zones", "service_zones.geo_zones"]
        })

        if (fullFs.service_zones) {
            for (const sz of fullFs.service_zones) {
                logger.info(`  - Zone: ${sz.name} (${sz.id})`)
                if (sz.geo_zones) {
                    for (const gz of sz.geo_zones) {
                        logger.info(`    - Geo: ${gz.type} - ${gz.country_code} ${gz.province_code || ""}`)
                    }
                }
            }
        }
    }

    logger.info("--- End Inspection ---")
}
