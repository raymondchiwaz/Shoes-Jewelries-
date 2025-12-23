import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getRegion } from "@lib/data/regions"

export const retrieveCollection = async function (id: string) {
  return sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next: { tags: ["collections"] },
        cache: "force-cache",
      }
    )
    .then(({ collection }) => collection)
}

export const getCollectionsList = async function (
  offset: number = 0,
  limit: number = 100,
  fields?: (keyof HttpTypes.StoreCollection)[]
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.client
    .fetch<{
      collections: HttpTypes.StoreCollection[]
      count: number
    }>("/store/collections", {
      query: { limit, offset, fields: fields ? fields.join(",") : undefined },
      next: { tags: ["collections"], revalidate: 0 },
      cache: "no-store",
    })
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async function (
  handle: string,
  fields?: (keyof HttpTypes.StoreCollection)[]
): Promise<HttpTypes.StoreCollection> {
  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: {
        handle,
        fields: fields ? fields.join(",") : undefined,
        limit: 1,
      },
      next: { tags: ["collections"] },
      cache: "force-cache",
    })
    .then(({ collections }) => collections[0])
}

export const getCollectionsWithProducts = async (
  countryCode: string,
  {
    collectionsLimit = 10,
    productsLimitPerCollection = 12,
  }: { collectionsLimit?: number; productsLimitPerCollection?: number } = {}
): Promise<HttpTypes.StoreCollection[] | null> => {
  const { collections } = await getCollectionsList(0, collectionsLimit)

  if (!collections) {
    return null
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return collections as unknown as HttpTypes.StoreCollection[]
  }

  /**
   * Important: the /collections page displays products per collection.
   * Fetching a single products page across many collections can lead to
   * uneven distribution (e.g. a collection only showing 1-2 products).
   * Instead, fetch N products per collection so each row is properly populated.
   */
  const collectionsWithProducts = await Promise.all(
    collections.map(async (collection) => {
      if (!collection?.id) {
        return collection
      }

      const { products } = await sdk.client.fetch<{
        products: HttpTypes.StoreProduct[]
      }>(`/store/products`, {
        query: {
          collection_id: [collection.id],
          region_id: region.id,
          limit: productsLimitPerCollection,
          offset: 0,
          fields: "*variants.calculated_price",
        },
        next: { tags: ["products", "collections"] },
        cache: "force-cache",
      })

      return {
        ...collection,
        products,
      }
    })
  )

  return collectionsWithProducts as unknown as HttpTypes.StoreCollection[]
}
