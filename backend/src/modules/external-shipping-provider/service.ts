import { AbstractFulfillmentProviderService, MedusaError } from "@medusajs/framework/utils"
import { 
  FulfillmentOption, 
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO
} from "@medusajs/framework/types"

type InjectedDependencies = {
  // logger: Logger
}

type Options = {
  apiUrl: string
  apiKey: string
  supabaseAnonKey?: string
}

class ExternalShippingProviderService extends AbstractFulfillmentProviderService {
  static identifier = "external-shipping"
  protected options_: Options

  constructor({}: InjectedDependencies, options: Options) {
    super()
    this.options_ = options
  }

  private isSupabaseEdgeFunctionUrl() {
    return /\.supabase\.co\/functions\/v1\//i.test(this.options_.apiUrl)
  }

  private buildEndpoint(path: "calculate" | "create-package") {
    // ShipRank public API uses `/api/*`, Supabase Edge Function style uses `/*`
    const base = this.options_.apiUrl.replace(/\/$/, "")
    const suffix = this.isSupabaseEdgeFunctionUrl() ? path : `api/${path}`
    return `${base}/${suffix}`
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Only send Supabase gateway auth headers when calling Supabase Edge Functions.
    if (this.isSupabaseEdgeFunctionUrl() && this.options_.supabaseAnonKey) {
      headers["apikey"] = this.options_.supabaseAnonKey
      headers["Authorization"] = `Bearer ${this.options_.supabaseAnonKey}`
    }

    // Only send x-api-key when calling Supabase Edge Functions (where you might enforce it).
    if (this.isSupabaseEdgeFunctionUrl() && this.options_.apiKey) {
      headers["x-api-key"] = this.options_.apiKey
    }
    
    return headers
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    // Fetch shipping options from ShipRank API
    // We send a sample weight to get all available options
    
    try {
      const response = await fetch(this.buildEndpoint("calculate"), {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          weight: 1000, // 1kg sample weight
          currency_code: "usd"
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          // Filter out options with 0 price (not available) and return
          return data
            .filter((opt: any) => opt.amount > 0)
            .map((opt: any) => ({
              id: opt.id,
              name: opt.name,
            }))
        }
      }
    } catch (error) {
      console.log("ShipRank API unavailable, returning empty options")
    }
    
    // Return empty array if API is unavailable
    // Shipping options should be seeded via the seed script
    return []
  }

  async validateFulfillmentData(
    optionData: any,
    data: any,
    context: any
  ): Promise<any> {
    // Get country code from the data, the context cart's shipping address, or fail gracefully
    const countryCode = data.country_code 
      || context?.cart?.shipping_address?.country_code 
      || context?.from_location?.country_code
      || "zw" // Default to Zimbabwe if not available
    
    // Return the validated data with country_code
    return {
      ...data,
      country_code: countryCode
    }
  }

  async validateOption(data: any): Promise<boolean> {
    // Validate if the option exists in your external system
    return true
  }

  async canCalculate(data: any): Promise<boolean> {
    // Return true if we can calculate price for this option
    return true
  }

  async calculatePrice(
    optionData: any,
    data: any,
    context: any
  ): Promise<CalculatedShippingOptionPrice> {
    // Calculate total weight from items
    const items = context.items || context.cart?.items || []
    
    const totalWeight = items.reduce((acc: number, item: any) => {
      // item.variant.weight is usually in grams
      const weight = item.variant?.weight || 0
      return acc + (weight * item.quantity)
    }, 0)

    // Ensure weight is at least 100g to avoid issues
    const weightToCalc = totalWeight > 0 ? totalWeight : 100;
    
    // Get the ShipRank option ID from the option data
    const shipRankOptionId = optionData.id || optionData.shiprank_id || data?.id || data?.shiprank_id

    // Try external API first
    try {
      const response = await fetch(this.buildEndpoint("calculate"), {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          weight: weightToCalc,
          currency_code: context.cart?.currency_code || "usd"
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Find the specific option that was selected by matching the ShipRank UUID
        const selectedOption = result.find((opt: any) => opt.id === shipRankOptionId)

        if (selectedOption) {
          return {
            calculated_amount: selectedOption.amount,
            is_calculated_price_tax_inclusive: false
          }
        }

        // Also try matching by name as fallback
        const optionName = optionData.name || ""
        const byName = result.find((opt: any) => 
          opt.name && optionName.toLowerCase().includes(opt.name.toLowerCase().split(" - ")[0])
        )
        
        if (byName) {
          return {
            calculated_amount: byName.amount,
            is_calculated_price_tax_inclusive: false
          }
        }
      }
    } catch (error) {
      console.log("ShipRank API unavailable, using fallback pricing")
    }

    // Fallback: Return a base price based on weight
    // Prices are in cents (smallest currency unit)
    // Base rate: approximately $15/kg for general shipping
    const pricePerKg = 1500 // $15 per kg in cents
    const weightInKg = weightToCalc / 1000
    const calculatedPrice = Math.max(1000, Math.ceil(weightInKg * pricePerKg))

    return {
      calculated_amount: calculatedPrice,
      is_calculated_price_tax_inclusive: false
    }
  }

  async createFulfillment(
    data: any,
    items: any,
    order: any,
    fulfillment: any
  ): Promise<any> {
    const totalWeight = items.reduce((acc: number, item: any) => {
      const weight = item.variant?.weight || 0
      return acc + (weight * item.quantity)
    }, 0)

    const payload = {
      shipping_option_id: data.id || "unknown", // The ID from getFulfillmentOptions
      weight: totalWeight > 0 ? totalWeight : 100,
      sender_details: {
        // You might want to make these configurable via module options
        first_name: "Store",
        last_name: "Admin",
        email: "admin@store.com",
        phone: "+1234567890",
        address_1: "Store Address",
        city: "Store City",
        country_code: "US"
      },
      receiver_details: {
        first_name: order.shipping_address.first_name,
        last_name: order.shipping_address.last_name,
        email: order.email,
        phone: order.shipping_address.phone,
        address_1: order.shipping_address.address_1,
        address_2: order.shipping_address.address_2,
        city: order.shipping_address.city,
        postal_code: order.shipping_address.postal_code,
        country_code: order.shipping_address.country_code,
        province: order.shipping_address.province
      },
      items: items.map((i: any) => ({
        id: i.id,
        variant_id: i.variant_id,
        quantity: i.quantity,
        weight: i.variant?.weight,
        title: i.title
      }))
    }

    try {
      const response = await fetch(this.buildEndpoint("create-package"), {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Failed to create package: ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        external_id: result.id || result.tracking_number || "shiprank-" + new Date().getTime(),
        tracking_number: result.tracking_number,
        label_url: result.label_url
      }
    } catch (error) {
      console.error("Create fulfillment error:", error)
      // We might want to throw here to prevent fulfillment creation in Medusa if external fails
      // But for now we'll return a placeholder so the flow continues
      return {
        external_id: "manual-fulfillment-" + new Date().getTime(),
        status: "manual-intervention-required"
      }
    }
  }

  async cancelFulfillment(fulfillment: any): Promise<any> {
    // Cancel in external system
    return {}
  }
}

export default ExternalShippingProviderService
