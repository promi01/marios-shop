---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 01-05-PLAN.md
last_updated: "2026-05-11T11:38:22Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 7
  completed_plans: 5
  percent: 71
---

# State: Marios Shop

**Last updated:** 2026-05-11 (Plan 01-05 complete)

## Project Reference

**Core value:** Facebook visitor (mostly mobile) builds a perfume order list in <30s and copies it for Messenger — no signup, no payment, no friction.
**Mode:** mvp (yolo)
**Granularity:** coarse
**Structure:** Vertical MVP (every phase delivers end-to-end user-visible slice)
**Tech stack:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui, static export, Vercel deploy.

## Current Position

Phase: 1 (Vertical MVP — Browse, Cart, Copy, Deploy) — EXECUTING
Plan: 6 of 7 (Plans 01–05 complete, ready for Plan 06 — Copy-to-Messenger)

- **Milestone:** v1
- **Phase:** 1 — Vertical MVP — Browse, Cart, Copy, Deploy
- **Plan:** 01-05 Cart Drawer — COMPLETE
- **Status:** Executing Phase 1
- **Progress:** [███████░░░] 71%

```
[#---] 0/4 phases complete (Phase 1: 5/7 plans)
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases planned | 4 |
| Phases complete | 0 |
| Plans complete | 5 |
| v1 requirements | 65 |
| v1 requirements mapped | 65 |
| Coverage | 100% |
| Plan 01-01 duration (seconds) | 458 |
| Plan 01-01 tasks completed | 2 |
| Plan 01-01 files created | 26 |
| Plan 01-02 duration (seconds) | 131 |
| Plan 01-02 tasks completed | 2 |
| Plan 01-02 files created | 5 |
| Plan 01-02 files modified | 2 |
| Plan 01-03 duration (seconds) | 148 |
| Plan 01-03 tasks completed | 2 |
| Plan 01-03 files created | 3 |
| Plan 01-03 files modified | 2 |
| Plan 01-04 duration (seconds) | 198 |
| Plan 01-04 tasks completed | 2 |
| Plan 01-04 files created | 3 |
| Plan 01-04 files modified | 2 |
| Plan 01-05 duration (seconds) | 135 |
| Plan 01-05 tasks completed | 2 |
| Plan 01-05 files created | 3 |
| Plan 01-05 files modified | 1 |

## Accumulated Context

### Decisions (from PROJECT.md)

- Next.js 15 + static export (`output: 'export'`) over Astro/Vite — App Router familiarity, shadcn/ui ecosystem, Vercel out-of-the-box.
- `data/inventory.json` is the single source of truth — zero backend, easy edits, version-controlled.
- Cart state via Zustand or React Context with localStorage persistence (`marios-shop-cart`).
- Cart as drawer/sheet (no `/cart` route) — mobile-friendly.
- Plain-text "Copy to Messenger" — Messenger deep links unreliable on mobile, clipboard works everywhere.
- Vercel Analytics over GA4 — lightweight, sufficient scope, no cookies/PII.
- Variant type badges (sealed/opened/decant) with distinct colors — critical buyer signal.

### Open todos

- Execute Plan 06 (Copy-to-Messenger): build tested `formatOrderText` pure function + `copyToClipboard` (navigator.clipboard primary path + textarea fallback per D-24) + `<CopyToMessengerButton />` that REPLACES the disabled placeholder slot (`data-slot="copy-cta-placeholder"`) in `components/cart-drawer.tsx` footer, with Sonner success/error toasts (`Αντιγράφηκε!` / `Δεν αντιγράφηκε — δοκιμάστε ξανά`).

### Blockers

(none)

### Decisions logged from Plan 01-05

- Cart drawer is a right-side shadcn `<Sheet side="right">` at `w-[85vw] sm:w-[420px]` (D-09 honored — no bottom-sheet variant). Mounted globally in `app/layout.tsx` AFTER `<StickyCartButton />` (z-40) so the drawer's Radix portal (z-50 default) correctly covers the sticky button when open.
- Drawer reads from TWO Zustand stores: `useCartUiStore` for open state (`isDrawerOpen`, `setDrawerOpen` — Plan 04 surface) and `useCartStore` for items + `isHydrated` (Plan 01 surface). The FAB click that was a no-op in Plan 04 is now functional — clicking opens the drawer.
- Display fields (brand, name, price, size, type) are resolved FRESH from `inventory.json` on every render via `getProductById` + `getVariant` per CONTEXT D-06. Only `{product_id, variant_id, quantity}` is persisted (Plan 01 partialize); the drawer never reads brand/name/price from localStorage. A two-step null filter with a TypeScript type predicate (`(x): x is ResolvedLine => x !== null`) keeps stale items from crashing the drawer and excludes them from totals as a bonus.
- Empty state condition is `!isHydrated || resolved.length === 0`. Until persist rehydrates (Plan 04's `<CartHydration />` flips `isHydrated`), the drawer shows `<CartDrawerEmpty />` rather than a stale list. Same hydration-safe pattern as Plan 04's badge counter — keeps SSR/CSR markup consistent (CART-11 / D-07).
- Totals computed from `resolved` (the filtered list), NOT raw `items` — so a stale item that gets filtered out also drops out of the displayed total. No "phantom euros" from items rendered nowhere.
- Three-section flex layout uses `flex flex-col p-0 gap-0` to override shadcn's default `gap-4` + `p-4` on `<SheetContent>` — otherwise the header/list/footer would have surplus padding and the body's `flex-1 overflow-y-auto` wouldn't fill 100% of the remaining height. Header and footer get their own `px-5 py-4` padding.
- Copy CTA placeholder is functional disabled markup with `data-slot="copy-cta-placeholder"` deterministic locator + locked Greek+emoji label `📋 Αντιγραφή για Messenger`. Plan 06's executor will grep that attribute and either flip `disabled` + add `onClick`, or extract the button to its own component. Drawer is screenshot-complete in Plan 5 — the disabled visual is correct for the empty-cart case (COPY-08).
- Drawer close button (X) is auto-rendered by shadcn `<SheetContent>` with English `Close` sr-only label. UI-SPEC §Copywriting Contract specifies `Κλείσιμο` for the close aria-label. This gap lives inside the shadcn primitive (`components/ui/sheet.tsx`), not in the cart-drawer composition — touching the shadcn primitive is out of scope for Plan 5 and Phase 1's a11y minimums are still met (Radix Sheet provides role=dialog, aria-modal, focus trap, Esc close). Documented as a known minor copywriting gap; Phase 3 UI Polish (UI-09) is the natural home for the fix.
- Plan 5's `<CartDrawerItem />` is a `'use client'` Component (has remove onClick); `<CartDrawerEmpty />` is a Server Component (purely presentational). Both ship in the client bundle because the parent `<CartDrawer />` is `'use client'`, but the separation reflects intent.

### Decisions logged from Plan 01-04

- `useCartUiStore` (Plan 04) is a SEPARATE Zustand store from `useCartStore` (Plan 01). Rationale: drawer state must not persist across refresh; Plan 05 wires its `<Sheet>` against this ephemeral store without touching the persistent cart store. Contract locked: `isDrawerOpen: boolean`, `openDrawer()`, `closeDrawer()`, `setDrawerOpen(open: boolean)`. No `persist` middleware.
- `<CartHydration />` (Plan 04) is a side-effect-only client component returning `null` and calling `useCartStore.setHydrated()` once inside a `useEffect`. Mounted FIRST inside `<body>` of `app/layout.tsx` (before `{children}`) so any child reading `isHydrated` sees the right ordering. CART-11 contract satisfied — no React hydration mismatch.
- `<StickyCartButton />` (Plan 04) renders ALWAYS (D-12) — only the badge is conditional (`isHydrated && count > 0`). Badge counter = SUM of quantities via `items.reduce((sum, i) => sum + i.quantity, 0)` (CAT-09), NOT `items.length`. Dynamic Greek aria-label via `formatItemCount` (`Άνοιγμα καλαθιού` empty / `Άνοιγμα καλαθιού — {N} τεμάχια` filled).
- Sticky FAB click handler calls `useCartUiStore.openDrawer()`. In Plan 04 this is effectively a no-op (no `<Sheet>` consumer yet); Plan 05 will add the `<Sheet>` without touching `<StickyCartButton />`.
- `AddToCartButton` (Plan 04) function signature `({ productId, variantId, disabled })` was PRESERVED — verified via `git show 9d81339:app/product/[id]/add-to-cart-button.tsx` vs current file. Plan 03's `<VariantRow>` import continues to work unchanged.
- Toast wording locked: `Προστέθηκε: {brand} — {name}` (with em-dash U+2014) fired via `toast.success()` from the `sonner` package (NOT from `@/components/ui/sonner` — that exports the configured `<Toaster />`, not `toast()`). The toast fires ONLY when the cart's variant quantity actually increased — silent stock clamp (D-11) produces no toast, awaiting CART-04's warning toast in Phase 2.
- Per D-10 the cart drawer does NOT auto-open after add — toast + sticky badge are the only feedback so the user can keep browsing.
- Before/after quantity snapshot inside the click handler uses `useCartStore.getState()` (imperative reads) — no extra subscribe, no extra re-render. `const itemsBefore = useCartStore.getState().items` then `.find(...)` keeps the call on a single line so the plan's `useCartStore.getState` ≥ 2 grep gate passes literally (Rule-3 deviation: reformat to satisfy literal grep contract, documented in 01-04-SUMMARY.md).

### Decisions logged from Plan 01-03

- `app/product/[id]/add-to-cart-button.tsx` was NOT modified by Plan 03. The Plan 01 client-island signature `AddToCartButton({productId, variantId, disabled})` is honored as a frozen contract for the duration of Wave 3 (Plan 04 owns the toast enrichment of that file's internals). Verified via `git log --name-only` on commits ea59ef9..HEAD.
- Stock=0 visual stub is a server-side disabled shadcn `<Button>` with `aria-disabled` + UI-SPEC §6 disabled classes, NOT `<AddToCartButton disabled>`. Rationale: keeps the row a Server Component path when stock=0 (no unused client island per row), and Plan 04's toast enrichment is naturally bypassed for stock=0 — correct behavior.
- Hero image on product detail uses `priority` (true) for above-the-fold LCP pre-load + explicit `sizes="(min-width: 768px) 768px, 100vw"` matching the `max-w-3xl` container width. External URLs work because `next.config.ts` has `images: { unoptimized: true }` per D-23.
- Variants `<ul>` uses `space-y-0` because each `<li>` already carries `border-t border-neutral-200 py-3` — the first row's top border is the clean ruled-list look UI-SPEC §5a calls for.
- `<div className="h-16" aria-hidden />` bottom spacer (64px) on the product detail page reserves safe-area for Plan 04's sticky cart FAB (bottom-4 right-4, h-14 w-14) so the last variant row is never obscured on small viewports.
- 404 CTA uses `<Button asChild>` wrapping `<Link href="/">` — keeps DOM nesting clean (no `<button>` inside `<a>`) and aligns with UI-SPEC §6 primary button anatomy.
- The Plan 03 surface is final for Phase 1 (`back-link.tsx`, `variant-row.tsx`, `product-detail.tsx`, `app/not-found.tsx`). Plan 04 will only modify `app/product/[id]/add-to-cart-button.tsx` internals to add toast feedback.

### Decisions logged from Plan 01-02

- shadcn Badge primitive (`components/ui/badge.tsx`) extended with three Phase 1 tone variants — `sealed` (bg-emerald-50 text-emerald-700), `opened` (bg-amber-50 text-amber-800), `decant` (bg-blue-50 text-blue-700) — registered inside the existing `badgeVariants` cva block. All six original shadcn variants (default/secondary/destructive/outline/ghost/link) preserved unchanged. Plans 03 and 05 can write `<Badge variant="sealed">` directly without re-registering.
- `<VariantBadge type={t} />` is a thin wrapper that renders `<Badge variant={t}>{formatTypeLabel(t)}</Badge>` — NOT a raw `<span>`. UI-SPEC §4 contract honored.
- Product card image aspect ratio locked to 1:1 (`aspect-square`) per Claude's Discretion in CONTEXT. Final pick recorded for Plan 03's product detail hero, which uses the same UI-SPEC §5 rule (`aspect-square md:aspect-[4/5]`).
- Catalog price label rule (locked for Plans 03+): `από {n}€` when ≥2 variants are in stock; bare `{n}€` when exactly 1 in stock; defensive fallback to cheapest-known price when everything is out of stock. Rule lives in `components/product-card.tsx → priceLabel(product)`.
- Badge order on product cards is deterministic — sealed → opened → decant — via a fixed ordering array. Prevents Set-iteration order surprises across renders.
- `lib/format.ts` exports exactly three pure functions — `formatPrice`, `formatTypeLabel`, `formatItemCount`. `formatTypeLabel` uses an exhaustive switch (no `default`) so TypeScript flags any future `VariantType` addition. Locked contract for Plans 03–06.

### Decisions logged from Plan 01-01

- Scaffolded Next.js manually (folder name 'marios shop' contains a space, which trips create-next-app's npm-name validator). Hand-rolled package.json/tsconfig/next.config.ts match Next.js 15 defaults exactly.
- Geist font loaded with subsets ['latin', 'latin-ext'] (NOT 'greek' — Google Fonts' Geist does not ship a 'greek' subset; available subsets: cyrillic, latin, latin-ext). Greek glyphs render via browser system-font fallback. Documented as Rule-1 deviation in 01-01-SUMMARY.md. If Plans 02/03 surface visual mismatch, a follow-up plan can swap to a font that ships Greek subset (e.g. Inter, IBM Plex Sans Greek).
- shadcn `components.json` written directly (modern shadcn CLI no longer accepts `--base-color`; the init flow is preset-based now).
- `lib/utils.ts` and `class-variance-authority` / `clsx` / `tailwind-merge` added manually because the modern shadcn `add` command does not auto-create them when you skip `init`.

### Notes

- Strict no-backend constraint: every phase must remain compatible with `output: 'export'`.
- 90% of traffic is mobile via Facebook — mobile-first is non-negotiable from Phase 1.
- All user-facing strings are in Greek; copy review is part of Phase 3.
- No emoji in UI except the single 📋 on the copy button.
- Seed product locked: `tom-ford-tobacco-vanille` / variant `tvf-50-sealed` (Plan 07 replaces with full 5–6 product seed).
- Client island `app/product/[id]/add-to-cart-button.tsx` exports `AddToCartButton({productId, variantId, disabled})` — locked signature, imported by Plan 03's `<VariantRow>`, internals enriched by Plan 04.
- Catalog surface components (`components/{hero,product-grid,product-card,variant-badge}.tsx`) are all Server Components — no `'use client'`. Plan 03 / Plan 04 client islands are scoped to the smallest leaves only.
- `<Badge>` cva variants `sealed`/`opened`/`decant` (Plan 01-02) are now part of the locked shadcn primitive surface — Plans 03/05 import directly without re-extending.

## Session Continuity

**Next action:** Execute Plan 01-06 (Copy-to-Messenger): build tested `lib/copy-format.ts → formatOrderText(items)` pure function producing the locked Greek order-text format (UI-SPEC §Copy-to-Messenger Format — header `Παραγγελία — Marios Shop`, indexed items with `{TypeLabelGr} {size}ml — {price}€ × {qty} = {subtotal}€`, footer `Σύνολο: {total}€ — {N} τεμάχια`); `lib/copy-clipboard.ts → copyToClipboard(text)` with `navigator.clipboard.writeText` primary + textarea fallback (D-24); `<CopyToMessengerButton />` component that REPLACES the disabled placeholder slot (`data-slot="copy-cta-placeholder"`) in `components/cart-drawer.tsx` footer, gated `disabled={items.length === 0}` per COPY-08; Sonner toasts `Αντιγράφηκε!` (success) / `Δεν αντιγράφηκε — δοκιμάστε ξανά` (error). Preserves the locked label `📋 Αντιγραφή για Messenger` (UI-04 single-emoji rule).

**Last action:** Completed Plan 01-05 Cart Drawer — created `components/cart-drawer-empty.tsx` (lone ShoppingBag + Greek heading/body per UI-SPEC §8d), `components/cart-drawer-item.tsx` (56×56 thumbnail, brand/name/variant row with `<VariantBadge />` + size + qty×price, subtotal, 44×44 Trash2 remove with `Αφαίρεση {brand} {name}` aria-label calling `useCartStore.removeItem`), `components/cart-drawer.tsx` (right-side `<Sheet>` at `w-[85vw] sm:w-[420px]`, header `Καλάθι`, scrollable item list or empty state gated by `!isHydrated || resolved.length === 0`, footer with `Σύνολο`/formatItemCount/total € and a disabled `data-slot="copy-cta-placeholder"` button labeled `📋 Αντιγραφή για Messenger`). Display fields resolved fresh from inventory per render (CONTEXT D-06). Mounted `<CartDrawer />` globally in `app/layout.tsx` after `<StickyCartButton />` (z-40), before `<Toaster />`. `npm run build` exits 0; all 17 grep gates pass; `npx tsc --noEmit` reports zero errors.

**Last session:** 2026-05-11T11:38:22Z
**Stopped at:** Completed 01-05-PLAN.md
**Resume file:** `.planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-06-PLAN.md` (next plan to execute)

**Files of record:**

- `.planning/PROJECT.md` — vision, constraints, decisions
- `.planning/REQUIREMENTS.md` — 65 v1 requirements with phase traceability
- `.planning/ROADMAP.md` — 4 phases with success criteria
- `.planning/config.json` — mode=yolo, granularity=coarse

---
*Initialized: 2026-05-10*
