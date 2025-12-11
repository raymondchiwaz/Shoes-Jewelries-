## Summary of Original Task vs Actions Taken
- Original: Investigate and fix Add to Cart failures; trace `addToCart` in `product-actions/index.tsx` and `lib/data/cart.ts`; validate publishable key/sales channel; check inventory/variant gating; confirm API; deliver root cause, patch, and proof on PDP and rails.
- Done: Traced UI→server actions, validated env and regions with publishable key, identified root cause (sales channel lacks stock location association), patched cart retrieval headers and delete line item signature, stabilized PDP add state, improved in‑stock gating for missing quantities, gated payment options behind a CTA, and produced a backend proof script showing the stock location error.

## Proposed Next Steps (for Confirmation)
### Backend Readiness
1. Associate a stock location with the sales channel tied to `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
2. Ensure variants have inventory at that location or enable `allow_backorder`/disable `manage_inventory` for development.

### Frontend Hardening
1. Add user‑visible error feedback on PDP and Quick Add when server rejects add‑to‑cart.
2. Ensure variant selection preselects single‑variant products and handles option mismatches robustly.
3. Confirm cart retrieval/update paths use consistent headers and tags; add light logging in dev only.

### Payment Options UX
1. Keep payment options hidden until user clicks “Proceed to payment options” on Cart.
2. Place the options in the cart summary (right column), not left; retain VIP 12% + free shipping display and 30% deposit copy.

### Verification
1. Run PDP add‑to‑cart and rails Quick Add after backend association; confirm cart badge increments and dropdown updates.
2. Execute e2e cart tests; add a targeted test for deposit flow visibility only after add‑to‑cart.
3. Validate on `http://localhost:8000` to match your current server.

If you approve, I’ll implement the error feedback, finalize UX, and run the tests after you link the stock location to the sales channel.