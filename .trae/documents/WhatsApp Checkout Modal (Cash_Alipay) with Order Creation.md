## Overview
- Add a checkout modal offering: `Cash (RAY WhatsApp)` and `Alipay (VAL WhatsApp)`.
- On selection, set cart `metadata` and convert the active cart to an order, then open a WhatsApp deep link.
- Provide a secure backend route that performs metadata recording and cart completion server-side.
- Ensure the order appears in Admin and redirects to the existing order confirmation page.

## Key Integration Points
- Storefront cart completion exists in `storefront/src/lib/data/cart.ts:352` (`placeOrder()` calls `sdk.store.cart.complete`).
- All payment buttons funnel into `placeOrder()` in `storefront/src/modules/checkout/components/payment-button/index.tsx`.
- Cart metadata can be set via `updateCart(data)` in `storefront/src/lib/data/cart.ts:56` using `data.metadata`.
- Backend has subscribers for `order.placed` (`backend/src/subscribers/order-placed.ts`) to verify Admin visibility.

## UI: Checkout Modal
- Create `storefront/src/modules/checkout/components/whatsapp-checkout-modal/index.tsx` using existing `Modal` (`storefront/src/modules/common/components/modal/index.tsx`).
- Modal contents:
  - Two options: `Cash (RAY WhatsApp)` and `Alipay (VAL WhatsApp)`.
  - Optional toggle “Manual confirm (don’t auto-create order)” for flexibility.
  - Primary actions:
    - Auto-create flow: invokes server action to set metadata and complete cart; then opens WhatsApp deep link and navigates to confirmation page.
    - Manual flow: opens WhatsApp deep link first; provides a follow-up button “Confirm and create order” to complete afterward.
- Placement: add a secondary CTA button “Checkout via WhatsApp” alongside the existing Place Order button in `storefront/src/modules/checkout/components/review/index.tsx`.

## Storefront Server Action
- Add `checkoutViaWhatsapp({ payment_method, whatsapp_recipient })` in `storefront/src/lib/data/checkout.ts` (server action):
  - Read active `cartId` from cookies (`getCartId`).
  - Set `metadata` via `updateCart({ metadata: { payment_method, whatsapp_recipient, timestamp: new Date().toISOString() } })`.
  - Call secure backend route (below) to complete cart and return `{ orderId, whatsappLink }`.
  - Upon success, trigger `window.open(whatsappLink, '_blank')` and redirect to `/${countryCode}/order/confirmed/${orderId}`.

## Backend: Secure Route
- Create `backend/src/api/store/whatsapp-checkout/route.ts` (POST):
  - Input body: `{ cart_id, payment_method: 'cash'|'alipay', whatsapp_recipient: 'RAY'|'VAL' }`.
  - Auth: honor `Authorization: Bearer <customer JWT>` header forwarded from the storefront; reject if missing when policy requires.
  - Steps:
    1. Resolve Cart service: `const cartModuleService = req.scope.resolve(Modules.CART)`. Update cart by `id` to persist `metadata` (including `payment_method`, `whatsapp_recipient`, `timestamp`).
    2. Complete cart: call the standard cart completion flow (equivalent to `POST /store/carts/:id/complete`). If module API is not exposed, proxy internally to the same REST using the server’s base URL.
    3. Build WhatsApp deep link using phone number mappings (see Config below) and the just-created `order.id`.
  - Response: `{ orderId, whatsappLink }`.
  - Validation: ensure cart is not already completed; ensure `payment_method` and `whatsapp_recipient` are valid.

## WhatsApp Deep Link
- Numbers stored in backend env:
  - `WHATSAPP_RAY_NUMBER="<E164>"` (e.g., `+852XXXXXXXX`).
  - `WHATSAPP_VAL_NUMBER="<E164>"`.
- Construct link: `https://wa.me/<number>?text=<encoded>`.
- Suggested message template:
  - "Order <ORDER_ID> — <TOTAL> <CURRENCY>. Method: <PAYMENT_METHOD>. Link: <CONFIRMATION_URL>".

## Security & Data
- Do not expose phone numbers in the client; backend returns only the deep link.
- Persist `metadata` onto the cart so it inherits onto the order upon completion.
- Validate cart ownership when JWT is present (customer → cart match) and restrict completion unless cart belongs to the requester.

## Admin Visibility
- Orders created via cart completion appear in Admin automatically.
- Existing `order.placed` subscriber (`backend/src/subscribers/order-placed.ts`) runs; no change needed.

## Auto-Create vs Manual Confirm
- Default: auto-create at selection. Pros: reserves inventory, guarantees order in Admin, consistent reporting.
- Manual confirm option: open WhatsApp first, create order after chat; Pros: fewer ghost orders if the conversation fails; Cons: inventory not reserved, possible price changes. Recommendation: auto-create; include manual toggle for operational flexibility.

## Testing & Verification
- Storefront: add a lightweight unit test to ensure modal renders both options and calls server action with correct payload.
- E2E: reuse `storefront/e2e/fixtures/checkout-page.ts` to simulate selection → backend route → WhatsApp link building → redirect to order confirmation.
- Backend: route returns 400 on invalid payloads and 401 if auth policy requires; returns 200 with `{ orderId, whatsappLink }` on success.

## Deliverables
- UI modal component and button integration in Review step.
- Storefront server action for WhatsApp checkout.
- Secure backend route that updates cart metadata, completes cart, and returns deep link.
- Orders visible in Admin; confirmation redirect preserved.
- Documentation of env variables and operational notes for Cash vs Alipay.