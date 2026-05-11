# Roadmap: Marios Shop

**Created:** 2026-05-10
**Mode:** mvp
**Granularity:** coarse
**Structure:** Vertical MVP (every phase delivers an end-to-end user-visible slice)
**Coverage:** 65/65 v1 requirements mapped

## Core Value Reference

A Facebook visitor (mostly mobile) can in <30s find perfumes, build an order list, and copy it for Messenger — with no signup, no payment, no friction.

## Phases

- [ ] **Phase 1: Vertical MVP — Browse, Cart, Copy, Deploy** — Thinnest deployable end-to-end slice: scaffold + minimal inventory + basic catalog/product/cart/copy live on Vercel.
- [ ] **Phase 2: Inventory Robustness & Discovery** — Validation, image fallback, full filters/sort/search, stock indicators, cart edge cases, copy localization.
- [ ] **Phase 3: UI Polish, Accessibility & Visual System** — Final visual system (badges, typography, mobile-first details), accessibility, loading/error states.
- [ ] **Phase 4: Analytics & Deploy Hardening** — Vercel Analytics custom events, PII safety, README, build verification.

## Phase Details

### Phase 1: Vertical MVP — Browse, Cart, Copy, Deploy
**Goal:** A first-time mobile visitor can open the deployed Vercel URL, browse a small real catalog, add items to a persistent cart, and copy a Messenger-ready order text — end-to-end, live.
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, INV-01, INV-02, INV-05, CAT-01, CAT-02, CAT-03, CAT-09, PROD-01, PROD-02, PROD-03, PROD-04, PROD-08, CART-01, CART-02, CART-03, CART-05, CART-06, CART-08, CART-09, CART-11, COPY-01, COPY-02, COPY-03, COPY-05, COPY-06, COPY-08, UI-06, UI-07, DEP-01, DEP-02
**Success Criteria** (what must be TRUE):
  1. Visitor can open the deployed Vercel production URL on a mobile browser and see the Marios Shop homepage with a hero and a grid of at least 3 real products.
  2. Visitor can tap a product card, land on `/product/[id]`, see its variants with size/price, and add a variant to the cart.
  3. Visitor can open the cart drawer (sticky button with item-count badge), see all added items with brand/name/variant/price/quantity/subtotal and a running total, and remove an item.
  4. Cart contents survive a full page refresh (persisted in `localStorage` under `marios-shop-cart`) without a hydration mismatch.
  5. Visitor can tap "📋 Αντιγραφή για Messenger" and the formatted order text (header + numbered items + totals footer) is on the clipboard, ready to paste into Messenger.
**Plans:** 7 plans
Plans:
**Wave 1**
- [ ] 01-01-PLAN.md — Walking Skeleton: Next.js 15 + TS + Tailwind v4 + shadcn (button/card/sheet/badge/sonner) + Geist Greek font + types + minimal inventory.json (1 product) + bare homepage + product detail + cart store stub + static export build

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 01-02-PLAN.md — Catalog: format helpers + VariantBadge + Hero + responsive ProductGrid (1/2/3/4 cols) + ProductCard with image/brand/name/price/badges

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 01-03-PLAN.md — Product Detail: BackLink + VariantRow + ProductDetail composition (image, title block, notes, description, variants) + polished 404 page per UI-SPEC §10
- [ ] 01-04-PLAN.md — Cart Store consumer wiring: useCartUiStore (drawer open state) + CartHydration + StickyCartButton (FAB with badge) + Add-to-cart Sonner toast feedback

**Wave 4** *(blocked on Wave 3 completion)*
- [ ] 01-05-PLAN.md — Cart Drawer: Sheet-based right-side drawer (header/list/footer/empty) + CartDrawerItem (brand/name/variant/qty/subtotal/remove) + Copy CTA placeholder slot

**Wave 5** *(blocked on Wave 4 completion)*
- [ ] 01-06-PLAN.md — Copy-to-Messenger: tested formatOrderText pure function + copyToClipboard (navigator.clipboard + textarea fallback) + CopyToMessengerButton + drawer wiring + Sonner success/error toasts

**Wave 6** *(blocked on Wave 5 completion)*
- [ ] 01-07-PLAN.md — Full seed inventory (5 products: Tom Ford, Loewe, Creed, MFK, Nishane covering all variant types + stock=0 + fill_pct) + Vercel production deploy (checkpoint for auth)
**UI hint:** yes

