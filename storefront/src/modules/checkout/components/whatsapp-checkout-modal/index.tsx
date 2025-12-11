"use client"

import { useState } from "react"
import { Button, Text, clx } from "@medusajs/ui"
import { RadioGroup } from "@headlessui/react"
import Modal from "@modules/common/components/modal"
import { useRouter } from "next/navigation"
import { whatsappCheckout } from "@lib/data/whatsapp"

type WhatsAppCheckoutModalProps = {
  isOpen: boolean
  close: () => void
  cart: any
}

const WhatsAppCheckoutModal = ({ isOpen, close, cart }: WhatsAppCheckoutModalProps) => {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "alipay">("cash")
  const [recipient, setRecipient] = useState<"RAY" | "VAL">("RAY")
  const [autoCreate, setAutoCreate] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const countryCode = cart?.shipping_address?.country_code?.toLowerCase() || ""

  const handleProceed = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const resp = await whatsappCheckout({ payment_method: paymentMethod, whatsapp_recipient: recipient, complete: autoCreate })
      if (!resp?.whatsappLink) {
        throw new Error("Failed to generate WhatsApp link")
      }
      window.open(resp.whatsappLink, "_blank")
      if (autoCreate && resp.orderId) {
        close()
        router.push(`/${countryCode}/order/confirmed/${resp.orderId}`)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmOrder = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const resp = await whatsappCheckout({ payment_method: paymentMethod, whatsapp_recipient: recipient, complete: true })
      if (resp?.orderId) {
        close()
        router.push(`/${countryCode}/order/confirmed/${resp.orderId}`)
      } else {
        throw new Error("Order was not created")
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} close={close} size="medium" data-testid="whatsapp-checkout-modal">
      <Modal.Title>Checkout via WhatsApp</Modal.Title>
      <Modal.Description>
        Select a payment option and recipient. We will open WhatsApp and optionally create your order.
      </Modal.Description>
      <Modal.Body>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2">
            <Text className="txt-medium-plus">Payment method</Text>
            <RadioGroup value={paymentMethod} onChange={setPaymentMethod}>
              <RadioGroup.Option value="cash" className={clx("cursor-pointer py-3 px-4 border rounded-rounded mb-2 hover:shadow-borders-interactive-with-active", { "border-ui-border-interactive": paymentMethod === "cash" })}>
                Cash (RAY WhatsApp)
              </RadioGroup.Option>
              <RadioGroup.Option value="alipay" className={clx("cursor-pointer py-3 px-4 border rounded-rounded mb-2 hover:shadow-borders-interactive-with-active", { "border-ui-border-interactive": paymentMethod === "alipay" })}>
                Alipay (VAL WhatsApp)
              </RadioGroup.Option>
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-2">
            <Text className="txt-medium-plus">WhatsApp recipient</Text>
            <RadioGroup value={recipient} onChange={setRecipient}>
              <RadioGroup.Option value="RAY" className={clx("cursor-pointer py-3 px-4 border rounded-rounded mb-2 hover:shadow-borders-interactive-with-active", { "border-ui-border-interactive": recipient === "RAY" })}>
                RAY
              </RadioGroup.Option>
              <RadioGroup.Option value="VAL" className={clx("cursor-pointer py-3 px-4 border rounded-rounded mb-2 hover:shadow-borders-interactive-with-active", { "border-ui-border-interactive": recipient === "VAL" })}>
                VAL
              </RadioGroup.Option>
            </RadioGroup>
          </div>
          <div className="flex items-center gap-2">
            <input id="auto-create" type="checkbox" checked={autoCreate} onChange={(e) => setAutoCreate(e.target.checked)} />
            <label htmlFor="auto-create" className="txt-small">Auto-create order on selection</label>
          </div>
          {error && <Text className="text-ui-fg-error txt-small" data-testid="whatsapp-error">{error}</Text>}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleProceed} isLoading={submitting} data-testid="whatsapp-proceed-button">Proceed</Button>
        {!autoCreate && (
          <Button variant="secondary" onClick={handleConfirmOrder} isLoading={submitting} data-testid="whatsapp-confirm-button">Confirm and create order</Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default WhatsAppCheckoutModal

