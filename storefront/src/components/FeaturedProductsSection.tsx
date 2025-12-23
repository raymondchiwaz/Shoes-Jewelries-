import { getProductsList } from "@lib/data/products"
import { LuxuryProductShowcase } from "@/components/LuxuryProductShowcase"

export const FeaturedProductsSection: React.FC<{
    className?: string
    countryCode: string
}> = async ({
    className,
    countryCode,
}) => {
        try {
            const { response } = await getProductsList({
                queryParams: {
                    limit: 8,
                },
                countryCode,
            })

            const products = response?.products || []

            if (products.length === 0) {
                return null
            }

            // Transform products to the format expected by LuxuryProductShowcase
            const formattedProducts = products.map(product => ({
                id: product.id,
                title: product.title || "",
                handle: product.handle || "",
                thumbnail: product.thumbnail,
                images: product.images?.map(img => ({
                    id: img.id,
                    url: img.url || ""
                })) || []
            }))

            return (
                <LuxuryProductShowcase
                    products={formattedProducts}
                    className={className}
                />
            )
        } catch (error) {
            console.error("Error fetching products for featured section:", error)
            return null
        }
    }
