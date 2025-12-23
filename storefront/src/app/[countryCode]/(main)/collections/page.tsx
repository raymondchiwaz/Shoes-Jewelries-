import { Metadata } from "next"
import { Suspense } from "react"
import Image from "next/image"

import { getCollectionsList, getCollectionsWithProducts } from "@lib/data/collections"
import { getCategoriesList } from "@lib/data/categories"
import { getProductTypesList } from "@lib/data/product-types"
import { getRegion } from "@lib/data/regions"
import { collectionMetadataCustomFieldsSchema } from "@lib/util/collections"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { Layout, LayoutColumn } from "@/components/Layout"
import { LocalizedLink } from "@/components/LocalizedLink"
import { BrowseCollectionsGallery } from "@/components/BrowseCollectionsGallery"

export const metadata: Metadata = {
    title: "Collections | Guavaland",
    description: "Explore our curated collections of luxury bags, precision eyewear, and premium casual shoes.",
}

type Props = {
    params: Promise<{ countryCode: string }>
    searchParams: Promise<{
        sortBy?: SortOptions
        category?: string | string[]
        type?: string | string[]
        page?: string
    }>
}

export default async function CollectionsPage({ params, searchParams }: Props) {
    const { countryCode } = await params
    const { sortBy, page, category, type } = await searchParams
    const pageNumber = page ? parseInt(page) : 1

    const [collectionsData, collectionsWithProducts, categories, types, region] = await Promise.all([
        getCollectionsList(0, 20, ["id", "title", "handle", "metadata"]),
        getCollectionsWithProducts(countryCode),
        getCategoriesList(0, 100, ["id", "name", "handle"]),
        getProductTypesList(0, 100, ["id", "value"]),
        getRegion(countryCode),
    ])

    const collections = collectionsData?.collections || []

    // Get the first collection's image for the hero, or use default
    let heroImage = "/images/content/collections.png"
    if (collections.length > 0) {
        const firstCollectionDetails = collectionMetadataCustomFieldsSchema.safeParse(
            collections[0].metadata ?? {}
        )
        if (firstCollectionDetails.success && firstCollectionDetails.data.collection_page_image?.url) {
            heroImage = firstCollectionDetails.data.collection_page_image.url
        }
    }

    // Prepare collections with products for the gallery
    const galleryCollections = (collectionsWithProducts || []).map(collection => ({
        id: collection.id,
        handle: collection.handle,
        title: collection.title,
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
        <>
            {/* Hero Section */}
            <div className="max-md:mt-18 relative aspect-[2/1] md:h-screen w-full max-w-full mb-8 md:mb-19">
                <Image
                    src={heroImage}
                    fill
                    alt="Collections"
                    className="object-cover z-0"
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h1 className="text-4xl md:text-6xl text-white font-bold">Our Collections</h1>
                </div>
            </div>

            {/* Browse Collections - Auto-scrolling Product Gallery */}
            {galleryCollections.length === 0 ? (
                <Layout className="mb-16 md:mb-26">
                    <LayoutColumn>
                        <p className="text-gray-500 text-center py-8">
                            No collections available yet.
                        </p>
                    </LayoutColumn>
                </Layout>
            ) : (
                <BrowseCollectionsGallery
                    collections={galleryCollections}
                    className="mb-16 md:mb-26"
                />
            )}

            {/* Divider */}
            <Layout className="mb-8 md:mb-12">
                <LayoutColumn>
                    <hr className="border-gray-200" />
                </LayoutColumn>
            </Layout>

            {/* All Products Section */}
            <Layout className="mb-8">
                <LayoutColumn>
                    <h2 className="text-2xl md:text-3xl">All Products</h2>
                </LayoutColumn>
            </Layout>

            <RefinementList
                sortBy={sortBy}
                title="All Products"
                categories={Object.fromEntries(
                    categories.product_categories.map((c) => [c.handle, c.name])
                )}
                category={Array.isArray(category) ? category : category ? [category] : undefined}
                types={Object.fromEntries(
                    types.productTypes.map((t) => [t.value, t.value])
                )}
                type={Array.isArray(type) ? type : type ? [type] : undefined}
            />

            <Suspense fallback={<SkeletonProductGrid />}>
                {region && (
                    <PaginatedProducts
                        sortBy={sortBy}
                        page={pageNumber}
                        countryCode={countryCode}
                        categoryId={
                            !category
                                ? undefined
                                : categories.product_categories
                                    .filter((c) =>
                                        Array.isArray(category)
                                            ? category.includes(c.handle)
                                            : category === c.handle
                                    )
                                    .map((c) => c.id)
                        }
                        typeId={
                            !type
                                ? undefined
                                : types.productTypes
                                    .filter((t) =>
                                        Array.isArray(type)
                                            ? type.includes(t.value)
                                            : type === t.value
                                    )
                                    .map((t) => t.id)
                        }
                    />
                )}
            </Suspense>

            <div className="pb-10 md:pb-20" />
        </>
    )
}
