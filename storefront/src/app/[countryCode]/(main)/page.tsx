import { Metadata } from "next"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import ProductContainer from "@modules/home/components/product-container"
import FeaturedCategories from "@modules/home/components/featured-categories"
import MorpheusLanding from "@modules/home/components/morpheus-landing"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
}

export default async function Home({
  params: { countryCode },
}: {
  params: { countryCode: string }
}) {
  // Attempt to load data; render page gracefully even if data is unavailable
  const collections = await getCollectionsWithProducts(countryCode).catch(() => null)
  const region = await getRegion(countryCode).catch(() => null)

  return (
    <>
      {/* Primary landing banner */}
      <MorpheusLanding />
      {/* Sliding container (existing hero) */}
      <Hero />
      {/* Products container directly after hero (new) */}
      <ProductContainer countryCode={countryCode} />
      {/* Products below hero */}
      {collections && region ? (
        <div className="py-12">
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </div>
      ) : null}
      <FeaturedCategories />
    </>
  )
}
