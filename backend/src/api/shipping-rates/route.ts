import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

// ShipRank API configuration
const SHIPRANK_API_URL = process.env.SHIPRANK_API_URL || "https://www.shiprank.info"
const SHIPRANK_API_KEY = process.env.SHIPRANK_API_KEY || "sk_medusa_8ef7e501f71a4d1839345ab26f22536d832433c6bc961201"

/**
 * GET /shipping-rates
 * 
 * Public API endpoint to fetch shipping rates from ShipRank API.
 * No authentication required.
 * 
 * Query params:
 *   - weight: Total weight in grams (default: 1000)
 *   - currency_code: Currency code (default: usd)
 *   - origin_country: Origin country code (default: CN for China)
 *   - destination_country: Destination country code (default: ZW for Zimbabwe)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // Set CORS headers for storefront access
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  try {
    const weight = parseInt(req.query.weight as string) || 1000
    const currency_code = (req.query.currency_code as string) || "usd"
    const origin_country = (req.query.origin_country as string) || "CN"
    const destination_country = (req.query.destination_country as string) || "ZW"

    console.log(`[ShipRank API] Fetching rates for weight: ${weight}g, currency: ${currency_code}, destination: ${destination_country}`)

    const response = await fetch(`${SHIPRANK_API_URL}/api/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SHIPRANK_API_KEY,
        "Authorization": `Bearer ${SHIPRANK_API_KEY}`,
      },
      body: JSON.stringify({
        weight,
        currency_code,
        origin_country,
        destination_country
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[ShipRank API] Error: ${response.status} - ${errorText}`)

      // Return fallback options
      return res.json({
        success: true,
        options: getFallbackOptions(weight, currency_code),
        is_fallback: true,
        message: "Using fallback shipping options"
      })
    }

    const data = await response.json()

    // Normalize and sort by price - ShipRank returns prices in data.display_price
    const options = Array.isArray(data)
      ? data.map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        amount: opt.data?.display_price || opt.amount || 0,
        currency_code: opt.currency_code || currency_code,
        estimated_days_min: opt.data?.estimated_days_min || opt.estimated_days_min || 0,
        estimated_days_max: opt.data?.estimated_days_max || opt.estimated_days_max || 0,
      }))
        .filter((opt: any) => opt.amount > 0)
        .sort((a: any, b: any) => a.amount - b.amount)
      : getFallbackOptions(weight, currency_code)

    console.log(`[ShipRank API] Successfully loaded ${options.length} shipping options`)

    return res.json({
      success: true,
      options,
      total_count: options.length
    })
  } catch (error: any) {
    console.error("[ShipRank API] Error:", error)

    const weight = parseInt(req.query.weight as string) || 1000
    const currency_code = (req.query.currency_code as string) || "usd"

    return res.json({
      success: true,
      options: getFallbackOptions(weight, currency_code),
      is_fallback: true,
      message: `ShipRank API error: ${error.message}`
    })
  }
}

// Handle OPTIONS for CORS preflight
export const OPTIONS = async (req: MedusaRequest, res: MedusaResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  return res.status(204).send("")
}

function getFallbackOptions(weight: number, currencyCode: string) {
  // Weight-based pricing: base + $0.50 per 100g
  const weightMultiplier = Math.ceil(weight / 100) * 50

  return [
    {
      id: "standard-shipping",
      name: "Standard Shipping",
      amount: 1500 + weightMultiplier,
      currency_code: currencyCode,
      estimated_days_min: 7,
      estimated_days_max: 14,
    },
    {
      id: "express-shipping",
      name: "Express Shipping",
      amount: 3000 + weightMultiplier,
      currency_code: currencyCode,
      estimated_days_min: 3,
      estimated_days_max: 5,
    },
    {
      id: "economy-shipping",
      name: "Economy Shipping",
      amount: 800 + weightMultiplier,
      currency_code: currencyCode,
      estimated_days_min: 14,
      estimated_days_max: 21,
    }
  ]
}

