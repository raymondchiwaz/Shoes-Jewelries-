## Brief: What’s Left
- Fix remaining type mismatch in `storefront/src/lib/data/cart.ts`.
- Harden PDP/Quick Add UX to surface server errors and ensure payment details are asked only after add-to-cart.

## Cart.ts Corrections
1. Restore `deleteLineItem` to 3-arg signature if SDK expects headers as the 3rd param:
   - Change to `sdk.store.cart.deleteLineItem(cartId, lineId, getAuthHeaders())`.
2. Verify `retrieveCart` call shape against SDK types; keep headers separate from `SelectParams`:
   - Use `sdk.store.cart.retrieve(cartId, {}, { next: { tags: ["cart"] } }, getAuthHeaders())` OR `retrieve(cartId, {}, getAuthHeaders())` depending on SDK overload; remove `...getAuthHeaders()` spread from config.
3. Audit all cart mutations to match SDK arg order consistently (`data/query, config?, headers?`).

## PDP and Rails UX Enhancements
1. Add lightweight user-visible error feedback when add-to-cart fails.
2. Confirm variant preselection and option matching for single-variant products.
3. Keep payment options hidden until user clicks a CTA in Cart; maintain right-column placement.

## Verification
1. Run PDP and Quick Add flows; ensure cart badge increments and dropdown updates.
2. Execute e2e cart tests and add one test that checks payment options only appear after proceeding.

## Backend Dependency
- Associate a stock location with the sales channel tied to the publishable key; ensure inventory or backorders. Without this, server will still reject line-item creation even if the UI is correct.