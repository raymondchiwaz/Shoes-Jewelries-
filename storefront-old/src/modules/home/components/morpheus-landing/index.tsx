"use client"

import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function MorpheusLanding() {
  return (
    <section className="relative w-full aspect-[16/9] min-h-[60vh] md:min-h-[65vh] overflow-hidden bg-black" aria-label="Morpheus landing banner">
      {/* Background image */}
      <Image
        src="/images/landing/morpheus-hero.jpg"
        alt="Morpheus hero"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[50%_62%] lg:object-[50%_68%]"
      />
      {/* Dark overlay for legibility (slightly lighter to reveal details) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/30 to-black/10" />

      {/* Overlay content */}
      <div className="relative h-full flex items-center justify-center text-center">
        <div className="nordstrom-container">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="space-y-4 md:space-y-6">
              <div className="hero-headline font-display text-3xl md:text-4xl lg:text-5xl tracking-[0.08em]">BLACK FRIDAY WARM UP</div>
              <div className="hero-offer font-display text-6xl md:text-7xl lg:text-8xl">12% OFF</div>
              <div className="hero-sub font-display text-xl md:text-2xl tracking-[0.08em]">FOR VIP MEMBERS</div>
            </div>

            <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <LocalizedClientLink
                href="/categories/shoes"
                className="btn-hero-soft uppercase text-[13px] md:text-[15px] font-medium tracking-wider"
              >
                Shop Shoes
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/categories/jewelry"
                className="btn-hero-soft uppercase text-[13px] md:text-[15px] font-medium tracking-wider"
              >
                Shop Jewelry
              </LocalizedClientLink>
            </div>

            <p className="mt-3 md:mt-4 text-[11px] md:text-xs text-white/80">*Excludes sale & selected lines.</p>
          </div>
        </div>
      </div>
    </section>
  )
}