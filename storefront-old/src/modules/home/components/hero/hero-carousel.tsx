"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface Slide {
  id: string
  title: string
  subtitle: string
  ctaText?: string
  ctaLink?: string
  backgroundGradient: string
  badge?: string
  image?: string // Optional product image
  imageAlt?: string
}

// Default slides (fallback if no Medusa data)
// Wired to local images under `public/images/banner/...`
const DEFAULT_SLIDES: Slide[] = [
  // Slide 1 — Morpheus slogan + quote, no button
  {
    id: "morpheus-slogan",
    title: "Built for speed.",
    subtitle: "\"Fashions fade, style is eternal.\"",
    // no CTA for this slide per spec
    backgroundGradient: "from-neutral-900 to-neutral-800",
    image: "/images/banner/banner-1.webp",
    imageAlt: "Performance sneaker on dark neon background",
  },
  // Slide 2 — New Arrivals with CTA
  {
    id: "new-arrivals",
    title: "New Arrivals",
    subtitle: "Discover the latest styles from top brands",
    ctaText: "Explore Collection",
    ctaLink: "/collections/new-arrivals",
    backgroundGradient: "from-neutral-900 to-neutral-800",
    image: "/images/banner/banner-2.jpg",
    imageAlt: "Curated accessories and footwear in beige theme",
  },
  // Slide 3 — VIP membership with CTA routing to VIP landing
  {
    id: "vip-membership",
    title: "Join VIP Today",
    subtitle: "Unlock 12% off all purchases + free shipping",
    ctaText: "Become VIP",
    ctaLink: "/vip",
    backgroundGradient: "from-neutral-900 to-neutral-800",
    image: "/images/banner/banner-3.jpg",
    imageAlt: "Evening clutch styling in emerald tones",
  },
]

