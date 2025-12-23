import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow, deleteShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function syncShiprankOptions({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    logger.info("--- Syncing ShipRank Options (Clean) ---")

    // 1. Fetch from ShipRank API
    const apiUrl = "https://www.shiprank.info/api/calculate"
    let shipRankOptions: any[] = []

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weight: 1000, currency_code: "usd" })
        })
        if (response.ok) {
            shipRankOptions = await response.json()
            logger.info(`Fetched ${shipRankOptions.length} options from ShipRank.`)
        } else {
            throw new Error(`Failed: ${response.statusText}`)
        }
    } catch (e: any) {
        logger.error(`Error: ${e.message}`)
        return
    }

    // 2. Delete ALL existing ShipRank options
    const allOptions = await fulfillmentModuleService.listShippingOptions({})
    const toDelete = allOptions.filter(o => o.provider_id === "external-shipping_external-shipping")

    if (toDelete.length > 0) {
        logger.info(`Deleting ${toDelete.length} existing options...`)
        await deleteShippingOptionsWorkflow(container).run({
            input: { ids: toDelete.map(o => o.id) }
        })
    }

    // 3. Get DEFAULT profile
    const profiles = await fulfillmentModuleService.listShippingProfiles({})
    const defaultProfile = profiles.find(p => p.type === "default") || profiles[0]
    if (!defaultProfile) {
        logger.error("No profile found!")
        return
    }
    logger.info(`Profile: ${defaultProfile.name}`)

    // 4. Get FIRST service zone only (to avoid duplicates)
    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({})
    let serviceZone: any = null

    for (const fs of fulfillmentSets) {
        const fullFs = await fulfillmentModuleService.retrieveFulfillmentSet(fs.id, {
            relations: ["service_zones"]
        })
        if (fullFs.service_zones?.length) {
            serviceZone = fullFs.service_zones[0]
            break
        }
    }

    if (!serviceZone) {
        logger.error("No service zone found!")
        return
    }
    logger.info(`Service Zone: ${serviceZone.name}`)

    // 5. Create ONE option per ShipRank service
    let count = 0
    for (const srOpt of shipRankOptions) {
        try {
            const rate = srOpt.data?.display_price || srOpt.amount || 0

            await createShippingOptionsWorkflow(container).run({
                input: [{
                    name: srOpt.name,
                    price_type: "calculated",
                    provider_id: "external-shipping_external-shipping",
                    service_zone_id: serviceZone.id,
                    shipping_profile_id: defaultProfile.id,
                    type: { label: "ShipRank", description: srOpt.name, code: "shiprank" },
                    data: { id: srOpt.id, name: srOpt.name, rate },
                    prices: [],
                    rules: [
                        { attribute: "enabled_in_store", value: "true", operator: "eq" },
                        { attribute: "is_return", value: "false", operator: "eq" }
                    ],
                }],
            })
            count++
        } catch (e: any) {
            logger.warn(`Skip ${srOpt.name}: ${e.message}`)
        }
    }

    logger.info(`Created ${count} options (no duplicates)`)
    logger.info("--- Done ---")
}
