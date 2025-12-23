"use client"

import { Heading, Text, clx } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"
import { getShipRankCarrier } from "@lib/util/shiprank"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  // Check for ShipRank carrier selection in cart metadata
  const hasShipRankCarrier = !!getShipRankCarrier(cart)
  
  // Previous steps are completed if we have address, shipping carrier (ShipRank), and payment
  const previousStepsCompleted =
    cart.shipping_address &&
    (hasShipRankCarrier || cart.shipping_methods?.length > 0) &&
    (cart.payment_collection || paidByGiftcard)

  // Get selected carrier for display
  const selectedCarrier = getShipRankCarrier(cart)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Review
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          {/* Show selected shipping carrier */}
          {selectedCarrier && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <Text className="txt-medium-plus text-amber-800 font-semibold mb-1">
                📦 Selected Shipping Carrier
              </Text>
              <Text className="txt-medium text-amber-700">
                {selectedCarrier.name}
              </Text>
              <Text className="txt-small text-amber-600">
                Delivery: {selectedCarrier.estimated_days_min === selectedCarrier.estimated_days_max 
                  ? `${selectedCarrier.estimated_days_min} days`
                  : `${selectedCarrier.estimated_days_min}-${selectedCarrier.estimated_days_max} days`
                } • Pay on Collection
              </Text>
            </div>
          )}
          
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Medusa
                Store&apos;s Privacy Policy.
              </Text>
            </div>
          </div>
          <div className="flex gap-4">
            <PaymentButton cart={cart} data-testid="submit-order-button" />
          </div>
        </>
      )}
    </div>
  )
}

export default Review
