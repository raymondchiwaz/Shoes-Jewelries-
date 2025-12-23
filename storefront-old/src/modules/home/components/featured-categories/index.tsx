import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listCategories } from "@lib/data/categories"

export default async function FeaturedCategories() {
  const categories = await listCategories().catch(() => [])
  const featured = (categories || [])
    .filter((c) => (c as any)?.metadata?.featured)
    .slice(0, 3)
    .map((c) => ({
      id: c.id!,
      title: c.name!,
      handle: c.handle!,
      image: (c as any)?.metadata?.image as string | undefined,
      description: ((c as any)?.metadata?.description as string) || `Shop ${c.name}`,
    }))

  const fallback = [
    {
      id: "women-shoes",
      title: "Women's Shoes",
      handle: "women-shoes",
      image: "/images/categories/women-shoes.jpg",
      description: "Discover the latest in women's footwear",
    },
    {
      id: "men-shoes",
      title: "Men's Shoes",
      handle: "men-shoes",
      image: "/images/categories/men-shoes.jpg",
      description: "Premium styles for every occasion",
    },
    {
      id: "jewelry",
      title: "Jewelry",
      handle: "jewelry",
      image: "/images/categories/jewelry.jpg",
      description: "Elegant accessories to complete your look",
    },
  ]

  const data = featured.length ? featured : fallback
  return (
    <section className="section-luxury bg-grey-5">
      <div className="nordstrom-container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">Shop by Category</h2>
          <div className="w-24 h-1 bg-grey-90 mx-auto mt-6"></div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.map((category) => (
            <LocalizedClientLink
              key={category.id}
              href={`/categories/${category.handle}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Category Image */}
              <div className="relative w-full h-full">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-grey-100 to-grey-200" />
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500" />
              </div>

              {/* Text Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-white">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl md:text-4xl font-display font-light mb-2 text-center">
                    {category.title}
                  </h3>
                  <p className="text-sm text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-center">
                    {category.description}
                  </p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="inline-block border-2 border-white px-6 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-white hover:text-grey-90 transition-colors">
                      Shop Now
                    </span>
                  </div>
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
