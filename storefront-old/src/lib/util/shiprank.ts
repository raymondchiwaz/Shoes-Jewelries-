import { HttpTypes } from "@medusajs/types"

export type ShipRankCarrier = {
  id: string
  name: string
  amount: number
  currency_code: string
  estimated_days_min: number
  estimated_days_max: number
}

/**
 * Get ShipRank carrier from cart metadata
 */
export function getShipRankCarrier(cart: HttpTypes.StoreCart | null): ShipRankCarrier | null {
  if (!cart?.metadata?.shiprank_carrier) return null
  try {
    return JSON.parse(cart.metadata.shiprank_carrier as string)
  } catch {
    return null
  }
}



