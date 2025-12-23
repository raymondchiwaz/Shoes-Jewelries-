import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import HeroVideo from "@modules/home/components/hero-video"
import ProductContainer from "@modules/home/components/product-container"
import FeaturedCategories from "@modules/home/components/featured-categories"
import MorpheusLanding from "@modules/home/components/morpheus-landing"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Morpheus — Shoes, Jewelry & VIP",
  description:
    "Shop new arrivals in shoes and jewelry. VIP members get 12% off + free shipping.",
  alternates: {
    canonical: new URL(getBaseURL()),
  },
  openGraph: {
    title: "Morpheus Store",
    description:
      "Discover the latest styles from top brands. VIP members get 12% off.",
    url: new URL(getBaseURL()),
    siteName: "Morpheus",
    images: [
      {
        url: "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Morpheus hero",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Morpheus Store",
    description:
      "Discover the latest styles from top brands. VIP members get 12% off.",
    images: ["/twitter-image.jpg"],
  },
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
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Morpheus',
            url: getBaseURL(),
            logo: `${getBaseURL()}/favicon.jpg`,
            sameAs: [],
          }),
        }}
      />
      {/* Primary landing banner */}
      <MorpheusLanding />
      {/* Optional hero video (falls back to image poster) */}
      <HeroVideo />
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