### Phase 2: Inventory Robustness & Discovery
**Goal:** Visitors can find specific perfumes among many via filters/search/sort, see accurate stock and fill state, and the site stays trustworthy as the inventory grows and changes.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** INV-03, INV-04, CAT-04, CAT-05, CAT-06, CAT-07, CAT-08, PROD-05, PROD-06, PROD-07, PROD-09, CART-04, CART-07, CART-10, CART-12, COPY-04, COPY-07
**Success Criteria** (what must be TRUE):
  1. Visitor can filter the catalog by variant type (sealed/opened/decant chips) and by brand, search by free text matching brand/name/notes, and sort by brand A→Z, price asc/desc, or recently added — with an empty state when nothing matches.
  2. Visitor sees clear stock signals: "Τελευταία τεμάχια" when stock ≤ 2, greyed-out "Εξαντλήθηκε" instead of an Add button when stock = 0, and "Γέμιση: X%" on opened variants.
  3. Visitor cannot add more than the available stock to the cart (clamped) and sees a toast warning; can adjust quantities with +/- inside the drawer; can clear the entire cart with a confirm step.
  4. If the inventory file changes between sessions, items already in the cart whose variant became unavailable are flagged in the drawer instead of silently breaking the order.
  5. Build fails (or warns clearly) if `inventory.json` violates schema invariants (≥1 variant per product, unique variant ids), and missing local images fall back to `image_fallback_url`.
  6. Unknown product ids resolve to a proper 404 page, and the copy-to-Messenger output uses localized variant type labels with a success/error toast on copy.
**Plans:** TBD
**UI hint:** yes

### Phase 3: UI Polish, Accessibility & Visual System
**Goal:** The site looks like a deliberate minimal Greek e-shop — consistent badges, typography, focus states, and graceful loading/error UI — and works one-handed on mobile.
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** UI-01, UI-02, UI-03, UI-04, UI-05, UI-08, UI-09
**Success Criteria** (what must be TRUE):
  1. Across catalog, product page, and cart drawer, variant type badges render with the spec colors and Greek labels (green "Σφραγισμένο", yellow "Ανοιγμένο", blue "Decant").
  2. The visual system is consistently white-background, Inter/Geist typography, no gradients, no flashy animations, and no emoji in the UI except the single 📋 in the copy button.
  3. All interactive flows (browse, add, cart, copy) are usable one-handed on a 360px-wide mobile viewport and pass keyboard navigation with visible focus styles and proper ARIA on drawer/buttons.
  4. Image load failures and clipboard failures render explicit loading and error states instead of broken UI; lighthouse a11y score on the homepage is ≥ 90.
**Plans:** TBD
**UI hint:** yes

### Phase 4: Analytics & Deploy Hardening
**Goal:** The owner can see aggregate funnel data (views → adds → copies) on Vercel without leaking PII, and the project has a clean repo + README that makes inventory edits and redeploys trivial.
**Mode:** mvp
**Depends on:** Phase 3
**Requirements:** ANL-01, ANL-02, ANL-03, ANL-04, ANL-05, DEP-03
**Success Criteria** (what must be TRUE):
  1. `@vercel/analytics` is mounted in the root layout and the Vercel dashboard shows pageviews on the deployed site.
  2. Custom events `product_viewed` (with `product_id`), `added_to_cart` (with `product_id`, `variant_id`, `price`), and `cart_copied` (with `total_value`, `item_count`) appear in the Vercel Analytics dashboard.
  3. Event payload audit confirms no PII or free-form text is forwarded — only ids, prices, and counts.
  4. README documents local dev (`npm run dev`), how to edit `data/inventory.json`, the build command, and how a redeploy is triggered from main.
**Plans:** TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Vertical MVP — Browse, Cart, Copy, Deploy | 0/7 | Planned | - |
| 2. Inventory Robustness & Discovery | 0/0 | Not started | - |
| 3. UI Polish, Accessibility & Visual System | 0/0 | Not started | - |
| 4. Analytics & Deploy Hardening | 0/0 | Not started | - |

## Coverage Map

| Phase | Requirements | Count |
|-------|--------------|-------|
| 1 | FOUND-01..05, INV-01, INV-02, INV-05, CAT-01, CAT-02, CAT-03, CAT-09, PROD-01..04, PROD-08, CART-01, CART-02, CART-03, CART-05, CART-06, CART-08, CART-09, CART-11, COPY-01, COPY-02, COPY-03, COPY-05, COPY-06, COPY-08, UI-06, UI-07, DEP-01, DEP-02 | 35 |
| 2 | INV-03, INV-04, CAT-04, CAT-05, CAT-06, CAT-07, CAT-08, PROD-05, PROD-06, PROD-07, PROD-09, CART-04, CART-07, CART-10, CART-12, COPY-04, COPY-07 | 17 |
| 3 | UI-01, UI-02, UI-03, UI-04, UI-05, UI-08, UI-09 | 7 |
| 4 | ANL-01..05, DEP-03 | 6 |
| **Total** | | **65** |

Coverage: 65/65 v1 requirements mapped, 0 orphans, 0 duplicates.

---
*Last updated: 2026-05-11 after Phase 1 plan-phase completed (7 plans, 5 waves).*
