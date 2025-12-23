"use client"

import { useState } from "react"
import { Button } from "@medusajs/ui"
import QuickAddModal from "@modules/products/components/quick-add-modal"
import { HttpTypes } from "@medusajs/types"

export default function QuickAddButton({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="secondary"
        className="h-9 px-3 text-xs uppercase tracking-wide"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
      >
        Quick add
      </Button>
      <QuickAddModal
        product={product}
        region={region}
        isOpen={open}
        close={() => setOpen(false)}
      />
    </>
  )
}

