## Objectives
- Elevate homepage UX and merchandising to Nike‑level polish
- Add data‑driven personalization (VIP, trending, geo) powered by Medusa
- Establish SEO, analytics and performance baselines for growth

## Key Gaps vs Nike (Observed)
- Generic homepage metadata and no Open Graph/Twitter cards (`storefront/src/app/[countryCode]/(main)/page.tsx:10-14`)
- Static hero and categories; limited personalization (`modules/home/components/morpheus-landing`, `featured-categories`)
- Search UI present but not surfaced in Nav; feature flag gating (`modules/layout/components/header-search`, `modules/layout/templates/nav/index.tsx:81-90`)
- Product rails lack quick add, badges, and micro‑interactions (`modules/home/components/featured-products/product-rail/index.tsx` and `products/components/product-preview/index.tsx`)
- No GA4/Segment instrumentation; no JSON‑LD structured data
- Performance: large hero images; no font loading strategy; missing reduced‑motion handling in carousel (`modules/home/components/hero/hero-carousel.tsx`)

## Deliverables
- Homepage design revamp with dynamic, personalized modules
- SEO+Analytics foundation (metadata, JSON‑LD, GA4/Segment events)
- Quick‑add commerce flows and improved product rails
- Medusa backend extensions (promotions, trending, metadata)

## Frontend Implementation
1. Metadata & SEO
- Replace generic `metadata` with brand content + `openGraph`, `twitter`, `alternates` in `storefront/src/app/[countryCode]/(main)/page.tsx`
- Inject JSON‑LD (Organization, BreadcrumbList, ProductList) via a server component

2. Hero Revamp
- Add `HeroVideo` with poster/fallback and user‑prefers‑reduced‑motion handling
- Drive slides from Medusa `collection.metadata` (already scaffolded in `modules/home/components/hero/index.tsx:16-44`) and allow CMS override
- Add touch/swipe and focus management to `hero-carousel.tsx`

3. Search Surfacing
- Render `HeaderSearch` in `Nav` (top bar or overlay) and enable `NEXT_PUBLIC_FEATURE_SEARCH_ENABLED`
- Ensure MeiliSearch index fields match queries (titles, categories, price)

4. Product Rails & Quick Add
- Extend `ProductPreview` to support size select + quick add (modal) without leaving page (`products/components/product-preview/index.tsx`)
- Add inventory/status badges and price promo labels; horizontal scroll on mobile

5. Featured Categories
- Replace static constants with backend data (`lib/data/categories.ts`), include imagery from Medusa file module and alt texts

6. Analytics & Consent
- Add GA4 and Segment loaders in `storefront/src/app/layout.tsx`; instrument view_item, add_to_cart, begin_checkout, purchase
- Add a consent banner and respect `doNotTrack`

7. Accessibility & Performance
- Respect reduced‑motion in carousels; add `placeholder="blur"` and tuned `sizes` to hero image
- Self‑host fonts or set `font-display: swap`; audit focus rings and aria labels

## Backend (Medusa) Implementation
1. Trending Signal
- Improve `/store/trending` to weight recent orders, views and inventory (extends `backend/src/api/store/trending/route.ts`)
- Add view tracking via lightweight endpoint and aggregate nightly

2. Promotions & VIP
- Create VIP customer group and 12% promotion; expose membership status to storefront via `/store/custom` or cart pricing

3. Homepage Metadata
- Persist hero module fields in `collection.metadata` (title, subtitle, cta, image, gradient); seed via admin/import

4. Search Indexing
- Ensure MeiliSearch plugin indexes categories, brand, price; sync on product updates (`backend/medusa-config.js`)

5. Webhooks & Analytics
- Emit order events to Segment; wire email notifications to Resend/Sendgrid (already configured)

6. Caching & Revalidation
- Tag responses (`next: { tags: [...] }`) already used; add Redis for event bus and workflow (configured) and set ISR windows

## Rollout & KPIs
- Phase 1: SEO/metadata, hero, search surfacing, rails polish
- Phase 2: VIP promo + quick add, trending personalization
- Phase 3: CMS overrides, JSON‑LD, analytics webhooks
- Track CVR, ATC rate, PDP exits, site speed (LCP/FID/CLS)

## Coordination with Perplexity
- Request competitive insights: hero video best practices, membership perk messaging, optimal rail ordering by market
- Validate SEO schema coverage and keyword clusters for categories; inform content blocks

If you approve, I’ll implement the above in small, verifiable PR‑sized steps starting with metadata+SEO and the hero revamp, then search and quick‑add rails.