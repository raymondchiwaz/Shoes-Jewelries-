import {
  createSelectParams,
  createFindParams,
} from '@medusajs/medusa/api/utils/validators';
import { z } from 'zod';

export type AdminGetProductTypeParamsType = z.infer<
  typeof AdminGetProductTypeParams
>;
export const AdminGetProductTypeParams = createSelectParams();

export type AdminGetProductTypesParamsType = z.infer<
  typeof AdminGetProductTypesParams
>;

// Simplified validator to avoid merge issues with Zod
export const AdminGetProductTypesParams = z.object({
  limit: z.preprocess((val) => (val ? Number(val) : 10), z.number().optional()),
  offset: z.preprocess((val) => (val ? Number(val) : 0), z.number().optional()),
  fields: z.string().optional(),
  q: z.string().optional(),
  id: z.union([z.string(), z.array(z.string())]).optional(),
  value: z.union([z.string(), z.array(z.string())]).optional(),
});
