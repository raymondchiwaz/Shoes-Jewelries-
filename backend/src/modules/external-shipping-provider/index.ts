import { ModuleProviderExports } from '@medusajs/framework/types'
import ExternalShippingProviderService from './service'

const services = [ExternalShippingProviderService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
