## Environment Strategy
- Use one `.env` baseline shared across local and deployed backend with identical module keys: `Modules.WORKFLOW_ENGINE`, `Modules.EVENT_BUS`, `Modules.NOTIFICATION`, `Modules.PAYMENT`.
- Develop locally against the same Postgres version as deployed; seed with `backend/src/scripts/seed.ts` to mimic production data.
- Keep a staging backend that mirrors production configs; promote changes after passing E2E.
- Leverage existing test DB template reset in `storefront/e2e/data/reset.ts` to ensure clean, reproducible E2E runs.
- Add a simple feature toggle `PAYMENT_CHANNEL_WHATSAPP=true` to gate the WhatsApp flow in all environments.

## Implementation Overview
- Implement server-side order creation tied to the "Pay with WhatsApp" click using Medusa v2 workflows/modules.
- Persist payment context to `cart.metadata` before completion so it flows into `order.metadata`.
- Place orders with `payment_status` awaiting to align with out-of-band WhatsApp payment confirmation.

## Backend Changes
- Refactor `backend/src/api/store/whatsapp-checkout/route.ts` to use Medusa v2 workflows instead of HTTP calls:
  - Update cart metadata: `{ payment_method: "whatsapp", whatsapp_recipient, wa_payment_state: "pending", timestamp }`.
  - Execute `completeCartWorkflow(req.scope).run({ input: { id: cart_id } })`.
  - Retrieve the created order via `req.scope.resolve(Modules.ORDER)` and confirm `order.metadata` contains the WhatsApp fields.
- Keep the route’s response shape consistent: `{ orderId }`.

## Order Flow (Draft vs Placed)
- Use placed orders created by cart completion to trigger `order.placed` subscriber immediately; payment remains out-of-band and captured later.
- Ensure the created order’s `payment_status` is `awaiting` (no capture) and that inventory is reserved at placement to avoid oversell.
- If a draft phase is preferred, we can gate inventory reservation until WhatsApp confirmation, but default will be placed for simplicity and subscriber compatibility.

## Subscriber Update
- Extend `backend/src/subscribers/order-placed.ts` to record WhatsApp context:
  - Read `order.metadata.payment_method`, `order.metadata.whatsapp_recipient`, and `order.metadata.wa_payment_state`.
  - Include these fields in email notification payload and analytics track properties.
  - File reference: `backend/src/subscribers/order-placed.ts:6-12` currently resolves modules and prepares notification; we will add metadata extraction and enrich the payload.

## Tests
- API integration test (backend):
  - Call the WhatsApp checkout route with a valid `cart_id`.
  - Assert it returns `orderId`.
  - Fetch the order via `Modules.ORDER` and assert `order.metadata.payment_method === "whatsapp"` and `wa_payment_state === "pending"`.
- E2E Playwright test (storefront):
  - Extend `storefront/e2e/tests/authenticated/orders.spec.ts` to click the WhatsApp payment CTA and submit.
  - Verify order appears in account orders and includes metadata via a backend API assertion.
- Subscriber unit test:
  - Mock the `order.placed` event data; assert notification payload and Segment properties include WhatsApp metadata.

## Admin Screenshots
- After implementation, capture:
  - Orders list showing the newly created order.
  - Order details page; if metadata is surfaced, show `payment_method: whatsapp`; otherwise include an admin API JSON view of `order.metadata`.

## Rollout
- Behind `PAYMENT_CHANNEL_WHATSAPP`, deploy to staging.
- Run E2E using the test DB template reset to validate end-to-end.
- Promote to production once staging passes and Admin shows correct order entries.

## Notes from Codebase Survey
- Order placed subscriber exists and can be enriched: `backend/src/subscribers/order-placed.ts`.
- WhatsApp route already posts to `/store/carts/:id/complete`; we will replace this with `completeCartWorkflow` for direct module usage.
- Orders module usage is present across the backend (`req.scope.resolve(Modules.ORDER)`), and workflows are available (e.g., `completeCartWorkflow` from `@medusajs/medusa/core-flows`).
- Existing Playwright E2E harness can be extended for the WhatsApp flow.

## Efficiency Answer
- Do not set up environments manually twice. Use config-as-code and identical module wiring in local/staging/prod to ensure parity.
- Iterate locally with seeds and E2E; deploy to staging with the same `.env` and module configuration; only then ship to production. This keeps velocity high and minimizes drift. 
