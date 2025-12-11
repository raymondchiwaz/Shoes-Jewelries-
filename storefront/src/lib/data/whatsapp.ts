"use server"

import { getAuthHeaders, getCartId } from "./cookies"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function whatsappCheckout({
  payment_method,
  whatsapp_recipient,
  complete = true,
}: {
  payment_method: "cash" | "alipay"
  whatsapp_recipient: "RAY" | "VAL"
  complete?: boolean
}): Promise<{ orderId?: string | null; whatsappLink?: string }>
{
  const cartId = getCartId()
  if (!cartId) {
    throw new Error("No existing cart found")
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...getAuthHeaders(),
  } as any

  const resp = await fetch(`${MEDUSA_BACKEND_URL}/store/whatsapp-checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify({ cart_id: cartId, payment_method, whatsapp_recipient, complete }),
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(text || "Failed to process WhatsApp checkout")
  }

  return await resp.json()
}

