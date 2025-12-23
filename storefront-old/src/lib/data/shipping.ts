"use server"

import { cache } from "react"

export type ShipRankShippingOption = {
  id: string
  name: string
  amount: number
  currency_code: string
  estimated_days_min: number
  estimated_days_max: number
}

export type ShippingRatesResponse = {
  success: boolean
  options: ShipRankShippingOption[]
  is_fallback?: boolean
  message?: string
  total_count?: number
}

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

/**
 * Fetch shipping rates from ShipRank API via backend
 */
export const getShippingRates = cache(async function (
  weight: number,
  currencyCode: string = "usd",
  destinationCountry: string = "ZW"
): Promise<ShippingRatesResponse> {
  try {
    const params = new URLSearchParams({
      weight: weight.toString(),
      currency_code: currencyCode,
      destination_country: destinationCountry,
    })

    const response = await fetch(`${BACKEND_URL}/store/shipping-rates?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch shipping rates: ${response.statusText}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error fetching shipping rates:", error)
    return {
      success: false,
      options: [],
      message: error.message,
    }
  }
})

/**
 * Calculate total weight of cart items in grams
 */
export function calculateCartWeight(items: any[]): number {
  if (!items || items.length === 0) return 1000 // Default 1kg

  const totalWeight = items.reduce((acc: number, item: any) => {
    // Weight is usually in grams in Medusa
    const weight = item.variant?.weight || 0
    return acc + weight * item.quantity
  }, 0)

  // Return at least 100g
  return totalWeight > 0 ? totalWeight : 1000
}

