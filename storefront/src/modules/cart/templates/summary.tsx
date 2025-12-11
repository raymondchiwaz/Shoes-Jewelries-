"use client"

import React from "react"
import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  
  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <div className="space-y-3">
        <LocalizedClientLink
          href="/checkout/whatsapp"
          className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16.5 14.5c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6 0-.3-.2-1.3-.5-2.5-1.7-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.1-.7.1-.2.3-.5.5-.7.2-.2.2-.4.3-.6.1-.2 0-.5-.1-.7-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5H6.5c-.2 0-.5.2-.7.4-.7.7-1.1 1.7-1.1 2.7 0 .9.3 1.8.8 2.6 0 0 2.5 4 6.3 5.6 3.8 1.6 3.8 1.1 4.5 1 .7-.1 2.3-.9 2.6-1.8.3-.9.3-1.7.2-1.8-.1-.1-.4-.2-.6-.3z"></path>
          </svg>
          Complete Order via WhatsApp
        </LocalizedClientLink>
        <button
          disabled
          className="w-full bg-grey-20 text-grey-40 px-6 py-4 rounded-lg font-semibold cursor-not-allowed relative"
          data-testid="checkout-button"
          title="Checkout (Coming Soon)"
        >
          Checkout (Coming Soon)
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            Soon
          </span>
        </button>
      </div>
    </div>
  )
}

export default Summary
