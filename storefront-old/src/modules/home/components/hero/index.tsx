import { Suspense } from "react"
import { getCollectionsList } from "@lib/data/collections"
import HeroCarousel from "./hero-carousel"

// Fetch hero slides from Medusa collections
async function getHeroSlides() {
  try {
    const { collections } = await getCollectionsList(0, 10)
    
    // Helpers to safely read metadata values
    const getString = (v: unknown): string | undefined =>
      typeof v === "string" ? v : undefined
    const getBoolean = (v: unknown): boolean =>
      typeof v === "boolean" ? v : v === "true"

    // Filter collections with "hero" metadata flag (supports boolean or "true")
    const heroCollections =
      collections?.filter((collection) =>
        getBoolean(collection.metadata?.showInHero)
      ) || []

    // Map to slide format with strict string types
    return heroCollections.map((collection) => {
      const title = getString(collection.metadata?.heroTitle) || collection.title
      const subtitle =
        getString(collection.metadata?.heroSubtitle) || `Shop our ${collection.title} collection`
      const ctaText = getString(collection.metadata?.heroCtaText) || "Shop Now"
      const badge = getString(collection.metadata?.heroBadge)
      const image = getString(collection.metadata?.heroImage)
      const backgroundGradient =
        getString(collection.metadata?.heroGradient) || "from-grey-900 via-grey-800 to-grey-900"

      return {
        id: collection.id,
        title,
        subtitle,
        ctaText,
        ctaLink: `/collections/${collection.handle}`,
        badge,
        image,
        imageAlt: `${collection.title} collection`,
        backgroundGradient,
      }
    })
  } catch (error) {
    console.error("Error fetching hero slides:", error)
    return []
  }
}

export default async function Hero() {
  const slides = await getHeroSlides()

  return (
    <section className="relative w-full bg-grey-900 my-8 md:my-10">
      <Suspense
        fallback={
          <div className="w-full h-[55vh] md:h-[60vh] bg-gradient-to-br from-grey-900 to-grey-800 animate-pulse" />
        }
      >
        <HeroCarousel slides={slides.length > 0 ? slides : undefined} />
      </Suspense>
    </section>
  )
}
