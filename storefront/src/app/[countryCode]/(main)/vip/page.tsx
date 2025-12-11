import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "VIP Membership | Morpheus",
  description: "Unlock 12% off + free shipping with VIP membership.",
}

export default async function VipPage({
  params,
}: {
  params: { countryCode: string }
}) {
  const customer = await getCustomer().catch(() => null)

  return (
    <section className="content-container py-12 md:py-16">
      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">Join VIP</h1>
        <p className="mt-4 text-lg text-ui-fg-subtle">
          Unlock <span className="font-semibold">12% off</span> all purchases and <span className="font-semibold">free shipping</span> on eligible orders.
        </p>

        {!customer ? (
          <div className="mt-8 space-y-4">
            <p className="text-ui-fg-base">
              You’re not signed in. Create an account or sign in to enroll in VIP.
            </p>
            <LocalizedClientLink
              href="/account"
              className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-ui-bg-base"
            >
              Sign in / Create account
            </LocalizedClientLink>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">How to qualify</h2>
              <ul className="mt-3 list-disc pl-6 space-y-2 text-ui-fg-subtle">
                <li>Add products worth <span className="font-semibold">$100+</span> to your cart.</li>
                <li>Checkout and your VIP badge will be applied to your account.</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <LocalizedClientLink
                href="/store"
                className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-ui-bg-base"
              >
                Start shopping
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/cart"
                className="inline-block border border-ui-fg-muted text-ui-fg-base px-6 py-3 rounded-md font-medium hover:bg-ui-bg-subtle"
              >
                View cart
              </LocalizedClientLink>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold">VIP Perks</h3>
              <ul className="mt-2 list-disc pl-6 text-ui-fg-subtle space-y-1">
                <li>12% off member pricing</li>
                <li>Free shipping on eligible orders</li>
                <li>Early access to drops</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}