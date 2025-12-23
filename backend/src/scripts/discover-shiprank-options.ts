import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function discoverShiprankOptions({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    logger.info("--- Discovering ShipRank Options ---")

    // Configuration (hardcoded for script, matches medusa-config.js)
    const apiUrl = "https://www.shiprank.info/api/calculate"
    // Note: API Key might be needed if not public, but service.ts suggests public endpoint for calculate doesn't strictly enforce it unless edge function

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                weight: 1000, // 1kg sample
                currency_code: "usd"
            })
        })

        if (response.ok) {
            const data = await response.json()
            logger.info(`Found ${data.length} options from ShipRank:`)

            if (Array.isArray(data)) {
                data.forEach(opt => {
                    logger.info(`- [${opt.id}] ${opt.name} (Price: ${opt.data?.display_price || opt.amount})`)
                })
            }
        } else {
            logger.error(`Failed to fetch options: ${response.status} ${response.statusText}`)
            const text = await response.text()
            logger.error(`Response: ${text}`)
        }
    } catch (e) {
        logger.error(`Error fetching options: ${e.message}`)
    }

    logger.info("--- End Discovery ---")
}
