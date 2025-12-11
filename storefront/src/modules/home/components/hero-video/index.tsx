"use client"

import React from "react"

export default function HeroVideo() {
  return (
    <section aria-label="Hero video" className="relative w-full aspect-[16/9] bg-black">
      <video
        className="w-full h-full object-cover"
        poster="/images/landing/morpheus-hero.jpg"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-black/10" />
    </section>
  )
}

