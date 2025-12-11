## Goals
- Move payment options off the PDP and show them only after the user adds items and chooses to proceed from Cart.
- Fix "Out of stock" gating so variants that are available can be added; surface server errors when add fails.
- Ensure `cart.ts` SDK calls use correct argument signatures consistently.

## Implementation
### Payment Options
1. Remove the payment options block from the PDP (likely within `modules/products/templates/product-info` or a custom PDP card).
2. Keep payment options in Cart summary (`modules/cart/templates/summary.tsx`) behind a CTA (user clicks “Proceed to payment options”).
3. Maintain VIP 12% + free shipping and 30% deposit copy, layout on the right column.

### Add-To-Cart Availability
1. In `modules/products/components/product-actions/index.tsx`, relax client-side `inStock` gating: enable “Add to cart” when a variant is selected.
2. On click, call server `addToCart`; if it fails, show a clear user message (toast/inline) and reset loading state.
3. Ensure Quick Add modal uses the same logic by relying on `ProductActions`.

### Cart SDK Signatures
1. Audit all calls in `src/lib/data/cart.ts` to match Medusa SDK signatures:
   - `retrieve(cartId, query?, config?, headers?)`
   - `create(data, config?, headers?)`
   - `update(cartId, data, config?, headers?)`
   - `createLineItem(cartId, data, config?, headers?)`
   - `updateLineItem(cartId, lineId, data, config?, headers?)`
   - `deleteLineItem(cartId, lineId, config?, headers?)`
   - `addShippingMethod(cartId, data, config?, headers?)`
   - `initiatePaymentSession(cart, data, config?, headers?)`
   - `complete(cartId, data, config?, headers?)`
2. Fix any remaining mismatches (especially `deleteLineItem` and `complete`).

## Verification
1. PDP and Quick Add: select sizes and add to cart; confirm cart badge updates; if server rejects, see user-friendly error.
2. Cart page: payment options appear only after clicking the CTA; verify placement is on the right column.
3. Run a build/type check to confirm no TypeScript argument errors remain in `cart.ts`.

## Notes
- Assumes your publishable key is correctly linked to a sales channel with stock. If server rejects adds, the UI will report the exact error to the user instead of disabling prematurely.