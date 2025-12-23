"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { LocalizedLink } from "@/components/LocalizedLink"

type ProductImage = {
    id?: string
    url: string
}

type Product = {
    id: string
    title: string
    handle: string
    thumbnail?: string | null
    images?: ProductImage[]
}

type CollectionWithProducts = {
    id: string
    handle: string
    title: string
    products: Product[]
}

type BrowseCollectionsGalleryProps = {
    collections: CollectionWithProducts[]
    className?: string
}

const DEFAULT_PRODUCT_IMAGE = "/images/content/collections.png"

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [currentImage, setCurrentImage] = useState<string>("")

    // Pick a random image on mount
    useEffect(() => {
        const images = product.images?.filter(img => img.url) || []
        if (images.length > 0) {
            const randomIndex = Math.floor(Math.random() * images.length)
            setCurrentImage(images[randomIndex].url)
        } else if (product.thumbnail) {
            setCurrentImage(product.thumbnail)
        } else {
            setCurrentImage(DEFAULT_PRODUCT_IMAGE)
        }
    }, [product.images, product.thumbnail])

    if (!currentImage) {
        return null
    }

    return (
        <LocalizedLink
            href={`/products/${product.handle}`}
            className="block group flex-shrink-0"
        >
            <div
                className="relative w-48 h-64 md:w-64 md:h-80 overflow-hidden rounded-xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image with zoom effect */}
                <Image
                    src={currentImage}
                    alt={product.title}
                    fill
                    className={`object-cover transition-transform duration-700 ease-out ${isHovered ? "scale-110" : "scale-100"
                        }`}
                    sizes="(max-width: 768px) 192px, 256px"
                />

                {/* Luxurious gradient overlay */}
                <div
                    className={`absolute inset-0 transition-all duration-500 ${isHovered
                        ? "bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                        : "bg-gradient-to-t from-black/50 via-transparent to-transparent"
                        }`}
                />

                {/* Elegant border on hover */}
                <div
                    className={`absolute inset-0 border-2 rounded-xl transition-all duration-500 ${isHovered
                        ? "border-amber-400/70 shadow-[inset_0_0_40px_rgba(251,191,36,0.15)]"
                        : "border-white/10"
                        }`}
                />

                {/* Product name with elegant typography */}
                <div
                    className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-500 ${isHovered ? "translate-y-0" : "translate-y-1"
                        }`}
                >
                    <h3 className="text-white font-light text-xs md:text-sm tracking-wide drop-shadow-lg line-clamp-2">
                        {product.title}
                    </h3>

                    {/* Animated underline */}
                    <div
                        className={`h-px bg-gradient-to-r from-amber-400 to-amber-200 mt-2 transition-all duration-500 ${isHovered ? "w-full opacity-100" : "w-6 opacity-60"
                            }`}
                    />
                </div>
            </div>
        </LocalizedLink>
    )
}

const InfiniteScrollRow: React.FC<{
    products: Product[]
    direction: "left" | "right"
}> = ({ products, direction }) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [isPaused, setIsPaused] = useState(false)
    const [isReady, setIsReady] = useState(false)

    // Duplicate products for seamless looping (5x for smooth infinite scroll even with few products)
    const duplicatedProducts = [...products, ...products, ...products, ...products, ...products]

    // Wait for DOM to be ready before starting animation
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 100)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const scrollContainer = scrollRef.current
        if (!scrollContainer || products.length === 0 || !isReady) return

        let animationId: number
        // For right direction, start from the 2nd section (2/5 of total width)
        const sectionWidth = scrollContainer.scrollWidth / 5
        let scrollPosition = direction === "left" ? 0 : sectionWidth * 2

        // Set initial position immediately for right direction
        if (direction === "right") {
            scrollContainer.scrollLeft = scrollPosition
        }

        const scroll = () => {
            if (!isPaused && scrollContainer) {
                if (direction === "left") {
                    scrollPosition += 0.4 // Scroll speed
                    if (scrollPosition >= sectionWidth) {
                        scrollPosition = 0
                    }
                } else {
                    scrollPosition -= 0.4 // Scroll speed
                    if (scrollPosition <= sectionWidth) {
                        scrollPosition = sectionWidth * 2
                    }
                }
                scrollContainer.scrollLeft = scrollPosition
            }
            animationId = requestAnimationFrame(scroll)
        }

        animationId = requestAnimationFrame(scroll)

        return () => {
            cancelAnimationFrame(animationId)
        }
    }, [direction, isPaused, products.length, isReady])

    if (products.length === 0) {
        return null
    }

    return (
        <div
            ref={scrollRef}
            className="flex gap-3 md:gap-5 overflow-hidden py-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{ scrollBehavior: "auto" }}
        >
            {duplicatedProducts.map((product, index) => (
                <ProductCard
                    key={`${product.id}-${index}`}
                    product={product}
                />
            ))}
        </div>
    )
}

const CollectionRow: React.FC<{
    collection: CollectionWithProducts
    direction: "left" | "right"
}> = ({ collection, direction }) => {
    if (collection.products.length === 0) {
        return null
    }

    return (
        <div className="mb-8 md:mb-12">
            {/* Collection Header with View All Link */}
            <div className="mx-auto px-4 sm:container mb-4 md:mb-6">
                <div className="flex flex-col items-center justify-center text-center gap-2">
                    <h3 className="text-lg md:text-xl font-light tracking-tight text-gray-800">
                        {collection.title}
                    </h3>
                    <LocalizedLink
                        href={`/collections/${collection.handle}`}
                        className="group inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors duration-300 text-xs md:text-sm"
                    >
                        <span>View all</span>
                        <svg
                            className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </LocalizedLink>
                </div>
            </div>

            {/* Scrolling Products */}
            <div className="relative overflow-hidden">
                {/* Gradient fade on edges */}
                <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                <InfiniteScrollRow
                    products={collection.products}
                    direction={direction}
                />
            </div>
        </div>
    )
}

export const BrowseCollectionsGallery: React.FC<BrowseCollectionsGalleryProps> = ({
    collections,
    className
}) => {
    // Filter out collections with no products
    const validCollections = collections.filter(c => c.products.length > 0)

    if (validCollections.length === 0) {
        return null
    }

    return (
        <section className={className}>
            {/* Elegant Header */}
            <div className="mx-auto px-4 sm:container mb-8 md:mb-12">
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-amber-600/70 text-xs md:text-sm uppercase tracking-[0.3em] mb-2">
                            Explore Our World
                        </p>
                        <h2 className="text-2xl md:text-4xl font-light tracking-tight">
                            Browse Collections
                        </h2>
                    </div>
                </div>
            </div>

            {/* Collection Rows - alternating scroll directions */}
            {validCollections.map((collection, index) => (
                <CollectionRow
                    key={collection.id}
                    collection={collection}
                    direction={index % 2 === 0 ? "left" : "right"}
                />
            ))}

            {/* Decorative line */}
            <div className="mx-auto px-4 sm:container mt-8 md:mt-12">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
            </div>
        </section>
    )
}
