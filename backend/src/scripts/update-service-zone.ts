import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function updateServiceZone({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    const serviceZoneId = "serzo_01KCRFZRF531925KZZ7VHV71A6" // Southern Africa
    const countriesToAdd = ["bw", "mz", "za", "zm", "na"]

    logger.info(`Updating Service Zone ${serviceZoneId} to include: ${countriesToAdd.join(", ")}`)

    // 1. Get current Geo Zones to avoid duplicates
    const serviceZone = await fulfillmentModuleService.retrieveServiceZone(serviceZoneId, {
        relations: ["geo_zones"]
    })

    const existingCountries = new Set(serviceZone.geo_zones?.map(gz => gz.country_code))

    const geoZonesToAdd = countriesToAdd
        .filter(c => !existingCountries.has(c))
        .map(c => ({
            type: "country",
            country_code: c
        }))

    if (geoZonesToAdd.length === 0) {
        logger.info("All countries already exist in Service Zone.")
        return
    }

    logger.info(`Adding ${geoZonesToAdd.length} new Geo Zones...`)

    await fulfillmentModuleService.createGeoZones(
        geoZonesToAdd.map(gz => ({
            ...gz,
            service_zone_id: serviceZoneId
        }))
    )

    logger.info("Successfully updated Service Zone.")
}
