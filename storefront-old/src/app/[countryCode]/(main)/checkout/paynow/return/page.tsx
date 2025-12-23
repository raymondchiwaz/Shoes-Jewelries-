"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Heading, Text, Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function PaynowReturnPage() {
  const searchParams = useSearchParams()
  const cartId = searchParams.get("cart_id")
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")

  useEffect(() => {
    if (!cartId) {
      setStatus("failed")
      return
    }
    // Assume success for now as we rely on webhook
    setStatus("success")
  }, [cartId])

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Heading level="h1">Processing Payment...</Heading>
        <Text>Please wait while we confirm your payment.</Text>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Heading level="h1" className="text-rose-500">Payment Failed</Heading>
        <Text>Something went wrong with your payment.</Text>
        <LocalizedClientLink href="/cart">
          <Button>Return to Cart</Button>
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Heading level="h1" className="text-green-500">Payment Successful!</Heading>
      <Text>Thank you for your order.</Text>
      <LocalizedClientLink href="/account/orders">
        <Button>View Orders</Button>
      </LocalizedClientLink>
    </div>
  )
}
