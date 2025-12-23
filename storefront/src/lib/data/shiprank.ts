import { sdk } from "@lib/config"

export interface ShipRankShippingRate {
  id: string
  name: string
  amount: number
  amount_formatted: string
  currency_code: string
  estimated_days: string | null
  provider: string
}

export interface ShipRankRatesResponse {
  shipping_rates: ShipRankShippingRate[]
  cart_weight_grams: number
  currency_code: string
  count: number
}

/**
 * Fetches live shipping rates from ShipRank API via our custom endpoint.
 * These rates are calculated based on the cart's total weight.
 */
export async function getShipRankShippingRates(cartId: string): Promise<ShipRankRatesResponse | null> {
  try {
    const response = await sdk.client.fetch<ShipRankRatesResponse>(
      `/store/custom/shipping-rates`,
      {
        query: { cart_id: cartId },
        cache: "no-store", // Always fetch fresh rates
      }
    )
    return response
  } catch (error) {
    console.error("Failed to fetch ShipRank shipping rates:", error)
    return null
  }
}
