import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import ExternalShippingProviderService from "../modules/external-shipping-provider/service"

export default async function testCalculatePrice({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    logger.info("--- Testing Calculate Price ---")

    const service = new ExternalShippingProviderService({}, {
        apiUrl: "https://www.shiprank.info",
        apiKey: "",
        supabaseAnonKey: ""
    })

    const optionData = {
        id: "14218dac-8024-442f-9046-6a6fdbf62100", // A known ID from previous check
        name: "Macrotop - 14-Day Air Cargo via Hong Kong (Duty Excluded)"
    }

    const data = {
        id: "14218dac-8024-442f-9046-6a6fdbf62100"
    }

    const context = {
        cart: {
            currency_code: "usd",
            items: [
                {
                    quantity: 1,
                    variant: {
                        weight: 1000 // 1kg
                    }
                }
            ]
        }
    }

    try {
        const price = await service.calculatePrice(optionData, data, context)
        logger.info(`Calculated Price: ${JSON.stringify(price)}`)
    } catch (e) {
        logger.error(`Error: ${e.message}`)
    }

    logger.info("--- End Test ---")
}
