import { ProductTypeDTO } from '@medusajs/framework/types';
import {
  MedusaRequest,
  MedusaResponse,
} from '@medusajs/framework';

const defaultFields = ["id", "value", "metadata", "created_at", "updated_at"];

export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse,
) => {
  const query = req.scope.resolve("query")
  
  // Use remoteQueryConfig if available, otherwise use defaults
  const fields = req.remoteQueryConfig?.fields ?? defaultFields;
  const pagination = req.remoteQueryConfig?.pagination ?? { take: 20, skip: 0 };
  
  const { data: productTypes, metadata } = await query.graph({
    entity: "product_types",
    filters: req.filterableFields ?? {},
    fields: fields as (keyof ProductTypeDTO)[],
    pagination
  })

  res.json({
    product_types: productTypes,
    count: metadata?.count ?? productTypes.length,
    offset: metadata?.skip ?? 0,
    limit: metadata?.take ?? 20,
  });
};
