"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"

export default function ProductActions({
    product,
    region,
}: {
    product: HttpTypes.StoreProduct
    region: HttpTypes.StoreRegion
}) {
    const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] ?? null)
    const [paymentOption, setPaymentOption] = useState<"full" | "deposit">("full")

    const fullPrice = (selectedVariant?.calculated_price?.calculated_amount || 0) / 100
    const vipPrice = fullPrice * 0.88 // 12% off
    const depositAmount = fullPrice * 0.3 // 30% deposit

    return (
        <div className="space-y-6">
            {/* Size/Variant Selection */}
            {product.variants && product.variants.length > 1 && (
                <div>
                    <label className="block text-sm font-semibold text-grey-90 mb-3">
                        Select Size
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {product.variants?.map((variant) => (
                            <button
                                key={variant.id}
                                onClick={() => setSelectedVariant(variant)}
                                className={`px-4 py-3 border-2 rounded-lg text-sm font-semibold transition-all ${selectedVariant?.id === variant.id
                                        ? "border-grey-90 bg-grey-90 text-white"
                                        : "border-grey-20 hover:border-grey-40"
                                    }`}
                            >
                                {variant.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment Options */}
            <div>
                <label className="block text-sm font-semibold text-grey-90 mb-3">
                    Payment Option
                </label>
                <div className="space-y-3">
                    {/* Full Payment */}
                    <button
                        onClick={() => setPaymentOption("full")}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${paymentOption === "full"
                                ? "border-green-500 bg-green-50"
                                : "border-grey-20 hover:border-grey-40"
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === "full" ? "border-green-500" : "border-grey-30"
                                        }`}>
                                        {paymentOption === "full" && (
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="font-semibold text-grey-90">Full Payment (VIP Discount)</span>
                                </div>
                                <p className="text-sm text-grey-60 ml-7">
                                    Pay ${vipPrice.toFixed(2)} today • Save 12% • Free shipping
                                </p>
                            </div>
                            <span className="text-xl font-bold text-green-600">
                                ${vipPrice.toFixed(2)}
                            </span>
                        </div>
                    </button>

                    {/* Deposit Payment */}
                    <button
                        onClick={() => setPaymentOption("deposit")}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${paymentOption === "deposit"
                                ? "border-blue-500 bg-blue-50"
                                : "border-grey-20 hover:border-grey-40"
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === "deposit" ? "border-blue-500" : "border-grey-30"
                                        }`}>
                                        {paymentOption === "deposit" && (
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="font-semibold text-grey-90">Deposit Payment (30%)</span>
                                </div>
                                <p className="text-sm text-grey-60 ml-7">
                                    Pay ${depositAmount.toFixed(2)} now • Rest on delivery
                                </p>
                            </div>
                            <span className="text-xl font-bold text-blue-600">
                                ${depositAmount.toFixed(2)}
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Add to Cart Button */}
            <button className="w-full bg-grey-90 hover:bg-grey-80 text-white px-8 py-4 rounded-lg font-semibold uppercase tracking-wider transition-all shadow-md hover:shadow-lg">
                {paymentOption === "full" ? "Add to Cart - Full Payment" : "Reserve with Deposit"}
            </button>

            {/* Delivery Estimate */}
            <div className="text-sm text-grey-60 text-center">
                {paymentOption === "full" ? (
                    <p>⚡ VIP Priority Shipping: Arrives in 7 days</p>
                ) : (
                    <p>📦 Standard Shipping: Arrives in 30 days</p>
                )}
            </div>
        </div>
    )
}
