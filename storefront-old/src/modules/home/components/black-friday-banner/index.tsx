"use client"

import { useEffect, useState } from "react"

// Remote image backgrounds using CSS to avoid Next Image domain allowlist
const SLIDES = [
  // Replace these with your preferred fashion images (women, men, jewelry)
  "https://images.unsplash.com/photo-1519743439087-5fea1ba02d86?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593032586387-2e57b3a1a51a?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519741497674-61148f72b9b4?w=1600&q=80&auto=format&fit=crop",
]

export default function BlackFridayBanner() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(id)
  }, [isPaused])

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[320px] md:h-[400px]">
        {/* Slides */}
        {SLIDES.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === current ? "opacity-100" : "opacity-0"
            } bg-cover bg-center`}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden={i !== current}
          />
        ))}

        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="nordstrom-container">
            <div className="text-center md:text-left">
              <h2 className="section-title text-white">Black Friday Exclusive</h2>
              <p className="text-white/95 mt-2 max-w-2xl">Discover the latest styles from top brands</p>
              <div className="mt-6">
                <a
                  href="#"
                  className="inline-block bg-white text-grey-900 px-8 py-3 rounded-lg font-semibold uppercase tracking-wider hover:bg-grey-100 transition-colors"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0">
          <div className="flex justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/60 hover:bg-white"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}