"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import HeaderSearch from "@modules/layout/components/header-search"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

interface NavProps {
  regions?: StoreRegion[]
}

export default function Nav({ regions = [] }: NavProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Nordstrom-style category structure
  const categories = [
    {
      name: "New",
      href: "/store",
      megaMenu: [
        {
          title: "Featured",
          links: [
            { name: "New Arrivals", href: "/store" },
            { name: "Best Sellers", href: "/store" },
            { name: "Trending Now", href: "/store" },
            { name: "Just In", href: "/store" },
          ],
        },
      ],
    },
    {
      name: "Women",
      href: "/categories/women",
      megaMenu: [
        {
          title: "Shoes",
          links: [
            { name: "All Women's Shoes", href: "/categories/women-shoes" },
            { name: "Sneakers", href: "/categories/women-shoes" },
            { name: "Boots", href: "/categories/women-shoes" },
            { name: "Heels", href: "/categories/women-shoes" },
            { name: "Sandals", href: "/categories/women-shoes" },
          ],
        },
        {
          title: "Jewelry",
          links: [
            { name: "All Jewelry", href: "/categories/jewelry" },
            { name: "Necklaces", href: "/categories/jewelry" },
            { name: "Bracelets", href: "/categories/jewelry" },
            { name: "Earrings", href: "/categories/jewelry" },
            { name: "Rings", href: "/categories/jewelry" },
          ],
        },
        {
          title: "Shop by Style",
          links: [
            { name: "Casual", href: "/store" },
            { name: "Formal", href: "/store" },
            { name: "Work", href: "/store" },
            { name: "Weekend", href: "/store" },
          ],
        },
      ],
    },
    {
      name: "Men",
      href: "/categories/men",
      megaMenu: [
        {
          title: "Shoes",
          links: [
            { name: "All Men's Shoes", href: "/categories/men-shoes" },
            { name: "Sneakers", href: "/categories/men-shoes" },
            { name: "Boots", href: "/categories/men-shoes" },
            { name: "Dress Shoes", href: "/categories/men-shoes" },
            { name: "Loafers", href: "/categories/men-shoes" },
          ],
        },
        {
          title: "Jewelry",
          links: [
            { name: "All Jewelry", href: "/categories/jewelry" },
            { name: "Watches", href: "/categories/jewelry" },
            { name: "Bracelets", href: "/categories/jewelry" },
            { name: "Chains", href: "/categories/jewelry" },
          ],
        },
        {
          title: "Shop by Style",
          links: [
            { name: "Casual", href: "/store" },
            { name: "Formal", href: "/store" },
            { name: "Athletic", href: "/store" },
            { name: "Workplace", href: "/store" },
          ],
        },
      ],
    },
    {
      name: "Shoes",
      href: "/categories/shoes",
      megaMenu: [
        {
          title: "Women's Shoes",
          links: [
            { name: "All Women's Shoes", href: "/categories/women-shoes" },
            { name: "Sneakers", href: "/categories/women-shoes" },
            { name: "Boots", href: "/categories/women-shoes" },
            { name: "Heels & Pumps", href: "/categories/women-shoes" },
            { name: "Flats & Loafers", href: "/categories/women-shoes" },
          ],
        },
        {
          title: "Men's Shoes",
          links: [
            { name: "All Men's Shoes", href: "/categories/men-shoes" },
            { name: "Sneakers", href: "/categories/men-shoes" },
            { name: "Boots", href: "/categories/men-shoes" },
            { name: "Dress Shoes", href: "/categories/men-shoes" },
            { name: "Casual Shoes", href: "/categories/men-shoes" },
          ],
        },
        {
          title: "By Brand",
          links: [
            { name: "Nike", href: "/store" },
            { name: "Adidas", href: "/store" },
            { name: "Puma", href: "/store" },
            { name: "New Balance", href: "/store" },
          ],
        },
      ],
    },
    {
      name: "Jewelry",
      href: "/categories/jewelry",
      megaMenu: [
        {
          title: "Shop by Type",
          links: [
            { name: "All Jewelry", href: "/categories/jewelry" },
            { name: "Necklaces & Pendants", href: "/categories/jewelry" },
            { name: "Bracelets & Bangles", href: "/categories/jewelry" },
            { name: "Earrings", href: "/categories/jewelry" },
            { name: "Rings", href: "/categories/jewelry" },
          ],
        },
        {
          title: "By Material",
          links: [
            { name: "Gold", href: "/store" },
            { name: "Silver", href: "/store" },
            { name: "Platinum", href: "/store" },
            { name: "Gemstone", href: "/store" },
          ],
        },
        {
          title: "Collections",
          links: [
            { name: "Classic", href: "/store" },
            { name: "Modern", href: "/store" },
            { name: "Vintage", href: "/store" },
            { name: "Designer", href: "/store" },
          ],
        },
      ],
    },
    {
      name: "Sale",
      href: "/store",
      megaMenu: [
        {
          title: "Shop Sale",
          links: [
            { name: "Women's Sale", href: "/store" },
            { name: "Men's Sale", href: "/store" },
            { name: "Shoes Sale", href: "/store" },
            { name: "Jewelry Sale", href: "/store" },
            { name: "Clearance", href: "/store" },
          ],
        },
      ],
    },
  ]

  return (
    <nav className={`header-sticky ${isScrolled ? "header-sticky-shadow" : ""}`}>
      {/* Promotional Banner */}
      <div className="bg-grey-90 text-grey-0 text-center py-2 md:py-3 text-xs md:text-sm tracking-wide hidden md:block">
        <p>FREE SHIPPING ON ORDERS OVER $89 • FREE RETURNS</p>
      </div>

      {/* Main Navigation Bar */}
      <div className="border-b border-grey-20">
        <div className="nordstrom-container">
          {/* Desktop & Mobile Layout */}
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <SideMenu regions={regions} />
              </div>
              <LocalizedClientLink
                href="/"
                className="text-lg md:text-2xl font-semibold tracking-widest text-grey-90 hover:text-grey-70 transition-colors"
              >
                STORE
              </LocalizedClientLink>
            </div>

            {/* Center: Desktop Navigation (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center gap-8">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="group relative"
                  onMouseEnter={() => setActiveMenu(category.name)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <LocalizedClientLink
                    href={category.href}
                    className="nav-link-primary"
                  >
                    {category.name}
                  </LocalizedClientLink>

                  {/* Mega Menu */}
                  {category.megaMenu && (
                    <div className="mega-menu">
                      <div className="nordstrom-container">
                        <div className="grid grid-cols-3 gap-8">
                          {category.megaMenu.map((section, idx) => (
                            <div
                              key={`${category.name}-${idx}`}
                              className="mega-menu-column"
                            >
                              <h3 className="mega-menu-title">
                                {section.title}
                              </h3>
                              <ul className="space-y-2">
                                {section.links.map((link) => (
                                  <li key={link.name}>
                                    <LocalizedClientLink
                                      href={link.href}
                                      className="nav-link-secondary"
                                    >
                                      {link.name}
                                    </LocalizedClientLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Actions (Search, Account, Cart) */}
            <div className="flex items-center gap-4 md:gap-6">
              <Suspense fallback={<div className="w-5 h-5" />}>
                <HeaderSearch />
              </Suspense>

              <LocalizedClientLink
                href="/account"
                className="text-grey-90 hover:text-grey-60 transition-colors text-sm md:text-base"
              >
                <span className="hidden md:inline text-xs uppercase font-semibold tracking-wide">
                  Account
                </span>
                <span className="md:hidden">👤</span>
              </LocalizedClientLink>

              <Suspense fallback={<div className="w-5 h-5" />}>
                <CartButton />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
