import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { CinematicCollectionsShowcase } from "@/components/CinematicCollectionsShowcase"

import { getCollectionsList, getCollectionsWithProducts } from "@lib/data/collections"
import { getCategoriesList } from "@lib/data/categories"
import { getProductTypesList } from "@lib/data/product-types"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { getRegion } from "@lib/data/regions"

const StoreTemplate = async ({
  sortBy,
  collection,
  category,
  type,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection?: string[]
  category?: string[]
  type?: string[]
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page, 10) : 1

  const [collections, collectionsWithProducts, categories, types, region] = await Promise.all([
    getCollectionsList(0, 100, ["id", "title", "handle", "metadata"]),
    getCollectionsWithProducts(countryCode),
    getCategoriesList(0, 100, ["id", "name", "handle"]),
    getProductTypesList(0, 100, ["id", "value"]),
    getRegion(countryCode),
  ])

  // Transform collections for the showcase
  const showcaseCollections = (collectionsWithProducts || []).map(collection => ({
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    metadata: collection.metadata as { image?: { id: string; url: string } } | undefined,
    products: (collection.products || []).map(product => ({
      id: product.id,
      title: product.title || "",
      handle: product.handle || "",
      thumbnail: product.thumbnail,
      images: product.images?.map(img => ({
        id: img.id,
        url: img.url || ""
      })) || []
    }))
  }))

  return (
    <div className="md:pt-47 py-26 md:pb-36">
      {/* Cinematic Collections Showcase - 1920x1080 aspect ratio */}
      <div className="px-4 sm:container mb-20 md:mb-32">
        <CinematicCollectionsShowcase collections={showcaseCollections} />
      </div>
      <RefinementList
        collections={Object.fromEntries(
          collections.collections.map((c) => [c.handle, c.title])
        )}
        collection={collection}
        categories={Object.fromEntries(
          categories.product_categories.map((c) => [c.handle, c.name])
        )}
        category={category}
        types={Object.fromEntries(
          types.productTypes.map((t) => [t.value, t.value])
        )}
        type={type}
        sortBy={sortBy}
      />
      <Suspense fallback={<SkeletonProductGrid />}>
        {region && (
          <PaginatedProducts
            sortBy={sortBy}
            page={pageNumber}
            countryCode={countryCode}
            collectionId={
              !collection
                ? undefined
                : collections.collections
                    .filter((c) => collection.includes(c.handle))
                    .map((c) => c.id)
            }
            categoryId={
              !category
                ? undefined
                : categories.product_categories
                    .filter((c) => category.includes(c.handle))
                    .map((c) => c.id)
            }
            typeId={
              !type
                ? undefined
                : types.productTypes
                    .filter((t) => type.includes(t.value))
                    .map((t) => t.id)
            }
          />
        )}
      </Suspense>
    </div>
  )
}

export default StoreTemplate
