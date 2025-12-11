import { Suspense } from "react"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getTrendingProductIds } from "@lib/data/products"

type Props = {
  countryCode: string
  sortBy?: SortOptions
}

export default async function ProductContainer({ countryCode, sortBy = "created_at" }: Props) {
  const backendUrl =
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey =
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY ||
    process.env.MEDUSA_PUBLISHABLE_API_KEY

  let keyAndChannelReady = false

  if (publishableKey) {
    try {
      const res = await fetch(`${backendUrl}/store/regions`, {
        headers: {
          "x-publishable-api-key": publishableKey,
        },
        next: { revalidate: 60, tags: ["regions"] },
      })

      if (res.ok) {
        const data = await res.json()
        keyAndChannelReady = Array.isArray(data?.regions) && data.regions.length > 0
      }
    } catch (_) {
      keyAndChannelReady = false
    }
  }

  if (!publishableKey || !keyAndChannelReady) {
    return (
      <section aria-label="Products" className="content-container py-12 small:py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-serif tracking-tight">What's Hot Right Now</h2>
        </div>
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-gray-200 bg-white p-6 text-sm"
        >
          <p className="text-gray-900">
            Storefront is not ready: the publishable key must be scoped to a Sales Channel
            with products and regions.
          </p>
          <p className="text-gray-600 mt-2">
            In Admin, create a Sales Channel, attach products to it, and create a
            Publishable API Key scoped to that channel. Then set
            <code className="ml-1 mr-1">NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY</code> and restart.
          </p>
        </div>
      </section>
    )
  }

  // Fetch trending product IDs (gracefully fallback to default listing if empty)
  const trendingIds = await getTrendingProductIds({ countryCode }).catch(() => [])

  return (
    <section aria-label="Products" className="content-container py-12 small:py-16">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-serif tracking-tight">What's Hot Right Now</h2>
      </div>
      <Suspense fallback={<SkeletonProductGrid />}>        
        <PaginatedProducts
          sortBy={sortBy}
          page={1}
          countryCode={countryCode}
          productsIds={trendingIds && trendingIds.length ? trendingIds : undefined}
        />
      </Suspense>
    </section>
  )
}