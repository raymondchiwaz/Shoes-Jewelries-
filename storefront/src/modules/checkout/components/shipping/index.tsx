"use client"

import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import Radio from "@modules/common/components/radio"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { setShippingMethod } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { getShipRankShippingRates, ShipRankShippingRate } from "@lib/data/shiprank"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shipRankRates, setShipRankRates] = useState<ShipRankShippingRate[]>([])
  const [loadingRates, setLoadingRates] = useState(false)
  const [selectedShipRankId, setSelectedShipRankId] = useState<string>("")

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  // Find the selected shipping method from Medusa's options
  const selectedShippingMethod = availableShippingMethods?.find(
    (method) => method.id === cart.shipping_methods?.at(-1)?.shipping_option_id
  )

  // Fetch ShipRank rates when the step opens
  useEffect(() => {
    if (isOpen && cart?.id) {
      setLoadingRates(true)
      getShipRankShippingRates(cart.id)
        .then((data) => {
          if (data?.shipping_rates) {
            setShipRankRates(data.shipping_rates)
          }
        })
        .finally(() => setLoadingRates(false))
    }
  }, [isOpen, cart?.id])

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + "?step=payment", { scroll: false })
  }

  // Handle ShipRank rate selection - we need to set the matching Medusa shipping method
  const handleShipRankSelect = async (shipRankId: string) => {
    setSelectedShipRankId(shipRankId)
    setIsLoading(true)
    setError(null)
    
    // Find the Medusa shipping option that matches this ShipRank rate
    // The Medusa shipping options have data.shiprank_id that matches the ShipRank rate id
    const matchingMethod = availableShippingMethods?.find(
      (method) => method.data?.shiprank_id === shipRankId || method.data?.id === shipRankId
    )
    
    const methodToUse = matchingMethod || availableShippingMethods?.[0]
    
    if (methodToUse) {
      try {
        console.log('Setting shipping method:', methodToUse.id, 'for ShipRank rate:', shipRankId)
        await setShippingMethod({ cartId: cart.id, shippingMethodId: methodToUse.id })
        console.log('Shipping method set successfully')
      } catch (err: any) {
        console.error('Failed to set shipping method:', err)
        setError(err.message || "Failed to set shipping method")
      } finally {
        setIsLoading(false)
      }
    } else {
      setError("No shipping methods available. Please try again.")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  // Find the selected ShipRank rate for display
  const selectedRate = shipRankRates.find(r => r.id === selectedShipRankId)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && cart.shipping_methods?.length === 0,
            }
          )}
        >
          Delivery
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircleSolid />
          )}
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Text>
              <button
                onClick={handleEdit}
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="edit-delivery-button"
              >
                Edit
              </button>
            </Text>
          )}
      </div>
      {isOpen ? (
        <div data-testid="delivery-options-container">
          {/* Pay on Collection Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-600 text-lg">📦</span>
              <div>
                <Text className="txt-medium-plus text-amber-800 font-semibold">
                  Pay on Collection
                </Text>
                <Text className="txt-small text-amber-700">
                  Shipping fees are paid directly to the courier when you collect your package.
                </Text>
              </div>
            </div>
          </div>

          {loadingRates ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <Text className="ml-3 text-ui-fg-subtle">Loading shipping rates...</Text>
            </div>
          ) : (
            <div className="pb-8">
              <RadioGroup value={selectedShipRankId} onChange={handleShipRankSelect}>
                {shipRankRates.map((rate) => (
                  <RadioGroup.Option
                    key={rate.id}
                    value={rate.id}
                    data-testid="delivery-option-radio"
                    className={clx(
                      "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-4 mb-2 hover:shadow-borders-interactive-with-active",
                      {
                        "border-ui-border-interactive bg-amber-50":
                          rate.id === selectedShipRankId,
                      }
                    )}
                  >
                    <div className="flex items-center gap-x-4">
                      <Radio checked={rate.id === selectedShipRankId} />
                      <div className="flex flex-col">
                        <span className="text-base-regular font-medium">{rate.name}</span>
                        {rate.estimated_days && (
                          <span className="text-xs text-ui-fg-subtle">
                            Estimated: {rate.estimated_days}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-ui-fg-base font-semibold">
                        {rate.amount_formatted}
                      </span>
                      <span className="text-xs text-amber-600">Pay on Collection</span>
                    </div>
                  </RadioGroup.Option>
                ))}
              </RadioGroup>
              
              {shipRankRates.length === 0 && !loadingRates && (
                <Text className="text-ui-fg-subtle text-center py-4">
                  No shipping options available for your location.
                </Text>
              )}
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!selectedShipRankId}
            data-testid="submit-delivery-option-button"
          >
            Continue to payment
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && selectedRate && (
              <div className="flex flex-col w-full">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Method
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {selectedRate.name} - {selectedRate.amount_formatted}
                  {selectedRate.estimated_days && (
                    <span className="text-ui-fg-muted ml-2">({selectedRate.estimated_days})</span>
                  )}
                  <span className="text-amber-600 ml-2">(Pay on Collection)</span>
                </Text>
              </div>
            )}
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && !selectedRate && selectedShippingMethod && (
              <div className="flex flex-col w-full">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Method
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {selectedShippingMethod.name}
                  <span className="text-amber-600 ml-2">(Pay on Collection)</span>
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
