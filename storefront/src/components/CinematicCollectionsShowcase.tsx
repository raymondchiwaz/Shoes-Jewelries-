"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { LocalizedLink } from "@/components/LocalizedLink"

type CollectionImage = {
    id: string
    url: string
    title: string
    collectionHandle: string
    collectionTitle: string
    productHandle: string
}

type CinematicCollectionsShowcaseProps = {
    collections: {
        id: string
        title: string
        handle: string
        metadata?: {
            image?: { id: string; url: string }
        }
        products?: {
            id: string
            title: string
            handle: string
            thumbnail?: string | null
            images?: { id: string; url: string }[]
        }[]
    }[]
    className?: string
}

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Cinematic hero slide with parallax and editorial styling
const HeroSlide: React.FC<{
    image: CollectionImage
    isActive: boolean
    isPrev: boolean
    index: number
    totalSlides: number
}> = ({ image, isActive, isPrev, index, totalSlides }) => {
    const [imageLoaded, setImageLoaded] = useState(false)

    return (
        <div
            className={`absolute inset-0 transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isActive ? "opacity-100 z-10" : isPrev ? "opacity-0 z-5" : "opacity-0 z-0"}
                ${isActive ? "scale-100" : "scale-[1.02]"}`}
        >
            {/* Image with cinematic Ken Burns effect */}
            <div className="absolute inset-0 overflow-hidden">
                <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    priority={index < 2}
                    className={`object-cover transition-transform duration-[15000ms] ease-linear
                        ${isActive ? "scale-[1.15]" : "scale-100"}
                        ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    sizes="100vw"
                    onLoad={() => setImageLoaded(true)}
                />

                {/* Luxury shimmer loader */}
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-stone-900 to-neutral-950">
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)]
                            animate-[luxuryShimmer_3s_ease-in-out_infinite]" />
                    </div>
                )}
            </div>

            {/* Multi-layer cinematic overlay - editorial magazine style */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Deep vignette for drama */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_30%,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

                {/* Rich bottom gradient for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 via-30% to-transparent" />

                {/* Warm luxury tones */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/[0.08] via-transparent to-rose-900/[0.08]" />

                {/* Film grain texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

                {/* Subtle horizontal film lines */}
                <div className="absolute inset-0 opacity-[0.015]"
                    style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)" }} />

                {/* Anamorphic lens flare accent */}
                <div className={`absolute top-1/4 right-0 w-full h-px bg-gradient-to-l 
                    from-amber-400/20 via-white/10 to-transparent
                    transform transition-all duration-[2500ms] delay-700
                    ${isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`} />
            </div>

            {/* Content with staggered reveal */}
            <div className={`absolute inset-0 flex flex-col justify-end 
                p-6 sm:p-10 md:p-16 lg:p-20 xl:p-28 z-20
                transition-all duration-1200
                ${isActive ? "opacity-100" : "opacity-0"}`}>

                {/* Collection badge with elegant styling */}
                <div className={`transform transition-all duration-1000 delay-300
                    ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <LocalizedLink
                        href={`/collections/${image.collectionHandle}`}
                        className="inline-flex items-center group"
                    >
                        <span className="relative flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3
                            text-[9px] sm:text-[10px] uppercase tracking-[0.5em]
                            bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08]
                            text-white/90 transition-all duration-700
                            group-hover:bg-white/[0.08] group-hover:border-white/20
                            group-hover:tracking-[0.6em]">

                            {/* Animated diamond indicator */}
                            <span className="relative w-2 h-2">
                                <span className="absolute inset-0 rotate-45 bg-gradient-to-br from-amber-300 to-amber-500" />
                                <span className="absolute inset-0 rotate-45 bg-amber-400 animate-ping opacity-40" />
                            </span>

                            {image.collectionTitle}

                            {/* Hover arrow */}
                            <svg className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 
                                transition-all duration-500"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </LocalizedLink>
                </div>

                {/* Product title - editorial typography */}
                <LocalizedLink
                    href={`/products/${image.productHandle}`}
                    className="group mt-5 sm:mt-8 block max-w-4xl"
                >
                    <h2 className={`text-white font-light tracking-[-0.02em] leading-[0.9] font-cormorant
                        text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl
                        transform transition-all duration-1000 delay-500
                        ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                        style={{
                            textShadow: "0 2px 40px rgba(0,0,0,0.6), 0 8px 80px rgba(0,0,0,0.4)",
                        }}>
                        {image.title}
                    </h2>

                    {/* Elegant underline with CTA */}
                    <div className="mt-5 sm:mt-8 flex items-center gap-6">
                        <div className={`h-[2px] bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500/0
                            transform origin-left transition-all duration-1200 delay-700
                            ${isActive ? "w-20 sm:w-32 lg:w-48 opacity-100" : "w-0 opacity-0"}`} />

                        <span className={`flex items-center gap-3 text-[10px] sm:text-xs 
                            text-amber-200/90 uppercase tracking-[0.4em] font-light
                            transform transition-all duration-1000 delay-900
                            ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                            <span className="hidden sm:inline">Discover</span>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 
                                group-hover:translate-x-2"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </div>
                </LocalizedLink>
            </div>
        </div>
    )
}

// Elegant thumbnail with hover effects
const ThumbnailItem: React.FC<{
    image: CollectionImage
    isActive: boolean
    onClick: () => void
    index: number
}> = ({ image, isActive, onClick, index }) => {
    const [loaded, setLoaded] = useState(false)

    return (
        <button
            onClick={onClick}
            className={`relative flex-shrink-0 overflow-hidden group
                transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isActive
                    ? "w-24 sm:w-32 md:w-40 lg:w-48"
                    : "w-14 sm:w-18 md:w-24 hover:w-20 sm:hover:w-28 md:hover:w-32"}`}
            style={{ aspectRatio: "16 / 9" }}
        >
            <Image
                src={image.url}
                alt={image.title}
                fill
                className={`object-cover transition-all duration-700
                    ${isActive ? "scale-100 brightness-100" : "scale-110 brightness-[0.35] group-hover:brightness-50"}
                    ${loaded ? "opacity-100" : "opacity-0"}`}
                sizes="200px"
                onLoad={() => setLoaded(true)}
            />

            {/* Border glow on active */}
            <div className={`absolute inset-0 transition-all duration-500
                ${isActive
                    ? "ring-2 ring-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.15)]"
                    : "ring-1 ring-white/10 group-hover:ring-white/25"}`} />

            {/* Active gradient indicator */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 
                bg-gradient-to-r from-amber-500 via-amber-400 to-rose-400
                transform origin-left transition-transform duration-700
                ${isActive ? "scale-x-100" : "scale-x-0"}`} />

            {/* Slide number */}
            <span className={`absolute top-1.5 left-2 text-[9px] font-mono 
                transition-all duration-500
                ${isActive ? "text-white/80 opacity-100" : "text-white/30 opacity-0 group-hover:opacity-100"}`}>
                {String(index + 1).padStart(2, '0')}
            </span>

            {/* Hover overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent
                transition-opacity duration-500
                ${isActive ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`} />
        </button>
    )
}

export const CinematicCollectionsShowcase: React.FC<CinematicCollectionsShowcaseProps> = ({
    collections,
    className = ""
}) => {
    const [allImages, setAllImages] = useState<CollectionImage[]>([])
    const [displayImages, setDisplayImages] = useState<CollectionImage[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [prevIndex, setPrevIndex] = useState(-1)
    const [isVisible, setIsVisible] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

    // Extract all images from collections
    useEffect(() => {
        const images: CollectionImage[] = []

        collections.forEach(collection => {
            // Add collection cover image
            if (collection.metadata?.image?.url) {
                images.push({
                    id: `collection-${collection.id}`,
                    url: collection.metadata.image.url,
                    title: collection.title,
                    collectionHandle: collection.handle,
                    collectionTitle: collection.title,
                    productHandle: `../collections/${collection.handle}`,
                })
            }

            // Add product images
            collection.products?.forEach(product => {
                const productImages = product.images || []
                if (productImages.length > 0) {
                    // Pick a random image from this product
                    const randomImg = productImages[Math.floor(Math.random() * productImages.length)]
                    images.push({
                        id: `${product.id}-${randomImg.id}`,
                        url: randomImg.url,
                        title: product.title,
                        collectionHandle: collection.handle,
                        collectionTitle: collection.title,
                        productHandle: product.handle,
                    })
                } else if (product.thumbnail) {
                    images.push({
                        id: `${product.id}-thumb`,
                        url: product.thumbnail,
                        title: product.title,
                        collectionHandle: collection.handle,
                        collectionTitle: collection.title,
                        productHandle: product.handle,
                    })
                }
            })
        })

        setAllImages(shuffleArray(images))
    }, [collections])

    // Select images for display
    useEffect(() => {
        if (allImages.length > 0) {
            const selected = shuffleArray(allImages).slice(0, 10)
            while (selected.length < 4 && allImages.length > 0) {
                selected.push(allImages[selected.length % allImages.length])
            }
            setDisplayImages(selected)
        }
    }, [allImages])

    // Auto-play slideshow
    useEffect(() => {
        if (isPaused || displayImages.length === 0) return

        autoPlayRef.current = setInterval(() => {
            setPrevIndex(currentIndex)
            setCurrentIndex(prev => (prev + 1) % displayImages.length)
        }, 7000) // Slightly longer for luxury feel

        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current)
        }
    }, [currentIndex, isPaused, displayImages.length])

    // Handle slide change
    const goToSlide = useCallback((index: number) => {
        if (index !== currentIndex) {
            setPrevIndex(currentIndex)
            setCurrentIndex(index)
        }
    }, [currentIndex])

    // Intersection observer for entrance animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.1 }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [])

    // Fallback: Show premium bento grid when no product images are available
    if (displayImages.length === 0) {
        // If we have collections but no images, show a bento grid of collection cards
        if (collections.length > 0) {
            // Gradient mesh colors for cards without images
            const gradientMeshes = [
                "from-amber-900/90 via-stone-900 to-neutral-950",
                "from-rose-900/80 via-neutral-900 to-stone-950",
                "from-emerald-900/70 via-neutral-900 to-slate-950",
                "from-violet-900/80 via-slate-900 to-neutral-950",
                "from-sky-900/70 via-neutral-900 to-stone-950",
                "from-orange-900/80 via-stone-900 to-neutral-950",
            ]

            return (
                <div ref={containerRef} className={`relative ${className}`}>
                    {/* Ambient background glow */}
                    <div className="absolute -inset-40 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl" />
                    </div>

                    {/* Refined editorial header */}
                    <div className={`text-center mb-16 md:mb-24 transition-all duration-1000
                        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>

                        {/* Luxury decorative element */}
                        <div className="flex items-center justify-center gap-6 mb-8">
                            <div className="w-16 sm:w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-amber-400/60" />
                            <div className="relative w-4 h-4">
                                <div className="absolute inset-0 rotate-45 border border-amber-400/50" />
                                <div className="absolute inset-1 rotate-45 bg-gradient-to-br from-amber-400/30 to-amber-600/30" />
                                <div className="absolute inset-0 rotate-45 animate-ping bg-amber-400/20" style={{ animationDuration: '3s' }} />
                            </div>
                            <div className="w-16 sm:w-32 h-[1px] bg-gradient-to-l from-transparent via-amber-400/40 to-amber-400/60" />
                        </div>

                        <p className="text-amber-600/70 text-[10px] sm:text-xs uppercase tracking-[0.5em] mb-4 font-light">
                            Curated Selection
                        </p>
                        <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight tracking-[-0.03em] text-neutral-900 font-cormorant">
                            The Collections
                        </h2>
                        <p className="mt-8 text-neutral-500 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
                            Discover our carefully curated selection of premium pieces, each collection telling its own unique story
                        </p>
                    </div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[280px] md:auto-rows-[320px] gap-4 md:gap-5 mx-auto max-w-7xl">
                        {collections.map((collection, index) => {
                            // Determine card size based on position for bento effect
                            const isFeatured = index === 0
                            const isLarge = index === 1 || index === 4
                            const gridClass = isFeatured
                                ? "md:col-span-2 md:row-span-2"
                                : isLarge
                                    ? "lg:row-span-2"
                                    : ""

                            const gradientMesh = gradientMeshes[index % gradientMeshes.length]
                            const delay = index * 100

                            return (
                                <LocalizedLink
                                    key={collection.id}
                                    href={`/collections/${collection.handle}`}
                                    className={`group relative overflow-hidden rounded-2xl transition-all duration-700 ${gridClass}
                                        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
                                    style={{ transitionDelay: `${delay}ms` }}
                                >
                                    {/* Gradient mesh background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientMesh}`} />

                                    {/* Animated gradient overlay */}
                                    <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

                                    {/* Collection image if exists */}
                                    {collection.metadata?.image?.url && (
                                        <Image
                                            src={collection.metadata.image.url}
                                            alt={collection.title}
                                            fill
                                            className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-1000 ease-out"
                                            sizes={isFeatured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                                        />
                                    )}

                                    {/* Multi-layer overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />

                                    {/* Film grain texture */}
                                    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />

                                    {/* Elegant border with glow */}
                                    <div className={`absolute ${isFeatured ? 'inset-6' : 'inset-4'} border border-white/10 
                                        group-hover:border-amber-400/40 group-hover:shadow-[inset_0_0_60px_rgba(251,191,36,0.08)]
                                        transition-all duration-700 rounded-xl`} />

                                    {/* Corner accents for featured */}
                                    {isFeatured && (
                                        <>
                                            <div className="absolute top-6 left-6 w-8 h-8">
                                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-400/60 to-transparent" />
                                                <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-amber-400/60 to-transparent" />
                                            </div>
                                            <div className="absolute top-6 right-6 w-8 h-8">
                                                <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-amber-400/60 to-transparent" />
                                                <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-amber-400/60 to-transparent" />
                                            </div>
                                            <div className="absolute bottom-6 left-6 w-8 h-8">
                                                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-400/60 to-transparent" />
                                                <div className="absolute bottom-0 left-0 w-[1px] h-full bg-gradient-to-t from-amber-400/60 to-transparent" />
                                            </div>
                                            <div className="absolute bottom-6 right-6 w-8 h-8">
                                                <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-amber-400/60 to-transparent" />
                                                <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-amber-400/60 to-transparent" />
                                            </div>
                                        </>
                                    )}

                                    {/* Content with glassmorphism */}
                                    <div className={`absolute inset-x-0 bottom-0 ${isFeatured ? 'p-8 md:p-10' : 'p-5 md:p-6'}`}>
                                        {/* Glassmorphism container */}
                                        <div className={`relative backdrop-blur-md bg-white/[0.03] border border-white/10 
                                            rounded-xl ${isFeatured ? 'p-6 md:p-8' : 'p-4 md:p-5'}
                                            group-hover:bg-white/[0.06] group-hover:border-white/20 transition-all duration-500`}>

                                            {/* Collection number with glow */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`text-amber-400 ${isFeatured ? 'text-sm' : 'text-xs'} font-mono
                                                    drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]`}>
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-400/30 to-transparent" />
                                            </div>

                                            {/* Subtitle */}
                                            <p className={`text-white/40 ${isFeatured ? 'text-xs' : 'text-[10px]'} uppercase tracking-[0.3em] mb-2 font-light`}>
                                                {isFeatured ? 'Featured Collection' : 'Collection'}
                                            </p>

                                            {/* Title with reveal effect */}
                                            <h3 className={`${isFeatured ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-xl md:text-2xl'} 
                                                font-light text-white tracking-tight font-cormorant 
                                                group-hover:text-amber-50 transition-colors duration-500`}>
                                                {collection.title}
                                            </h3>

                                            {/* Product count with animated line */}
                                            <div className={`flex items-center gap-3 ${isFeatured ? 'mt-6' : 'mt-4'}`}>
                                                <div className={`h-[2px] ${isFeatured ? 'w-10' : 'w-6'} bg-gradient-to-r from-amber-400 to-amber-500
                                                    group-hover:w-16 transition-all duration-700 rounded-full`} />
                                                <span className={`text-white/50 ${isFeatured ? 'text-xs' : 'text-[10px]'} uppercase tracking-[0.25em]`}>
                                                    {collection.products?.length || 0} pieces
                                                </span>
                                            </div>

                                            {/* Explore button for featured */}
                                            {isFeatured && (
                                                <div className="mt-8 flex items-center gap-4 opacity-0 group-hover:opacity-100 
                                                    transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                                    <span className="text-amber-400 text-xs uppercase tracking-[0.3em]">Explore</span>
                                                    <svg className="w-5 h-5 text-amber-400 transition-transform duration-500 
                                                        group-hover:translate-x-2"
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hover arrow for non-featured */}
                                    {!isFeatured && (
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 
                                            transform translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20
                                                flex items-center justify-center group-hover:bg-amber-400/20 
                                                group-hover:border-amber-400/40 transition-all duration-500">
                                                <svg className="w-4 h-4 text-white group-hover:text-amber-400 transition-colors duration-500"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}

                                    {/* Shimmer effect on hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden transition-opacity duration-500">
                                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                                            transition-transform duration-1000 ease-out
                                            bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                                    </div>
                                </LocalizedLink>
                            )
                        })}
                    </div>

                    {/* Bottom decorative flourish */}
                    <div className={`flex items-center justify-center gap-8 mt-20 md:mt-28 transition-all duration-1000
                        ${isVisible ? "opacity-100" : "opacity-0"}`}
                        style={{ transitionDelay: `${collections.length * 100 + 200}ms` }}>
                        <div className="w-20 sm:w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-amber-400/50" />
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rotate-45 bg-amber-400/40" />
                            <div className="w-2 h-2 rotate-45 border border-amber-400/50 bg-amber-400/10" />
                            <div className="w-1 h-1 rotate-45 bg-amber-400/40" />
                        </div>
                        <div className="w-20 sm:w-32 h-[1px] bg-gradient-to-l from-transparent via-amber-400/30 to-amber-400/50" />
                    </div>

                    {/* View all link */}
                    <div className={`flex justify-center mt-12 transition-all duration-1000
                        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                        style={{ transitionDelay: `${collections.length * 100 + 400}ms` }}>
                        <LocalizedLink
                            href="/collections"
                            className="group relative inline-flex items-center gap-6 px-10 py-5"
                        >
                            {/* Button background */}
                            <div className="absolute inset-0 bg-neutral-950 rounded-full transition-all duration-500 
                                group-hover:bg-neutral-900" />
                            <div className="absolute inset-0 rounded-full border border-neutral-800 
                                group-hover:border-amber-400/30 transition-colors duration-500" />

                            {/* Text */}
                            <span className="relative text-white text-xs uppercase tracking-[0.35em] font-light">
                                View All Collections
                            </span>

                            {/* Arrow */}
                            <svg className="relative w-4 h-4 text-amber-400 transition-transform duration-500 
                                group-hover:translate-x-1"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </LocalizedLink>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Refined editorial header */}
            <div className={`text-center mb-12 md:mb-20 transition-all duration-1200
                ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>

                {/* Luxury decorative element */}
                <div className="flex items-center justify-center gap-8 mb-10">
                    <div className="w-24 sm:w-40 h-[1px] bg-gradient-to-r from-transparent via-neutral-300 to-neutral-400" />
                    <div className="relative">
                        <div className="w-3 h-3 rotate-45 border border-neutral-400" />
                        <div className="absolute inset-0.5 rotate-45 bg-neutral-200" />
                    </div>
                    <div className="w-24 sm:w-40 h-[1px] bg-gradient-to-l from-transparent via-neutral-300 to-neutral-400" />
                </div>

                <p className="text-neutral-500 text-[10px] sm:text-xs uppercase tracking-[0.6em] mb-5 font-light">
                    Curated Selection
                </p>
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight tracking-[-0.02em] text-neutral-900 font-cormorant">
                    The Collections
                </h2>
                <p className="mt-6 text-neutral-500 text-sm sm:text-base font-light max-w-lg mx-auto leading-relaxed">
                    Discover our carefully curated selection of premium pieces
                </p>
            </div>

            {/* Cinematic 16:9 Container (1920x1080) */}
            <div
                className={`relative w-full overflow-hidden bg-neutral-950 transition-all duration-1200 delay-300
                    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
                style={{ aspectRatio: "1920 / 1080" }}
            >
                {/* Elegant border frame */}
                <div className="absolute inset-0 border border-neutral-800/60 z-30 pointer-events-none" />
                <div className="absolute inset-3 sm:inset-4 md:inset-6 border border-white/[0.03] z-30 pointer-events-none" />

                {/* Corner accents */}
                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 w-8 sm:w-12 h-8 sm:h-12 z-30 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-500/50 to-transparent" />
                    <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-amber-500/50 to-transparent" />
                </div>
                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 sm:w-12 h-8 sm:h-12 z-30 pointer-events-none">
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-amber-500/50 to-transparent" />
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-amber-500/50 to-transparent" />
                </div>
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 w-8 sm:w-12 h-8 sm:h-12 z-30 pointer-events-none">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-500/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-[1px] h-full bg-gradient-to-t from-amber-500/50 to-transparent" />
                </div>
                <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 w-8 sm:w-12 h-8 sm:h-12 z-30 pointer-events-none">
                    <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-amber-500/50 to-transparent" />
                    <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-amber-500/50 to-transparent" />
                </div>

                {/* Slides */}
                {displayImages.map((image, index) => (
                    <HeroSlide
                        key={image.id}
                        image={image}
                        isActive={index === currentIndex}
                        isPrev={index === prevIndex}
                        index={index}
                        totalSlides={displayImages.length}
                    />
                ))}

                {/* Navigation arrows - minimal and elegant */}
                <button
                    onClick={() => goToSlide((currentIndex - 1 + displayImages.length) % displayImages.length)}
                    className="absolute left-4 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2 z-30
                        w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center
                        bg-black/10 backdrop-blur-xl border border-white/5
                        text-white/50 hover:text-white hover:bg-black/30 hover:border-white/15
                        transition-all duration-500 group"
                    aria-label="Previous slide"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:-translate-x-1"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={() => goToSlide((currentIndex + 1) % displayImages.length)}
                    className="absolute right-4 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 z-30
                        w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center
                        bg-black/10 backdrop-blur-xl border border-white/5
                        text-white/50 hover:text-white hover:bg-black/30 hover:border-white/15
                        transition-all duration-500 group"
                    aria-label="Next slide"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Editorial slide counter */}
                <div className="absolute top-6 sm:top-10 right-6 sm:right-10 lg:right-16 z-30">
                    <div className="flex items-end gap-2">
                        <span className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-white/90 tracking-tight font-cormorant leading-none">
                            {String(currentIndex + 1).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col items-start mb-1">
                            <span className="text-[9px] text-white/30 font-light tracking-wider uppercase">of</span>
                            <span className="text-sm text-white/50 font-light">
                                {String(displayImages.length).padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Circular progress indicator */}
                <div className="absolute top-6 sm:top-10 left-6 sm:left-10 lg:left-16 z-30">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                        />
                        <circle
                            cx="50" cy="50" r="45"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeDasharray={`${((currentIndex + 1) / displayImages.length) * 283} 283`}
                            className="transition-all duration-700"
                        />
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#fbbf24" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-light
                            transition-all duration-500 
                            ${isPaused ? "text-amber-400" : "text-white/40"}`}>
                            {isPaused ? "Paused" : "Live"}
                        </span>
                    </div>
                </div>

                {/* Bottom progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5 z-30">
                    <div
                        className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500 transition-all duration-700 ease-out"
                        style={{ width: `${((currentIndex + 1) / displayImages.length) * 100}%` }}
                    />
                </div>

                {/* Thumbnail strip */}
                <div className="absolute bottom-8 sm:bottom-12 left-6 sm:left-10 lg:left-16 z-30
                    flex items-center gap-2 sm:gap-3 max-w-[60%] overflow-x-auto no-scrollbar">
                    {displayImages.map((image, index) => (
                        <ThumbnailItem
                            key={image.id}
                            image={image}
                            isActive={index === currentIndex}
                            onClick={() => goToSlide(index)}
                            index={index}
                        />
                    ))}
                </div>
            </div>

            {/* Elegant CTA button */}
            <div className={`flex justify-center mt-12 md:mt-20 transition-all duration-1200 delay-600
                ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                <LocalizedLink
                    href="/collections"
                    className="group relative inline-flex items-center gap-6 px-12 sm:px-16 py-6 sm:py-7 overflow-hidden"
                >
                    {/* Multi-layer background */}
                    <div className="absolute inset-0 bg-neutral-950 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-neutral-800 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Animated border */}
                    <div className="absolute inset-0 border border-neutral-700 group-hover:border-neutral-500 
                        transition-colors duration-700" />

                    {/* Sweep shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                            transition-transform duration-1000 ease-out
                            bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
                    </div>

                    {/* Text */}
                    <span className="relative text-white text-xs sm:text-sm uppercase tracking-[0.4em] font-light">
                        Explore All Collections
                    </span>

                    {/* Animated line and arrow */}
                    <div className="relative flex items-center gap-3">
                        <div className="w-10 sm:w-14 h-[1px] bg-gradient-to-r from-amber-500 to-amber-400 
                            group-hover:w-16 sm:group-hover:w-20 transition-all duration-600" />
                        <svg className="relative w-5 h-5 text-amber-400 transition-all duration-500 
                            group-hover:translate-x-2"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </LocalizedLink>
            </div>

            {/* Bottom decorative flourish */}
            <div className={`flex items-center justify-center gap-6 mt-16 md:mt-24 transition-all duration-1200 delay-800
                ${isVisible ? "opacity-100" : "opacity-0"}`}>
                <div className="w-24 sm:w-40 h-[1px] bg-gradient-to-r from-transparent via-neutral-300 to-neutral-400" />
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rotate-45 bg-neutral-300" />
                    <div className="w-2 h-2 rotate-45 border border-neutral-300" />
                    <div className="w-1.5 h-1.5 rotate-45 bg-neutral-300" />
                </div>
                <div className="w-24 sm:w-40 h-[1px] bg-gradient-to-l from-transparent via-neutral-300 to-neutral-400" />
            </div>
        </div>
    )
}
