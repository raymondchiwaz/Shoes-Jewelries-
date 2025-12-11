import { NextResponse } from "next/server"
import { getAuthHeaders, getCartId } from "@lib/data/cookies"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cartId = getCartId()
    if (!cartId) {
      return NextResponse.json({ error: "No existing cart found" }, { status: 400 })
    }

    const headers: Record<string, string> = {
      "content-type": "application/json",
      ...(getAuthHeaders() as any),
    }

    const resp = await fetch(`${MEDUSA_BACKEND_URL}/store/whatsapp-checkout`, {
      method: "POST",
      headers,
      body: JSON.stringify({ cart_id: cartId, ...body }),
    })

    const text = await resp.text()
    return new NextResponse(text, {
      status: resp.status,
      headers: { "content-type": "application/json" },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 })
  }
}

