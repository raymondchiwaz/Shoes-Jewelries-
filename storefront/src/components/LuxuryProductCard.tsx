"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { LocalizedLink } from "@/components/LocalizedLink"

type ProductImage = {
    id?: string
    url: string
}

type LuxuryProductCardProps = {
    product: {
        id: string
        title: string
        handle: string
        thumbnail?: string | null
        images?: ProductImage[]
    }
}

export const LuxuryProductCard: React.FC<LuxuryProductCardProps> = ({ product }) => {
    const [currentImage, setCurrentImage] = useState<string>("")
    const [isHovered, setIsHovered] = useState(false)

    // Shuffle and pick a random image on mount
    useEffect(() => {
        const images = product.images?.filter(img => img.url) || []
        if (images.length > 0) {
            const randomIndex = Math.floor(Math.random() * images.length)
            setCurrentImage(images[randomIndex].url)
        } else if (product.thumbnail) {
            setCurrentImage(product.thumbnail)
        }
    }, [product.images, product.thumbnail])

    if (!currentImage) {
        return null
    }

    return (
        <LocalizedLink
            href={`/products/${product.handle}`}
            className="block group"
        >
            <div
                className="relative aspect-[3/4] w-full overflow-hidden rounded-xl"
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
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Luxurious gradient overlay */}
                <div
                    className={`absolute inset-0 transition-all duration-500 ${isHovered
                            ? "bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                            : "bg-gradient-to-t from-black/40 via-transparent to-transparent"
                        }`}
                />

                {/* Gold accent border on hover */}
                <div
                    className={`absolute inset-0 border-2 rounded-xl transition-all duration-500 ${isHovered
                            ? "border-amber-400/60 shadow-[inset_0_0_30px_rgba(251,191,36,0.1)]"
                            : "border-transparent"
                        }`}
                />

                {/* Product name with elegant typography */}
                <div
                    className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-500 ${isHovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-80"
                        }`}
                >
                    <h3 className="text-white font-light text-sm md:text-base tracking-wide drop-shadow-lg">
                        {product.title}
                    </h3>

                    {/* Animated underline */}
                    <div
                        className={`h-px bg-gradient-to-r from-amber-400 to-amber-200 mt-2 transition-all duration-500 ${isHovered ? "w-full opacity-100" : "w-0 opacity-0"
                            }`}
                    />
                </div>
            </div>
        </LocalizedLink>
    )
}
