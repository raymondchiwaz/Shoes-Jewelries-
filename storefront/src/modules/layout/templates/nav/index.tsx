"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import HeaderSearch from "@modules/layout/components/header-search"
import CartDropdown from "@modules/layout/components/cart-dropdown"
import SideMenu from "@modules/layout/components/side-menu"
import { HttpTypes } from "@medusajs/types"

interface NavProps {
  regions?: StoreRegion[]
  cart?: HttpTypes.StoreCart | null
}

export default function Nav({ regions = [], cart = null }: NavProps) {
  const [isSolid, setIsSolid] = useState(false) // solid due to scroll
  const [navHover, setNavHover] = useState(false) // solid due to hover on header
  const [activeMenu, setActiveMenu] = useState<string | null>(null) // mega menu open
  const pathname = usePathname()

  // Use a top-of-page sentinel to control solid state reliably across zoom/browsers.
  useEffect(() => {
    const sentinel = document.getElementById("page-top-sentinel")

    if (sentinel && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          // When the sentinel leaves the viewport top, set solid state.
          setIsSolid(!entry.isIntersecting)
        },
        {
          // Observe exact viewport; turn solid only after real scroll
          rootMargin: "0px 0px 0px 0px",
          threshold: 0,
        }
      )
      observer.observe(sentinel)
      return () => observer.disconnect()
    } else {
      // Fallback: simple scroll check
      const onScroll = () => setIsSolid(window.scrollY > 64)
      window.addEventListener("scroll", onScroll, { passive: true })
      return () => window.removeEventListener("scroll", onScroll)
    }
  }, [])

  // Minimal navigation items
  const categories = [
    { name: "Shoes", href: "/categories/shoes" },
    { name: "Jewelry", href: "/categories/jewelry" },
  ]

  // Derived states for styling (solid when scrolled OR hovered OR menu open)
  const headerShadow = isSolid || navHover || !!activeMenu
  const isSolidFinal = isSolid || navHover || !!activeMenu

  return (
    <nav className={`header-sticky ${headerShadow ? "header-sticky-shadow" : ""}`}>
      {/* Promotional Ticker – only moving text (remove static overlay) */}
      <div className="bg-grey-90 text-grey-0 overflow-hidden border-b border-grey-80">
        <div className="ticker h-5 md:h-6">
          <div className="ticker-track animate-marquee">
            <span className="ticker-item">12% FOR VIP MEMBERS</span>
            <span className="ticker-sep">—</span>
            <span className="ticker-item">FREE SHIPPING ON ORDERS OVER $100</span>
            <span className="ticker-sep">—</span>
            <span className="ticker-item">12% FOR VIP MEMBERS</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        className={`${isSolidFinal ? "bg-white border-grey-20 shadow-sm" : "bg-transparent border-transparent"} border-b transition-colors duration-300 relative`}
        onMouseEnter={() => setNavHover(true)}
        onMouseLeave={() => setNavHover(false)}
      >
        <div className="nordstrom-container">
          {/* Desktop & Mobile Layout: three columns with centered brand */}
          <div className="grid grid-cols-3 items-center h-14 md:h-16">
            {/* Left: Mobile menu + left categories */}
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <SideMenu regions={regions} />
              </div>
              <div className="hidden md:flex items-center gap-8">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="group relative"
                    onMouseEnter={() => setActiveMenu(category.name)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <LocalizedClientLink
                      href={category.href}
                      className={`nav-link-primary ${isSolidFinal ? "text-grey-90 hover:text-grey-70" : "text-white hover:text-grey-5"}`}
                    >
                      {category.name}
                    </LocalizedClientLink>

                    {/* Partial-width Mega Menu anchored under this item */}
                    {activeMenu === category.name && (
                      <div className="absolute left-0 top-full w-[60vw] max-w-[760px] bg-white border-t border-grey-20 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-50">
                        <div className="p-6">
                          <div className="grid grid-cols-3 gap-8">
                            <div className="mega-menu-column">
                              <div className="mega-menu-title">Featured</div>
                              <ul className="space-y-2">
                                <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">New In</LocalizedClientLink></li>
                                <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Best Sellers</LocalizedClientLink></li>
                                <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Collections</LocalizedClientLink></li>
                              </ul>
                            </div>
                            <div className="mega-menu-column">
                              <div className="mega-menu-title">Categories</div>
                              <ul className="space-y-2">
                                {category.name === "Shoes" ? (
                                  <>
                                    <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Sneakers</LocalizedClientLink></li>
                                    <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Boots</LocalizedClientLink></li>
                                    <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Slides</LocalizedClientLink></li>
                                    <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Trainers</LocalizedClientLink></li>
                                  </>
                                ) : (
                                  <>
                                    <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Chains</LocalizedClientLink></li>
                                    <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Pendants</LocalizedClientLink></li>
                                    <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Bracelets</LocalizedClientLink></li>
                                    <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Rings</LocalizedClientLink></li>
                                  </>
                                )}
                              </ul>
                            </div>
                            <div className="mega-menu-column">
                              <div className="mega-menu-title">Shop</div>
                              <ul className="space-y-2">
                                <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Shop All {category.name}</LocalizedClientLink></li>
                                <li><LocalizedClientLink href={category.href} className="text-grey-90 hover:text-grey-70">Sale</LocalizedClientLink></li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Center: Brand */}
            <div className="flex justify-center">
              <LocalizedClientLink
                href="/"
                className={`text-xl md:text-2xl font-display font-semibold tracking-[0.18em] transition-colors ${isSolidFinal ? "text-grey-90 hover:text-grey-70" : "text-white hover:text-grey-5"}`}
              >
                MORPHEUS
              </LocalizedClientLink>
            </div>

            {/* Right: Account + Cart */}
            <div className="flex items-center justify-end gap-4 md:gap-6">
              <LocalizedClientLink
                href="/account"
                className={`transition-colors text-sm md:text-base ${isSolidFinal ? "text-grey-90 hover:text-grey-60" : "text-white hover:text-grey-5"}`}
              >
                <span className="hidden md:inline text-xs uppercase font-semibold tracking-wide">
                  Account
                </span>
                <span className="md:hidden">👤</span>
              </LocalizedClientLink>

              <Suspense fallback={<div className="w-5 h-5" />}> 
                <div className={`${isSolidFinal ? "text-grey-90" : "text-white"}`}>
                  <CartDropdown cart={cart} />
                </div>
              </Suspense>
            </div>
          </div>
        </div>

        {/* Global mega menu removed per request; per-item partial panels retained */}
      </div>
    </nav>
  )
}
