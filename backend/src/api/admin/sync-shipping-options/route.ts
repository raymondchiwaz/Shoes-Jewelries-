import { MedusaRequest, MedusaResponse } from "@medusajs/framework"

// ShipRank API configuration - these should match your medusa-config.js settings
const SHIPRANK_API_URL = process.env.SHIPRANK_API_URL || "https://www.shiprank.info"
const SHIPRANK_API_KEY = process.env.SHIPRANK_API_KEY || "sk_medusa_8ef7e501f71a4d1839345ab26f22536d832433c6bc961201"

// Fallback options when API is unavailable
const FALLBACK_OPTIONS = [
  {
    id: "standard-shipping",
    name: "Standard Shipping",
    amount: 1500,
    currency_code: "usd",
    data: { estimated_days_min: 5, estimated_days_max: 7 }
  },
  {
    id: "express-shipping",
    name: "Express Shipping",
    amount: 3000,
    currency_code: "usd",
    data: { estimated_days_min: 2, estimated_days_max: 3 }
  },
  {
    id: "economy-shipping",
    name: "Economy Shipping",
    amount: 800,
    currency_code: "usd",
    data: { estimated_days_min: 7, estimated_days_max: 14 }
  }
]

async function fetchShipRankOptions() {
  // Try multiple possible endpoints
  const endpoints = [
    `${SHIPRANK_API_URL}/api/rates`,
    `${SHIPRANK_API_URL}/api/shipping/rates`,
    `${SHIPRANK_API_URL}/api/calculate`,
    `${SHIPRANK_API_URL}/api/shipping-options`,
  ]
  
  for (const endpoint of endpoints) {
    console.log(`[ShipRank] Trying endpoint: ${endpoint}`)
    
    try {
      // Try GET request first
      const getResponse = await fetch(`${endpoint}?weight=1000&currency_code=usd`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SHIPRANK_API_KEY,
          "Authorization": `Bearer ${SHIPRANK_API_KEY}`,
        },
      })

      if (getResponse.ok) {
        const data = await getResponse.json()
        console.log(`[ShipRank] GET success from ${endpoint}:`, JSON.stringify(data, null, 2))
        if (Array.isArray(data) && data.length > 0) {
          return data
        }
        if (data.options || data.rates || data.shipping_options) {
          return data.options || data.rates || data.shipping_options
        }
      }

      // Try POST request
      const postResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SHIPRANK_API_KEY,
          "Authorization": `Bearer ${SHIPRANK_API_KEY}`,
        },
        body: JSON.stringify({
          weight: 1000,
          currency_code: "usd",
          origin_country: "US",
          destination_country: "US"
        })
      })

      if (postResponse.ok) {
        const data = await postResponse.json()
        console.log(`[ShipRank] POST success from ${endpoint}:`, JSON.stringify(data, null, 2))
        if (Array.isArray(data) && data.length > 0) {
          return data
        }
        if (data.options || data.rates || data.shipping_options) {
          return data.options || data.rates || data.shipping_options
        }
      }
    } catch (error: any) {
      console.log(`[ShipRank] Endpoint ${endpoint} failed:`, error.message)
    }
  }
  
  // If all endpoints fail, throw error to use fallback
  throw new Error("Could not connect to ShipRank API - all endpoints failed")
}

/**
 * POST /admin/sync-shipping-options
 * 
 * Syncs shipping options from the external ShipRank API into Medusa.
 * This allows options from your shipping website to appear in Locations & Shipping.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const externalOptions = await fetchShipRankOptions()
    
    // Normalize the response format
    const normalizedOptions = Array.isArray(externalOptions) 
      ? externalOptions.map((opt: any) => ({
          id: opt.id || opt.shipping_option_id,
          name: opt.name || opt.shipping_option_name,
          amount: opt.amount || opt.price || 0,
          currency_code: opt.currency_code || "usd",
          data: {
            estimated_days_min: opt.estimated_days_min || opt.data?.estimated_days_min,
            estimated_days_max: opt.estimated_days_max || opt.data?.estimated_days_max,
          }
        }))
      : FALLBACK_OPTIONS

    return res.json({
      success: true,
      message: "Shipping options fetched from ShipRank API",
      provider_id: "external-shipping",
      available_options: normalizedOptions,
      instructions: [
        "To add these shipping options to your store:",
        "1. Go to Settings → Locations & Shipping",
        "2. Select your location and click 'Add Shipping Option'",
        "3. Choose 'external-shipping' as the Fulfillment Provider",
        "4. Set Price Type to 'Calculated' for dynamic pricing",
        "5. Use the option IDs above when configuring"
      ]
    })
  } catch (error: any) {
    console.error("[ShipRank] Sync shipping options error:", error)
    return res.json({
      success: false,
      message: `Failed to fetch from ShipRank API: ${error.message}`,
      options: FALLBACK_OPTIONS,
      is_fallback: true
    })
  }
}

/**
 * GET /admin/sync-shipping-options
 * 
 * Gets the current shipping options from the external API without syncing.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const externalOptions = await fetchShipRankOptions()
    
    // Normalize the response format
    const normalizedOptions = Array.isArray(externalOptions) 
      ? externalOptions.map((opt: any) => ({
          id: opt.id || opt.shipping_option_id,
          name: opt.name || opt.shipping_option_name,
          amount: opt.amount || opt.price || 0,
          currency_code: opt.currency_code || "usd",
          data: {
            estimated_days_min: opt.estimated_days_min || opt.data?.estimated_days_min,
            estimated_days_max: opt.estimated_days_max || opt.data?.estimated_days_max,
          }
        }))
      : FALLBACK_OPTIONS

    return res.json({
      success: true,
      options: normalizedOptions,
      source: "shiprank-api"
    })
  } catch (error: any) {
    console.error("[ShipRank] Fetch shipping options error:", error)
    // Return fallback options on error
    return res.json({
      success: true,
      message: `ShipRank API unavailable: ${error.message}`,
      options: FALLBACK_OPTIONS,
      is_fallback: true
    })
  }
}
