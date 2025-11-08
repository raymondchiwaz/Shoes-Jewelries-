import { Suspense } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCategoriesList } from "@lib/data/categories"

export default async function Hero() {
  const { product_categories } = await getCategoriesList(0, 12)

  const findHandle = (name: string) =>
    product_categories?.find(
      (c) => c.name?.toLowerCase() === name.toLowerCase()
    )?.handle

  const shoesHandle = findHandle("Shoes")
  const jewelryHandle = findHandle("Jewelry")

  return (
    <div className="hero-section">
      {/* Main Hero Content */}
      <div className="nordstrom-container">
        <div className="hero-content mb-8 md:mb-12">
          <h1 className="hero-title">
            Timeless Shoes & Jewelry
          </h1>
          <p className="hero-subtitle">
            Discover curated essentials with clean lines, rich materials, and effortless style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 md:mt-10">
            <LocalizedClientLink
              href={`/categories/${shoesHandle || "shoes"}`}
              className="btn-nordstrom-black"
            >
              Shop Shoes
            </LocalizedClientLink>
            <LocalizedClientLink
              href={`/categories/${jewelryHandle || "jewelry"}`}
              className="btn-nordstrom-outline"
            >
              Shop Jewelry
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* Featured Categories Section */}
      <div className="bg-grey-5 py-12 md:py-16 lg:py-20 mt-12 md:mt-16">
        <div className="nordstrom-container">
          <h2 className="section-title">Featured Collections</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Women's Shoes",
                href: shoesHandle ? `/categories/${shoesHandle}` : "/store",
                icon: "👠",
              },
              {
                name: "Men's Shoes",
                href: shoesHandle ? `/categories/${shoesHandle}` : "/store",
                icon: "👞",
              },
              {
                name: "Fine Jewelry",
                href: jewelryHandle ? `/categories/${jewelryHandle}` : "/store",
                icon: "💎",
              },
            ].map((collection) => (
              <LocalizedClientLink
                key={collection.name}
                href={collection.href}
                className="group relative aspect-[3/4] overflow-hidden bg-grey-90 rounded-sm hover:shadow-lg transition-shadow duration-300"
              >
                {/* Placeholder Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-grey-70 to-grey-90 flex items-center justify-center">
                  <span className="text-6xl md:text-7xl opacity-30">
                    {collection.icon}
                  </span>
                </div>

                {/* Overlay & Text */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                  <div className="w-full p-6 bg-gradient-to-t from-black to-transparent">
                    <h3 className="text-xl md:text-2xl font-light text-grey-0 group-hover:translate-y-0 transition-transform">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-grey-20 mt-2 group-hover:text-grey-0 transition-colors">
                      Explore Collection →
                    </p>
                  </div>
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-grey-90 text-grey-0 py-12 md:py-16">
        <div className="nordstrom-container text-center">
          <h2 className="text-2xl md:text-3xl font-light mb-4">
            Exclusive Member Benefits
          </h2>
          <p className="text-base md:text-lg font-light text-grey-20 mb-8 max-w-2xl mx-auto">
            Join our community and enjoy early access to new collections, special events, and personalized recommendations.
          </p>
          <LocalizedClientLink
            href="/account"
            className="btn-nordstrom-white"
          >
            Learn More
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
