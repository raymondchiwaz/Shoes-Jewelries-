import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getBaseURL } from "@lib/util/env"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  countryCode?: string
}

const ProductInfo = ({ product, countryCode }: ProductInfoProps) => {
  const baseUrl = getBaseURL()
  const productUrl = countryCode
    ? `${baseUrl}/${countryCode}/products/${product.handle}`
    : `${baseUrl}/products/${product.handle}`
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-6 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-sm text-grey-60 hover:text-grey-90 uppercase tracking-wider"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h1"
          className="text-3xl md:text-4xl font-display font-light tracking-tight text-grey-90 mb-2"
        >
          {product.title}
        </Heading>

        {product.subtitle && (
          <p className="text-base text-grey-60 font-light">
            {product.subtitle}
          </p>
        )}

        {product.description && (
          <div className="prose prose-sm text-grey-60">
            <p className="whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Pre-order Badge (if applicable) */}
        {Boolean((product as any)?.metadata?.preorder) && (
          <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold w-fit">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Pre-order • Ships in 7–30 days
          </div>
        )}

        

        

        

        {/* VIP Badge - ONLY if Black Friday */}
        {product.collection?.handle === "black-friday" && (
          <div className="border-2 border-amber-300 rounded-lg p-4 bg-gradient-to-br from-amber-50 to-amber-100">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💎</div>
              <div>
                <h3 className="font-bold text-grey-90 text-sm mb-2">VIP Member Benefits</h3>
                <ul className="text-xs text-grey-70 space-y-1">
                  <li>✓ Save 12% on this product</li>
                  <li>✓ Free shipping</li>
                  <li>✓ Priority 7-day delivery</li>
                </ul>
                <button className="mt-3 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors w-full">
                  Join VIP Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
