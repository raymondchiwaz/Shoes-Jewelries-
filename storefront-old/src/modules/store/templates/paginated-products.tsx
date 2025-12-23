import { getProductsListWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = { limit: PRODUCT_LIMIT }

  if (collectionId) queryParams.collection_id = [collectionId]
  if (categoryId) queryParams.category_id = [categoryId]
  if (productsIds) queryParams.id = productsIds
  if (sortBy === "created_at") queryParams.order = "created_at"

  const region = await getRegion(countryCode)
  if (!region) return null

  const safePage = Math.max(page ?? 1, 1)

  const {
    response: { products, count },
  } = await getProductsListWithSort({
    page: safePage,
    queryParams,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      {totalPages > 1 && (
        <div className="flex justify-center mb-12 md:mb-16">
          <Pagination page={safePage} totalPages={totalPages} />
        </div>
      )}

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8 mb-12 md:mb-16">
        {products?.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination page={safePage} totalPages={totalPages} />
        </div>
      )}
    </>
  )
}
