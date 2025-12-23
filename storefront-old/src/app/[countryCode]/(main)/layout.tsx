import { Metadata } from "next"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  // Fetch cart on the server and pass to Nav (client) to avoid
  // calling server functions during initial render.
  let cart: HttpTypes.StoreCart | null = await retrieveCart()
  if (cart?.items?.length) {
    const enriched = await enrichLineItems(cart.items, cart.region_id!)
    cart = { ...cart, items: enriched as HttpTypes.StoreCartLineItem[] }
  }
  return (
    <>
      <Nav cart={cart} />
      {props.children}
      <Footer />
    </>
  )
}