export default function HeroCarousel({ slides }: { slides?: Slide[] }) {
  // Use dynamic slides from Medusa if provided, otherwise fallback defaults
  const SLIDES = slides && slides.length > 0 ? slides : DEFAULT_SLIDES

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [fallbackSrc, setFallbackSrc] = useState<Record<number, string>>({})
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  // Navigation functions
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
    setIsAutoPlay(false) // Stop auto-play on manual interaction
  }, [])

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
  }, [SLIDES.length])

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }, [SLIDES.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrev()
        setIsAutoPlay(false)
      } else if (e.key === "ArrowRight") {
        goToNext()
        setIsAutoPlay(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToNext, goToPrev])

  // Respect reduced motion: disable autoplay
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setIsAutoPlay(false)
    }
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsAutoPlay(false)
    }
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlay || isPaused) return

    const interval = setInterval(goToNext, 6000) // 6 seconds per slide
    return () => clearInterval(interval)
  }, [isAutoPlay, isPaused, goToNext])

  return (
    <div
      className="group relative w-full h-[390px] md:h-[476px] lg:h-[562px] overflow-hidden z-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        setTouchEndX(e.changedTouches[0]?.clientX ?? null)
        const start = touchStartX
        const end = e.changedTouches[0]?.clientX ?? null
        if (start != null && end != null) {
          const delta = end - start
          if (Math.abs(delta) > 30) {
            if (delta < 0) {
              goToNext()
            } else {
              goToPrev()
            }
            setIsAutoPlay(false)
          }
        }
        setTouchStartX(null)
        setTouchEndX(null)
      }}
      role="region"
      aria-label="Hero carousel"
      aria-live="polite"
    >
      {/* Slides Container */}
      <div className="relative h-full">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 z-10"
                : "opacity-0 z-0"
            }`}
            aria-hidden={index !== currentSlide}
          >
            {/* Background - Image or Gradient */}
            {slide.image ? (
              <>
                {/* Product Image Background */}
                <Image
                  src={fallbackSrc[index] ?? slide.image}
                  alt={slide.imageAlt || slide.title}
                  fill
                  priority={index === 0} // Priority for first slide
                  sizes="(max-width: 768px) 100vw, 100vw"
                  className="object-cover object-[50%_60%] lg:object-[50%_66%]"
                  quality={90}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEA8QDxAPDw8PDw8PDw8PDw8PDw8QFREWFhURFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lICYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAZAAADAQEBAAAAAAAAAAAAAAABAgMEBQb/xAAeEAEAAwABBQEAAAAAAAAAAAABAgMEERITITFBcf/EABgBAQEBAQEAAAAAAAAAAAAAAAECBAUD/8QAGREBAQEAAwAAAAAAAAAAAAAAAAERITFB/9oADAMBAAIRAxEAPwCzKXQ0dQyQeVfCq3WJ3Xqv0rYO1vQJkHf7v1XyL5uO3bqgQn0Fv2jI6VbqjC2r9uXlXr4xgYJ7oVtYigqGk9WnYQ4KfVJuepF2t7W4kNw0sBv//Z"
                  onError={() => {
                    const jpg = (slide.image || "").replace(/\.webp$/i, ".jpg")
                    if (jpg && jpg !== slide.image) {
                      setFallbackSrc((prev) => ({ ...prev, [index]: jpg }))
                    }
                  }}
                />
                {/* Dark Overlay for Text Legibility (slightly softened) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/15 pointer-events-none" />
              </>
            ) : (
              <>
                {/* Gradient Fallback */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${slide.backgroundGradient}`}
                />
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-96 h-96 border-4 border-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 border-4 border-white rounded-full blur-3xl"></div>
                </div>
              </>
            )}

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="nordstrom-container">
                {slide.id === "morpheus-slogan" ? (
                  <div className="max-w-4xl animate-fade-in-up">
                    <div className="space-y-4 md:space-y-6">
                      <div className="hero-headline text-3xl md:text-4xl lg:text-5xl tracking-[0.08em]">{slide.title}</div>
                      <div className="hero-sub text-xl md:text-2xl tracking-[0.08em] text-white/90">{slide.subtitle}</div>
                    </div>
                    {/* Intentionally no CTA for first slide */}
                  </div>
                ) : (
                  <div className="max-w-3xl space-y-6 md:space-y-8 animate-fade-in-up">
                    {/* Badge */}
                    {slide.badge && (
                      <div className="inline-block bg-white/20 backdrop-blur-sm border border-white/40 px-6 py-2 rounded-full">
                        <span className="text-white text-sm font-semibold uppercase tracking-widest">
                          {slide.badge}
                        </span>
                      </div>
                    )}
                    <h1 className="hero-title text-white drop-shadow-2xl">{slide.title}</h1>
                    <p className="hero-subtitle text-white/95 max-w-2xl drop-shadow-lg">{slide.subtitle}</p>
                    {slide.ctaLink && slide.ctaText && (
                      <div className="pt-4">
                        <LocalizedClientLink
                          href={slide.ctaLink}
                          className="inline-block bg-white text-grey-900 hover:bg-grey-100 px-10 py-4 rounded-lg font-semibold text-lg uppercase tracking-wider transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
                        >
                          {slide.ctaText}
                        </LocalizedClientLink>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={goToPrev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 text-white transition-opacity opacity-0 group-hover:opacity-100 filter drop-shadow-md"
        aria-label="Previous slide"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={goToNext}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2 md:p-2.5 text-white transition-opacity opacity-0 group-hover:opacity-100 filter drop-shadow-md"
        aria-label="Next slide"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="flex justify-center items-center gap-3">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent ${
                index === currentSlide
                  ? "w-12 h-3 bg-white"
                  : "w-3 h-3 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide ? "true" : "false"}
            />
          ))}
        </div>
      </div>

      {/* Pause indicator removed per design update */}

      {/* Slide Counter (Accessibility) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentSlide + 1} of {SLIDES.length}: {SLIDES[currentSlide].title}
      </div>
    </div>
  )
}
