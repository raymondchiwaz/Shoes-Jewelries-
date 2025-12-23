import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import {
  FulfillmentOption,
  CalculatedShippingOptionPrice,
} from "@medusajs/framework/types"

type Options = {
  apiUrl: string
  apiKey: string
  supabaseAnonKey?: string
}

class ExternalShippingProviderService extends AbstractFulfillmentProviderService {
  static identifier = "external-shipping"
  protected options_: Options

  constructor({ }: any, options: Options) {
    super()
    this.options_ = options
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return []
  }

  async validateFulfillmentData(optionData: any, data: any, context: any): Promise<any> {
    return {
      ...data,
      country_code: data.country_code || context?.cart?.shipping_address?.country_code || "zw"
    }
  }

  async validateOption(data: any): Promise<boolean> {
    return true
  }

  async canCalculate(data: any): Promise<boolean> {
    return true
  }

  async calculatePrice(optionData: any, data: any, context: any): Promise<CalculatedShippingOptionPrice> {
    // FREE SHIPPING - always return $0
    // The rate in option.data is for display only
    return {
      calculated_amount: 0,
      is_calculated_price_tax_inclusive: false
    }
  }

  async createFulfillment(data: any, items: any, order: any, fulfillment: any): Promise<any> {
    return {
      external_id: "shiprank-" + Date.now(),
      status: "pending"
    }
  }

  async cancelFulfillment(fulfillment: any): Promise<any> {
    return {}
  }
}

export default ExternalShippingProviderService
