"use client"

import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import Radio from "@modules/common/components/radio"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { setShipRankCarrier, setShippingMethod } from "@lib/data/cart"
import { getShipRankCarrier } from "@lib/util/shiprank"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ShipRankOption = {
  id: string
  name: string
  amount: number
  currency_code: string
  estimated_days_min: number
  estimated_days_max: number
}

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
// Use public shipping-rates endpoint (no auth required)
const SHIPPING_RATES_URL = `${BACKEND_URL}/shipping-rates`

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shipRankOptions, setShipRankOptions] = useState<ShipRankOption[]>([])
  const [loadingRates, setLoadingRates] = useState(false)
  const [selectedCarrier, setSelectedCarrier] = useState<ShipRankOption | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  // Calculate cart weight
  const cartWeight = cart.items?.reduce((acc, item) => {
    const weight = (item.variant as any)?.weight || 0
    return acc + weight * item.quantity
  }, 0) || 1000

  // Load saved carrier from cart metadata on mount
  // Also ensure Medusa shipping method is set if we have a ShipRank carrier but no shipping method
  useEffect(() => {
    const savedCarrier = getShipRankCarrier(cart)
    if (savedCarrier) {
      setSelectedCarrier(savedCarrier)
      
      // Auto-set Medusa shipping method if not already set
      if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
        const autoSetShippingMethod = async () => {
          try {
            const response = await fetch(
              `${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`,
              {
                headers: {
                  "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
                },
              }
            )
            const data = await response.json()
            if (data.shipping_options && data.shipping_options.length > 0) {
              await setShippingMethod({ 
                cartId: cart.id, 
                shippingMethodId: data.shipping_options[0].id 
              })
            }
          } catch (err) {
            console.error("Failed to auto-set shipping method:", err)
          }
        }
        autoSetShippingMethod()
      }
    }
  }, [cart])

  // Fetch ShipRank options when delivery step is open
  useEffect(() => {
    if (isOpen) {
      fetchShipRankOptions()
    }
  }, [isOpen, cartWeight])

  const fetchShipRankOptions = async () => {
    setLoadingRates(true)
    try {
      const params = new URLSearchParams({
        weight: cartWeight.toString(),
        currency_code: cart.currency_code || "usd",
        destination_country: cart.shipping_address?.country_code || "ZW",
      })

      const response = await fetch(`${SHIPPING_RATES_URL}?${params}`)
      const data = await response.json()
      
      if (data.success && data.options) {
        setShipRankOptions(data.options)
      }
    } catch (err) {
      console.error("Failed to fetch shipping rates:", err)
    } finally {
      setLoadingRates(false)
    }
  }

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = async () => {
    // Ensure carrier is saved to cart metadata before proceeding
    if (selectedCarrier) {
      setIsLoading(true)
      try {
        await setShipRankCarrier(selectedCarrier)
      } catch (err: any) {
        setError(err.message)
        setIsLoading(false)
        return
      }
      setIsLoading(false)
    }
    router.push(pathname + "?step=payment", { scroll: false })
  }

  // Get first available Medusa shipping method for checkout requirement
  const defaultMedusaMethod = availableShippingMethods?.[0]

  // Select a ShipRank carrier and save to cart metadata
  const selectCarrier = async (carrierId: string) => {
    const carrier = shipRankOptions.find(opt => opt.id === carrierId)
    if (!carrier) return

    setSelectedCarrier(carrier)
    setIsLoading(true)
    setError(null)
    
    try {
      // Save to cart metadata (server-side)
      await setShipRankCarrier(carrier)
      
      // Also set a Medusa shipping method if available (required for order completion)
      // This uses a placeholder method while the actual carrier info is in metadata
      let methodToSet = defaultMedusaMethod
      
      // If no method available from props, try to fetch directly
      if (!methodToSet) {
        try {
          const response = await fetch(
            `${BACKEND_URL}/store/shipping-options?cart_id=${cart.id}`,
            {
              headers: {
                "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
              },
            }
          )
          const data = await response.json()
          if (data.shipping_options && data.shipping_options.length > 0) {
            methodToSet = data.shipping_options[0]
          }
        } catch (fetchErr) {
          console.error("Failed to fetch shipping options:", fetchErr)
        }
      }
      
      if (methodToSet) {
        await setShippingMethod({ 
          cartId: cart.id, 
          shippingMethodId: methodToSet.id 
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Format delivery time
  const formatDeliveryTime = (min: number, max: number) => {
    if (min === 0 && max === 0) return "Contact for estimate"
    if (min === max) return `${min} days`
    return `${min}-${max} days`
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !selectedCarrier,
            }
          )}
        >
          Delivery
          {!isOpen && selectedCarrier && (
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

          {/* Loading state */}
          {loadingRates && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <Text className="ml-3 text-ui-fg-subtle">Loading shipping options...</Text>
            </div>
          )}

          {/* ShipRank Options */}
          {!loadingRates && shipRankOptions.length > 0 && (
            <div className="pb-8">
              <Text className="txt-medium-plus text-ui-fg-base mb-3">
                Select your preferred shipping carrier ({shipRankOptions.length} available)
              </Text>
              <RadioGroup value={selectedCarrier?.id || ""} onChange={selectCarrier}>
                {shipRankOptions.map((option) => {
                  const isSelected = selectedCarrier?.id === option.id
                  return (
                    <RadioGroup.Option
                      key={option.id}
                      value={option.id}
                      data-testid="delivery-option-radio"
                      className={clx(
                        "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-lg px-4 mb-2 hover:border-amber-400 hover:bg-amber-50/50 transition-all",
                        {
                          "border-amber-500 bg-amber-50": isSelected,
                          "border-gray-200": !isSelected,
                        }
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <Radio checked={isSelected} />
                        <div className="flex flex-col">
                          <span className="text-base-regular font-medium">{option.name}</span>
                          <span className="text-xs text-ui-fg-subtle">
                            🚚 {formatDeliveryTime(option.estimated_days_min, option.estimated_days_max)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-ui-fg-base font-semibold">
                          {option.amount === 0 ? (
                            <span className="text-green-600">Contact for price</span>
                          ) : (
                            convertToLocale({
                              amount: option.amount,
                              currency_code: option.currency_code || cart?.currency_code,
                            })
                          )}
                        </span>
                        <span className="text-xs text-amber-600">Pay on Collection</span>
                      </div>
                    </RadioGroup.Option>
                  )
                })}
              </RadioGroup>
            </div>
          )}

          {/* No shipping options available */}
          {!loadingRates && shipRankOptions.length === 0 && (
            <div className="py-8 text-center">
              <Text className="text-ui-fg-subtle">
                No shipping options available for your location. Please contact support.
              </Text>
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
            disabled={!selectedCarrier && shipRankOptions.length > 0}
            data-testid="submit-delivery-option-button"
          >
            Continue to payment
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-small-regular">
            {/* Show selected carrier */}
            {selectedCarrier && (
              <div className="flex flex-col w-full">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Selected Carrier
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {selectedCarrier.name} - {formatDeliveryTime(selectedCarrier.estimated_days_min, selectedCarrier.estimated_days_max)}
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {selectedCarrier.amount === 0 ? (
                    "Contact for price"
                  ) : (
                    convertToLocale({
                      amount: selectedCarrier.amount,
                      currency_code: selectedCarrier.currency_code || cart?.currency_code,
                    })
                  )}
                  <span className="text-amber-600 ml-2">(Pay on Collection)</span>
                </Text>
              </div>
            )}
            {/* No carrier selected */}
            {!selectedCarrier && (
              <div className="flex flex-col w-full">
                <Text className="txt-medium text-ui-fg-subtle">
                  No shipping carrier selected
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
