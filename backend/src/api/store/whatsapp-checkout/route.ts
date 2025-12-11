import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { BACKEND_URL, WHATSAPP_RAY_NUMBER, WHATSAPP_VAL_NUMBER } from "../../../lib/constants"

type Body = {
  cart_id: string
  payment_method: "cash" | "alipay"
  whatsapp_recipient: "RAY" | "VAL"
  complete?: boolean
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { cart_id, payment_method, whatsapp_recipient, complete = true } = (req.body || {}) as Body

    if (!cart_id || !payment_method || !whatsapp_recipient) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const auth = req.headers["authorization"] as string | undefined

    const headers: Record<string, string> = {
      "content-type": "application/json",
      ...(auth ? { authorization: auth } : {}),
    }

    const metadata = {
      payment_method,
      whatsapp_recipient,
      timestamp: new Date().toISOString(),
    }

    const updateResp = await fetch(`${BACKEND_URL}/store/carts/${cart_id}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ metadata }),
    })
    if (!updateResp.ok) {
      const t = await updateResp.text()
      return res.status(400).json({ error: t || "Failed to update cart metadata" })
    }

    let orderId: string | null = null
    if (complete) {
      const completeResp = await fetch(`${BACKEND_URL}/store/carts/${cart_id}/complete`, {
        method: "POST",
        headers,
      })
      if (!completeResp.ok) {
        const t = await completeResp.text()
        return res.status(400).json({ error: t || "Failed to complete cart" })
      }
      const completed = await completeResp.json()
      if (completed?.type === "order" && completed?.order?.id) {
        orderId = completed.order.id
      }
    }

    const phone = whatsapp_recipient === "RAY" ? WHATSAPP_RAY_NUMBER : WHATSAPP_VAL_NUMBER
    const number = phone || ""

    const confirmationPath = orderId ? `${BACKEND_URL.replace(/\/$/, "")}/store/orders/${orderId}` : ""
    const text = `Order ${orderId ?? cart_id} — Method: ${payment_method} — Recipient: ${whatsapp_recipient}${confirmationPath ? ` — ${confirmationPath}` : ""}`
    const wa = `https://wa.me/${encodeURIComponent(number)}?text=${encodeURIComponent(text)}`

    return res.status(200).json({ orderId, whatsappLink: wa })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Unknown error" })
  }
}
