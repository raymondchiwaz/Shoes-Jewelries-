import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Paynow } from "paynow"
import { BACKEND_URL } from "../../../lib/constants"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { cart_id, email } = req.body as any

  console.log("Paynow request received", { cart_id, email })

  if (!cart_id || !email) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    // Fetch cart to get the total amount
    const cartResp = await fetch(`${BACKEND_URL}/store/carts/${cart_id}?fields=+total`, {
        headers: {
            "x-publishable-api-key": req.headers["x-publishable-api-key"] as string || "",
            "Content-Type": "application/json"
        }
    })
    
    if (!cartResp.ok) {
        return res.status(404).json({ error: "Cart not found" })
    }
    
    const { cart: storeCart } = await cartResp.json()
    const amount = storeCart.total // This is in cents
    
    const integrationId = process.env.PAYNOW_INTEGRATION_ID
    const integrationKey = process.env.PAYNOW_INTEGRATION_KEY

    if (!integrationId || !integrationKey) {
        return res.status(500).json({ error: "Paynow not configured" })
    }

    const paynow = new Paynow(integrationId, integrationKey)

    paynow.resultUrl = `${BACKEND_URL}/store/paynow/callback`
    // Use the origin from the request as the return URL base, or fallback to a default
    const returnBaseUrl = req.headers.origin || "http://localhost:8000"
    paynow.returnUrl = `${returnBaseUrl}/checkout/paynow/return?cart_id=${cart_id}`

    const payment = paynow.createPayment(cart_id, email)
    payment.add(`Order ${cart_id}`, amount / 100)

    const response = await paynow.send(payment)
    console.log("Paynow response", response)
    if (response.success) {
        return res.json({ redirectUrl: response.redirectUrl, pollUrl: response.pollUrl })
    } else {
        return res.status(400).json({ error: response.error })
    }

  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
