"use client"

import Modal from "@modules/common/components/modal"
import ProductActions from "@modules/products/components/product-actions"
import { HttpTypes } from "@medusajs/types"

export default function QuickAddModal({
  product,
  region,
  isOpen,
  close,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  isOpen: boolean
  close: () => void
}) {
  return (
    <Modal isOpen={isOpen} close={close} size="large">
      <Modal.Title>Quick add</Modal.Title>
      <Modal.Body>
        <div className="w-full">
          <ProductActions product={product} region={region} />
        </div>
      </Modal.Body>
    </Modal>
  )
}

