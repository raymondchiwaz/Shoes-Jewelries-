import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const SHIPRANK_API_URL = "https://www.shiprank.info/api/calculate"

interface ShipRankOption {
  id: string
  name: string
  amount: number
  currency_code: string
  data?: {
    estimated_days_min?: number
    estimated_days_max?: number
  }
}

/**
 * GET /store/custom/shipping-rates
 * 
 * Fetches live shipping rates from ShipRank API based on cart weight.
 * 
 * Query params:
 * - cart_id: The cart ID to calculate shipping for
 * - weight: Optional manual weight in grams (defaults to calculated from cart items)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const cartId = req.query.cart_id as string
  const manualWeight = req.query.weight ? parseInt(req.query.weight as string) : null

  let weight = manualWeight || 1000 // Default 1kg if no weight provided
  let currencyCode = "usd"

  // If cart_id provided, calculate weight from cart items
  if (cartId) {
    try {
      const { data: [cart] } = await query.graph({
        entity: "cart",
        filters: { id: cartId },
        fields: [
          "id",
          "currency_code",
          "items.id",
          "items.quantity",
          "items.variant.weight",
        ]
      })

      if (cart) {
        currencyCode = cart.currency_code || "usd"

        // Calculate total weight from cart items
        const items = cart.items || []
        const totalWeight = items.reduce((acc: number, item: any) => {
          const itemWeight = item.variant?.weight || 0
          return acc + (itemWeight * item.quantity)
        }, 0)

        // Use calculated weight if > 0, otherwise default to 500g
        weight = totalWeight > 0 ? totalWeight : 500
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    }
  }

  try {
    const response = await fetch(SHIPRANK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        weight,
        currency_code: currencyCode
      })
    })

    if (!response.ok) {
      return res.status(500).json({
        error: "Failed to fetch shipping rates from ShipRank",
        details: await response.text()
      })
    }

    const shipRankOptions: ShipRankOption[] = await response.json()

    // Calculate weight in kg for rate display
    const weightInKg = weight / 1000

    // Transform to a cleaner format for the frontend
    // Note: ShipRank API returns calculated total price in data.display_price (in cents)
    // We divide by weight to get the per-kg rate
    const shippingRates = shipRankOptions
      .map(opt => {
        // Total calculated price is in data.display_price (cents)
        const totalPriceInCents = (opt.data as any)?.display_price || opt.amount || 0
        // Calculate the per-kg rate
        const pricePerKgInCents = weightInKg > 0 ? Math.round(totalPriceInCents / weightInKg) : totalPriceInCents
        return {
          id: opt.id,
          name: opt.name,
          amount: pricePerKgInCents, // Amount per kg in cents
          amount_formatted: `$${(pricePerKgInCents / 100).toFixed(2)}/kg`, // Formatted as price per kg
          currency_code: opt.currency_code,
          estimated_days: opt.data?.estimated_days_min && opt.data?.estimated_days_max
            ? opt.data.estimated_days_min === opt.data.estimated_days_max
              ? `${opt.data.estimated_days_min} days`
              : `${opt.data.estimated_days_min}-${opt.data.estimated_days_max} days`
            : null,
          provider: "shiprank"
        }
      })
      .filter(opt => opt.amount > 0) // Filter out options with no price
      .sort((a, b) => a.amount - b.amount) // Sort by price, cheapest first

    return res.json({
      shipping_rates: shippingRates,
      cart_weight_grams: weight,
      currency_code: currencyCode,
      count: shippingRates.length
    })

  } catch (error: any) {
    console.error("ShipRank API error:", error)
    return res.status(500).json({
      error: "Failed to connect to ShipRank API",
      message: error.message
    })
  }
}
