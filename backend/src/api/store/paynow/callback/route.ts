import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Paynow } from "paynow"
import { BACKEND_URL } from "../../../../lib/constants"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    const integrationId = process.env.PAYNOW_INTEGRATION_ID
    const integrationKey = process.env.PAYNOW_INTEGRATION_KEY
    
    if (!integrationId || !integrationKey) {
        return res.status(500).json({ error: "Paynow not configured" })
    }
    
    const paynow = new Paynow(integrationId, integrationKey)
    
    const { pollurl } = req.body as any
    
    if (!pollurl) {
        return res.status(400).json({ error: "Missing pollurl" })
    }
    
    try {
        const status = await paynow.pollTransaction(pollurl)
        
        if (status.paid()) {
            const cartId = status.reference
            
            const completeResp = await fetch(`${BACKEND_URL}/store/carts/${cartId}/complete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            
            if (completeResp.ok) {
                return res.status(200).send("Ok")
            } else {
                console.error("Failed to complete cart", await completeResp.text())
                return res.status(500).send("Failed to complete cart")
            }
        } else {
            return res.status(200).send("Ok")
        }
    } catch (error) {
        console.error("Paynow callback error", error)
        return res.status(500).send("Error")
    }
}
