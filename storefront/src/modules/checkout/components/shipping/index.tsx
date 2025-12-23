"use client"

import { CheckCircleSolid, ChevronDown } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import Divider from "@modules/common/components/divider"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useState, useMemo, useCallback, useEffect } from "react"
import { setShippingMethod } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const getCompanyName = (name: string): string => name.split(" - ")[0] || name
const getServiceName = (name: string): string => name.split(" - ").slice(1).join(" - ") || name

const Shipping: React.FC<ShippingProps> = ({ cart, availableShippingMethods }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track LOCAL selection (this is the source of truth for the UI)
  const [localSelectedId, setLocalSelectedId] = useState<string>("")
  const [isInitialized, setIsInitialized] = useState(false)

  const [expandedCompanies, setExpandedCompanies] = useState<string[]>([])

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const isOpen = searchParams.get("step") === "shipping"

  // Initialize from cart ONLY on first render
  useEffect(() => {
    if (!isInitialized) {
      const cartOption = cart.shipping_methods?.at(-1)?.shipping_option_id || ""
      setLocalSelectedId(cartOption)
      setIsInitialized(true)

      // Auto-expand the company of the current selection
      if (cartOption && availableShippingMethods) {
        const opt = availableShippingMethods.find(o => o.id === cartOption)
        if (opt) {
          setExpandedCompanies([getCompanyName(opt.name)])
        }
      }
    }
  }, [cart.shipping_methods, availableShippingMethods, isInitialized])

  // Group by company
  const grouped = useMemo(() => {
    if (!availableShippingMethods) return {} as Record<string, HttpTypes.StoreCartShippingOption[]>
    return availableShippingMethods.reduce((acc, opt) => {
      const company = getCompanyName(opt.name)
      if (!acc[company]) acc[company] = []
      acc[company].push(opt)
      return acc
    }, {} as Record<string, HttpTypes.StoreCartShippingOption[]>)
  }, [availableShippingMethods])

  const toggleCompany = useCallback((company: string) => {
    setExpandedCompanies(prev =>
      prev.includes(company) ? prev.filter(c => c !== company) : [...prev, company]
    )
  }, [])

  const handleSelectOption = useCallback(async (optionId: string) => {
    if (isLoading) return
    if (optionId === localSelectedId) return

    const prevId = localSelectedId

    console.log("=== Selecting shipping option ===")
    console.log("Option ID:", optionId)
    console.log("Cart ID:", cart.id)

    // Update UI immediately
    setLocalSelectedId(optionId)
    setIsLoading(true)
    setError(null)

    // Expand the company of the new selection
    const opt = availableShippingMethods?.find(o => o.id === optionId)
    if (opt) {
      const company = getCompanyName(opt.name)
      setExpandedCompanies(prev => prev.includes(company) ? prev : [...prev, company])
    }

    try {
      await setShippingMethod({ cartId: cart.id, shippingMethodId: optionId })
      console.log("=== Shipping method set successfully ===")

      // DON'T call router.refresh() - it resets the UI
      // The cart will update on the next navigation
    } catch (e: any) {
      console.error("=== Failed to set shipping method ===", e)
      setError(e.message || "Failed to set shipping method. Please try again.")
      // Revert to previous selection
      setLocalSelectedId(prevId)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, localSelectedId, cart.id, availableShippingMethods])

  const handleContinue = useCallback(async () => {
    if (!localSelectedId) {
      setError("Please select a shipping method")
      return
    }

    // Make sure selection is saved before continuing
    setIsLoading(true)
    try {
      // Ensure the current selection is set
      await setShippingMethod({ cartId: cart.id, shippingMethodId: localSelectedId })
      router.push(pathname + "?step=payment", { scroll: false })
    } catch (e: any) {
      setError(e.message || "Failed to save shipping method")
    } finally {
      setIsLoading(false)
    }
  }, [localSelectedId, cart.id, router, pathname])

  const formatRate = (rate: number) => "$" + (rate / 100).toFixed(2) + "/kg"

  const companies = Object.keys(grouped).sort()
  const selectedOpt = availableShippingMethods?.find(o => o.id === localSelectedId)

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mb-6">
        <Heading level="h2" className={clx("flex items-center gap-2 text-3xl-regular", {
          "opacity-50": !isOpen && !localSelectedId
        })}>
          Delivery
          {!isOpen && localSelectedId && <CheckCircleSolid />}
        </Heading>
        {!isOpen && cart?.email && (
          <button
            onClick={() => router.push(pathname + "?step=shipping")}
            className="text-blue-600 hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {isOpen ? (
        <div>
          <div className="space-y-2 pb-6">
            {companies.length === 0 && (
              <Text className="text-gray-500">No shipping options available.</Text>
            )}
            {companies.map(company => {
              const opts = grouped[company]
              const isExpanded = expandedCompanies.includes(company)
              const hasSelectedOption = opts.some(o => o.id === localSelectedId)
              const minRate = Math.min(...opts.map(o => (o.data as any)?.rate || 0))

              return (
                <div
                  key={company}
                  className={clx(
                    "border rounded-lg overflow-hidden transition-colors",
                    hasSelectedOption ? "border-blue-500 bg-blue-50/50" : "border-gray-200"
                  )}
                >
                  {/* Company Header */}
                  <button
                    type="button"
                    onClick={() => toggleCompany(company)}
                    className={clx(
                      "w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors",
                      hasSelectedOption && "bg-blue-50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{company}</span>
                      <span className="text-sm text-gray-500">({opts.length})</span>
                      {hasSelectedOption && <CheckCircleSolid className="text-green-600 w-4 h-4" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">From {formatRate(minRate)}</span>
                      <ChevronDown className={clx("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                    </div>
                  </button>

                  {/* Options */}
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {opts.map(opt => {
                        const rate = (opt.data as any)?.rate || 0
                        const isSelected = opt.id === localSelectedId

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleSelectOption(opt.id)}
                            className={clx(
                              "w-full flex items-center justify-between p-3 px-6 text-left border-b last:border-b-0 transition-all",
                              isSelected ? "bg-blue-100" : "hover:bg-gray-50",
                              isLoading && "opacity-50 cursor-wait"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {/* Radio */}
                              <div
                                className={clx(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                  isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
                                )}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span className={clx("text-sm", isSelected && "font-medium")}>
                                {getServiceName(opt.name)}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-sm text-gray-700 font-medium">{formatRate(rate)}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <ErrorMessage error={error} />

          <Button
            size="large"
            onClick={handleContinue}
            isLoading={isLoading}
            disabled={!localSelectedId || isLoading}
          >
            Continue to payment
          </Button>
        </div>
      ) : (
        localSelectedId && selectedOpt && (
          <div className="space-y-1">
            <Text className="text-sm text-gray-500">Shipping method</Text>
            <Text className="text-gray-900">{selectedOpt.name}</Text>
            <Text className="text-sm text-gray-500">{formatRate((selectedOpt.data as any)?.rate || 0)}</Text>
          </div>
        )
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping
