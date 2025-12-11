"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function WhatsAppActions({ countryCode }: { countryCode: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<"cash" | "alipay" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (payment_method: "cash" | "alipay", whatsapp_recipient: "RAY" | "VAL") => {
    setLoading(payment_method)
    setError(null)
    try {
      const resp = await fetch("/api/whatsapp-checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ payment_method, whatsapp_recipient, complete: true }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        throw new Error(data?.error || "Failed to start WhatsApp checkout")
      }
      if (data?.whatsappLink) {
        window.open(data.whatsappLink, "_blank")
      }
      if (data?.orderId) {
        router.push(`/${countryCode}/order/confirmed/${data.orderId}`)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="content-container py-12 md:py-16">
      <div className="max-w-2xl">
        <Heading level="h1" className="text-3xl md:text-4xl">Complete Order via WhatsApp</Heading>
        <p className="mt-2 text-ui-fg-subtle">Select a payment contact to continue in WhatsApp.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => run("cash", "RAY")}
            disabled={!!loading}
            className={`block px-6 py-5 rounded-lg border text-center font-semibold transition-colors ${loading === "cash" ? "opacity-50 cursor-wait" : "bg-[#25D366] text-white hover:bg-[#20BD5A]"}`}
          >
            Cash (RAY WhatsApp)
          </button>

          <button
            onClick={() => run("alipay", "VAL")}
            disabled={!!loading}
            className={`block px-6 py-5 rounded-lg border text-center font-semibold transition-colors ${loading === "alipay" ? "opacity-50 cursor-wait" : "bg-[#25D366] text-white hover:bg-[#20BD5A]"}`}
          >
            Alipay (VAL WhatsApp)
          </button>
        </div>

        {error && (
          <p className="mt-4 text-ui-fg-error">{error}</p>
        )}

        <div className="mt-8 flex gap-3">
          <LocalizedClientLink href="/cart" className="border border-ui-fg-muted px-6 py-3 rounded-md font-medium">
            Back to cart
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

