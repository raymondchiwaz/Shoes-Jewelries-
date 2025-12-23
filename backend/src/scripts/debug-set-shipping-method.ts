import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { setShippingMethodsOnCartWorkflow } from "@medusajs/medusa/core-flows"

export default async function debugSetShippingMethod({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const cartModuleService = container.resolve(Modules.CART)
    const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

    logger.info("--- Debugging Shipping Method Selection ---")

    // 1. Get Latest Cart
    const [carts] = await cartModuleService.listAndCountCarts({}, {
        order: { created_at: "DESC" },
        take: 1,
        relations: ["shipping_address"]
    })

    if (carts.length === 0) {
        logger.info("No carts found.")
        return
    }

    const cart = carts[0]
    logger.info(`Cart ID: ${cart.id}`)
    logger.info(`Shipping Address Country: ${cart.shipping_address?.country_code}`)

    // 2. List Shipping Options for this Cart
    // We need to simulate what the storefront does: list-shipping-options
    // But here we can just list all options and try to match one
    const options = await fulfillmentModuleService.listShippingOptions({
        provider_id: "external-shipping_external-shipping"
    })

    if (options.length === 0) {
        logger.warn("No external shipping options found in DB.")
        return
    }

    const optionToTest = options[0]
    logger.info(`Testing with Option: ${optionToTest.name} (ID: ${optionToTest.id})`)

    // 3. Attempt to Set Shipping Method
    try {
        await setShippingMethodsOnCartWorkflow(container).run({
            input: {
                cart_id: cart.id,
                shipping_methods: [
                    {
                        shipping_option_id: optionToTest.id,
                    }
                ]
            }
        })
        logger.info("Successfully set shipping method!")
    } catch (e) {
        logger.error(`Failed to set shipping method: ${e.message}`)
        logger.error(JSON.stringify(e, null, 2))
    }

    logger.info("--- End Debug ---")
}
