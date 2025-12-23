import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  createShippingOptionsWorkflow,
  deleteShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows";

// Real ShipRank shipping options from the API
// These represent the actual shipping companies available via ShipRank
const SHIPRANK_OPTIONS = [
  {
    id: "14218dac-8024-442f-9046-6a6fdbf62100",
    name: "Macrotop - 14-Day Air Cargo via Hong Kong (Duty Excluded)",
    basePrice: 1100, // $11.00 per kg
    estimatedDays: "14 days",
  },
  {
    id: "c8c2e5db-35cf-405f-b785-e219fa65c7cf",
    name: "Macrotop - 7-Day Air Cargo (Duty Excluded)",
    basePrice: 1020, // $10.20 per kg
    estimatedDays: "7 days",
  },
  {
    id: "c1ead9d2-b7a9-4f84-bab2-f6567cf0f2bb",
    name: "Macrotop - 7-Day Direct Express (Duty Included)",
    basePrice: 1850, // $18.50 per kg
    estimatedDays: "7 days",
  },
  {
    id: "4faa4036-5791-485d-ac50-f559a11bfa45",
    name: "Francis Cargo - Air Express",
    basePrice: 2500, // $25.00 per kg
    estimatedDays: "3-5 days",
  },
  {
    id: "f0d08c36-ff5b-4ae9-8c06-51ec2682f60a",
    name: "Downey Exclusive - General Cargo",
    basePrice: 1750, // $17.50 per kg
    estimatedDays: "2-7 days",
  },
  {
    id: "5363a467-772d-4e32-b42c-6123cb6a18c2",
    name: "Forlyfe - Accessories, Shoes & Clothes",
    basePrice: 1800, // $18.00 per kg
    estimatedDays: "15 days",
  },
  {
    id: "b924cd77-4cfe-4f57-a11b-1ef236a193d6",
    name: "Feisu International - Air Passenger Plane",
    basePrice: 2500, // $25.00 per kg
    estimatedDays: "2-5 days",
  },
  {
    id: "9a4e050e-1c52-4375-a965-991669a0855d",
    name: "FX Express - Express Shipping",
    basePrice: 2300, // $23.00 per kg
    estimatedDays: "4-7 days",
  },
];

/**
 * Script to seed ShipRank shipping options from the real ShipRank API.
 * 
 * Run with: npx medusa exec ./src/scripts/seed-shiprank-options.ts
 */
export default async function seedShipRankShippingOptions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Starting ShipRank shipping options seed...");

  // Get the external-shipping provider
  const providers = await fulfillmentModuleService.listFulfillmentProviders({});
  logger.info(`Found ${providers.length} fulfillment providers: ${providers.map(p => p.id).join(", ")}`);

  // The provider ID format is: {module_id}_{provider_id}
  const externalShippingProvider = providers.find(p => p.id.includes("external-shipping"));
  
  if (!externalShippingProvider) {
    logger.error("external-shipping provider not found. Make sure it's configured in medusa-config.js");
    return;
  }

  const providerId = externalShippingProvider.id;
  logger.info(`Found external-shipping provider: ${providerId}`);

  // Get existing shipping profiles
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default"
  });
  
  if (!shippingProfiles.length) {
    logger.error("No default shipping profile found. Please run the main seed script first.");
    return;
  }

  const shippingProfile = shippingProfiles[0];
  logger.info(`Using shipping profile: ${shippingProfile.name} (${shippingProfile.id})`);

  // Get existing fulfillment sets
  const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({});
  logger.info(`Found ${fulfillmentSets.length} fulfillment sets`);

  if (!fulfillmentSets.length) {
    logger.error("No fulfillment sets found. Please run the main seed script first.");
    return;
  }

  const fulfillmentSet = fulfillmentSets[0];
  
  // Get service zones for this fulfillment set
  const serviceZones = await fulfillmentModuleService.listServiceZones({
    fulfillment_set_id: fulfillmentSet.id
  });
  
  if (!serviceZones.length) {
    logger.error("No service zones found in fulfillment set. Please check your fulfillment configuration.");
    return;
  }

  const serviceZone = serviceZones[0];
  logger.info(`Using service zone: ${serviceZone.name} (${serviceZone.id})`);

  // Get regions to set prices
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"]
  });

  if (!regions.length) {
    logger.error("No regions found. Please run the main seed script first.");
    return;
  }

  logger.info(`Found ${regions.length} regions`);

  // Delete existing ShipRank options
  const existingOptions = await fulfillmentModuleService.listShippingOptions({
    provider_id: providerId
  });

  if (existingOptions.length > 0) {
    logger.info(`Deleting ${existingOptions.length} existing ShipRank shipping options...`);
    try {
      await deleteShippingOptionsWorkflow(container).run({
        input: {
          ids: existingOptions.map(o => o.id)
        }
      });
      logger.info("Deleted old shipping options");
    } catch (error: any) {
      logger.warn(`Could not delete options via workflow: ${error.message}`);
      // Try direct deletion as fallback
      for (const opt of existingOptions) {
        try {
          await fulfillmentModuleService.deleteShippingOptions(opt.id);
          logger.info(`Deleted option: ${opt.name}`);
        } catch (e: any) {
          logger.warn(`Could not delete ${opt.name}: ${e.message}`);
        }
      }
    }
  }

  // Create ShipRank shipping options
  logger.info("Creating ShipRank shipping options from real API data...");

  for (const option of SHIPRANK_OPTIONS) {
    const code = option.id; // Use the ShipRank UUID as the code
    
    try {
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: option.name,
            price_type: "calculated", // Use calculated pricing from ShipRank API
            provider_id: providerId,
            service_zone_id: serviceZone.id,
            shipping_profile_id: shippingProfile.id,
            type: {
              label: `${option.name} (${option.estimatedDays})`,
              description: `Delivery in ${option.estimatedDays}. Prices calculated based on weight.`,
              code: code,
            },
            data: {
              id: option.id, // ShipRank shipping option ID
              shiprank_id: option.id,
            },
            prices: [
              {
                currency_code: "usd",
                amount: option.basePrice,
              },
              {
                currency_code: "eur",
                amount: option.basePrice,
              },
              ...regions.map(region => ({
                region_id: region.id,
                amount: option.basePrice,
              })),
            ],
            rules: [
              {
                attribute: "enabled_in_store",
                value: "true",
                operator: "eq",
              },
              {
                attribute: "is_return",
                value: "false",
                operator: "eq",
              },
            ],
          },
        ],
      });
      logger.info(`Created shipping option: ${option.name}`);
    } catch (error: any) {
      logger.error(`Failed to create shipping option ${option.name}: ${error.message}`);
    }
  }

  logger.info("Finished seeding ShipRank shipping options!");
}
