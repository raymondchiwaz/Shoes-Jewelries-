import { Metadata } from "next"
import { retrieveCart } from "@lib/data/cart"
import WhatsAppActions from "./actions"

export const metadata: Metadata = {
  title: "Complete Order via WhatsApp",
  description: "Choose a payment contact to complete your order via WhatsApp.",
}

export default async function WhatsappPaymentPage({
  params,
}: {
  params: { countryCode: string }
}) {
  await retrieveCart() // keep SSR warm and ensure cart exists
  return <WhatsAppActions countryCode={params.countryCode} />
}
