"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { Text, clx } from "@medusajs/ui"
import { getShipRankShippingRates, ShipRankShippingRate } from "@lib/data/shiprank"
import { setShipRankCarrier } from "@lib/data/cart"

type ShippingSelectorProps = {
    cart: HttpTypes.StoreCart
}

const ShippingSelector = ({ cart }: ShippingSelectorProps) => {
    const [rates, setRates] = useState<ShipRankShippingRate[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedId, setSelectedId] = useState<string>("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load saved carrier from cart metadata
    useEffect(() => {
        if (cart?.metadata?.shiprank_carrier) {
            try {
                const saved = JSON.parse(cart.metadata.shiprank_carrier as string)
                if (saved?.id) {
                    setSelectedId(saved.id)
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, [cart?.metadata?.shiprank_carrier])

    // Fetch shipping rates when cart is available
    useEffect(() => {
        if (cart?.id) {
            setLoading(true)
            getShipRankShippingRates(cart.id)
                .then((data) => {
                    if (data?.shipping_rates) {
                        setRates(data.shipping_rates)
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch shipping rates:", err)
                })
                .finally(() => setLoading(false))
        }
    }, [cart?.id])

    const handleSelect = async (rate: ShipRankShippingRate) => {
        setSelectedId(rate.id)
        setSaving(true)
        setError(null)

        try {
            await setShipRankCarrier(rate)
        } catch (err: any) {
            console.error("Failed to save shipping selection:", err)
            setError(err.message || "Failed to save selection")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                <Text className="text-sm font-medium mb-3">Shipping Options</Text>
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
                    <Text className="ml-2 text-sm text-gray-500">Loading shipping rates...</Text>
                </div>
            </div>
        )
    }

    if (rates.length === 0) {
        return null // Don't show anything if no rates available
    }

    return (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <Text className="text-sm font-medium mb-1">Shipping Options</Text>
            <Text className="text-xs text-gray-500 mb-3">
                Select your preferred delivery option (pay on collection)
            </Text>

            {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {rates.map((rate) => (
                    <button
                        key={rate.id}
                        onClick={() => handleSelect(rate)}
                        disabled={saving}
                        className={clx(
                            "w-full p-3 rounded-lg border text-left transition-all",
                            "hover:border-amber-400 hover:bg-amber-50",
                            {
                                "border-amber-500 bg-amber-50": selectedId === rate.id,
                                "border-gray-200 bg-white": selectedId !== rate.id,
                                "opacity-50 cursor-not-allowed": saving,
                            }
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={clx(
                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                        {
                                            "border-amber-500": selectedId === rate.id,
                                            "border-gray-300": selectedId !== rate.id,
                                        }
                                    )}
                                >
                                    {selectedId === rate.id && (
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    )}
                                </div>
                                <div>
                                    <Text className="text-sm font-medium">{rate.name}</Text>
                                    {rate.estimated_days && (
                                        <Text className="text-xs text-gray-500">
                                            Est. delivery: {rate.estimated_days}
                                        </Text>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <Text className="text-sm font-semibold text-amber-700">
                                    {rate.amount_formatted}
                                </Text>
                                <Text className="text-xs text-gray-400">Pay on collection</Text>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {selectedId && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-xs flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Shipping option saved. Pay the courier when you collect your package.
                </div>
            )}
        </div>
    )
}

export default ShippingSelector
