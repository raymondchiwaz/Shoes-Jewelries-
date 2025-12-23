import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await getCollectionsList(0, 6)
  const { product_categories } = await getCategoriesList(0, 6)

  return (
    <footer className="footer-section">
      <div className="nordstrom-container">
        {/* Newsletter Signup */}
        <div className="border-b border-grey-20 pb-12 md:pb-16 mb-12 md:mb-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-light mb-4 text-grey-90">
              Stay Connected
            </h3>
            <p className="text-base font-light text-grey-60 mb-8">
              Sign up for our newsletter and receive exclusive offers, new arrivals, and inspiration delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 md:px-6 py-3 md:py-4 border border-grey-30 rounded-none focus:border-grey-90 focus:outline-none transition-colors text-sm"
                required
              />
              <button
                type="submit"
                className="btn-nordstrom-black whitespace-nowrap"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-6 mb-12 md:mb-16">
          {/* Shop */}
          <div>
            <h4 className="footer-column-title">Shop</h4>
            <ul className="space-y-2">
              <li>
                <LocalizedClientLink href="/store" className="footer-link">
                  All Products
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/store" className="footer-link">
                  New Arrivals
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/store" className="footer-link">
                  Sale
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/store" className="footer-link">
                  Gifts
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-column-title">Categories</h4>
            <ul className="space-y-2">
              {product_categories?.slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <LocalizedClientLink
                    href={`/categories/${cat.handle}`}
                    className="footer-link"
                  >
                    {cat.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="footer-column-title">Collections</h4>
            <ul className="space-y-2">
              {collections?.slice(0, 4).map((collection) => (
                <li key={collection.id}>
                  <LocalizedClientLink
                    href={`/collections/${collection.handle}`}
                    className="footer-link"
                  >
                    {collection.title}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="footer-column-title">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <LocalizedClientLink href="#" className="footer-link">
                  Contact Us
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="#" className="footer-link">
                  Shipping & Returns
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="#" className="footer-link">
                  FAQ
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="#" className="footer-link">
                  Size Guide
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="footer-column-title">About</h4>
            <ul className="space-y-2">
              <li>
                <LocalizedClientLink href="#" className="footer-link">
                  About Us
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="#" className="footer-link">
                  Careers
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="#" className="footer-link">
                  Blog
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="#" className="footer-link">
                  Press
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & Legal */}
        <div className="border-t border-grey-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-grey-50">
            © {new Date().getFullYear()} Your Store. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex gap-6">
            <a
              href="https://facebook.com"
              className="text-grey-50 hover:text-grey-90 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              className="text-grey-50 hover:text-grey-90 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              className="text-grey-50 hover:text-grey-90 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex gap-6 text-xs">
            <LocalizedClientLink href="#" className="footer-link">
              Privacy Policy
            </LocalizedClientLink>
            <LocalizedClientLink href="#" className="footer-link">
              Terms of Service
            </LocalizedClientLink>
            <LocalizedClientLink href="#" className="footer-link">
              Cookies
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
