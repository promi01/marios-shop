---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 01-06-PLAN.md
last_updated: "2026-05-11T14:47:18Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 7
  completed_plans: 6
  percent: 86
---

# State: Marios Shop

**Last updated:** 2026-05-11 (Plan 01-06 complete)

## Project Reference

**Core value:** Facebook visitor (mostly mobile) builds a perfume order list in <30s and copies it for Messenger — no signup, no payment, no friction.
**Mode:** mvp (yolo)
**Granularity:** coarse
**Structure:** Vertical MVP (every phase delivers end-to-end user-visible slice)
**Tech stack:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui, static export, Vercel deploy.

## Current Position

Phase: 1 (Vertical MVP — Browse, Cart, Copy, Deploy) — EXECUTING
Plan: 7 of 7 (Plans 01–06 complete, ready for Plan 07 — Full seed inventory + Vercel deploy)

- **Milestone:** v1
- **Phase:** 1 — Vertical MVP — Browse, Cart, Copy, Deploy
- **Plan:** 01-06 Copy-to-Messenger — COMPLETE
- **Status:** Executing Phase 1
- **Progress:** [████████░░] 86%

```
[#---] 0/4 phases complete (Phase 1: 6/7 plans)
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases planned | 4 |
| Phases complete | 0 |
| Plans complete | 6 |
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
| Plan 01-06 duration (seconds) | 249 |
| Plan 01-06 tasks completed | 2 |
| Plan 01-06 files created | 5 |
| Plan 01-06 files modified | 3 |

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

- Execute Plan 07 (Full seed inventory + Vercel production deploy): expand `data/inventory.json` to 5 products covering sealed/opened/decant variants + `stock=0` case + `fill_pct` on an opened variant per CONTEXT D-01/D-02 (Tom Ford, Loewe, Creed, MFK, Nishane); deploy to Vercel with `output: 'export'` (D-23). Checkpoint expected for Vercel auth.

### Blockers

(none)

### Decisions logged from Plan 01-06

- `formatOrderText(items: ResolvedItem[]): string` is the pure-function core (lib/copy-format.ts). Takes a fully-resolved input shape (brand/name/typeLabel/size_ml/price/quantity — NO `fill_pct` per D-25) so unit tests run deterministically in `environment: 'node'` without inventory I/O. The button component owns inventory lookups + Greek-label localization (`formatTypeLabel`).
- 5 vitest unit tests cover: UI-SPEC two-item example byte-equality / singular `1 τεμάχιο` pluralization / decimal price `17.50€` formatting / no `fill_pct` ("Γέμιση") leak for opened type / empty list returns `""`. All pass on first GREEN-phase implementation.
- TDD plan-level red→green cycle implemented as separate commits: `f8a7ec9 test(01-06)` lands vitest setup + failing tests; `9d15826 feat(01-06)` lands the implementation that makes them green; `b15b0b3 feat(01-06)` is the integration step that wires the proven formatter into the UI surface. REFACTOR step skipped — GREEN was already clean.
- Vitest installed as devDep with minimal config (`vitest.config.ts`): `@/*` alias matching tsconfig paths, `environment: 'node'` (no jsdom — pure function tests only), `include: ['lib/**/*.test.ts']`. New scripts: `test` (vitest run, single-pass) and `test:watch` (vitest watch mode).
- `lib/clipboard.ts → copyToClipboard(text): Promise<boolean>` implements both clipboard paths per CONTEXT D-24: primary `navigator.clipboard.writeText` (modern browsers, secure context), fallback off-screen `<textarea>` + `document.execCommand('copy')` (older browsers, non-secure contexts). Try/finally guarantees DOM cleanup. Module-level `'use client'` directive future-proofs against accidental Server Component imports.
- Toast wording is IDENTICAL for both clipboard paths per D-24 — `toast.success('Αντιγράφηκε!')` on success regardless of which path won, `toast.error('Δεν αντιγράφηκε — δοκιμάστε ξανά')` on failure. The caller does not discriminate.
- `<CopyToMessengerButton />` (components/copy-to-messenger-button.tsx) subscribes to `useCartStore.items` + `useCartStore.isHydrated`. `disabled={!isHydrated || items.length === 0}` per COPY-08 + D-07 — same hydration-safe pattern as Plan 04's sticky badge and Plan 05's drawer empty state. Defensive resolution filter `.filter((x): x is ResolvedItem => x !== null)` plus a pre-toast `resolved.length === 0` guard handle the (extreme) race where every persisted item points to a deleted product.
- Plan 05's `<Button data-slot="copy-cta-placeholder">` is REMOVED ENTIRELY from `components/cart-drawer.tsx`, replaced with `<CopyToMessengerButton />` (extract option from Plan 05's documented choices — not the in-place rewire option). The shadcn `<Button>` import is dropped from cart-drawer.tsx because the placeholder was the only use. The new component carries its own `data-slot="copy-cta"` attribute (no longer 'placeholder') for any future locators.
- Per CONTEXT D-25 the `ResolvedItem` interface intentionally OMITS `fill_pct`. TypeScript-level enforcement complements Test 4's runtime contract. Per CONTEXT D-26 prices use `formatPrice` (suffix euro, no space) for all four numeric slots (unit, subtotal, total). Per UI-SPEC §Currency Format decimals only appear when non-integer (`180€` for 180, `17.50€` for 17.5).
- COPY-07 (toast wording with source attribution) is mapped to Phase 2 per ROADMAP Coverage Map. The current toasts (`Αντιγράφηκε!` / `Δεν αντιγράφηκε — δοκιμάστε ξανά`) match UI-SPEC §Copywriting Contract for Phase 1; Phase 2 will add source-discriminating variations.

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

**Next action:** Execute Plan 01-07 (Full seed inventory + Vercel deploy): expand `data/inventory.json` from the locked 1-product seed (`tom-ford-tobacco-vanille` / `tvf-50-sealed`) to 5 products per CONTEXT D-01/D-02 — Tom Ford, Loewe, Creed, MFK, Nishane — covering at least 3 brands, a mix of `sealed`/`opened`/`decant` variants, at least one variant with `stock = 0` (test the "Εξαντλήθηκε" path), and at least one `opened` variant with `fill_pct` (even though Phase 1 doesn't render fill_pct in UI per PROD-07 deferral). Verify `generateStaticParams()` still emits all product pages, then deploy to Vercel with `output: 'export'` (D-23). Vercel auth checkpoint expected.

**Last action:** Completed Plan 01-06 Copy-to-Messenger — created `lib/copy-format.ts → formatOrderText(items)` pure function producing the UI-SPEC §Copy-to-Messenger Format text (`Παραγγελία — Marios Shop` header + numbered items with `{brand} — {name}` first line and 3-space indented `{TypeLabelGr} {size_ml}ml — {price}€ × {qty} = {subtotal}€` second line, blank lines between items, `Σύνολο: {total}€ — {N} τεμάχια` footer). Created `lib/copy-format.test.ts` with 5 vitest tests proving the format contract (UI-SPEC two-item example byte-match, singular pluralization, decimal prices, no fill_pct leak, empty list — all pass). Created `lib/clipboard.ts → copyToClipboard(text): Promise<boolean>` with `navigator.clipboard.writeText` primary + off-screen textarea fallback per D-24. Created `components/copy-to-messenger-button.tsx` — client component reading cart from `useCartStore`, resolving inventory + Greek labels via `formatTypeLabel` (D-25), calling `formatOrderText` then `copyToClipboard`, firing `toast.success('Αντιγράφηκε!')` / `toast.error('Δεν αντιγράφηκε — δοκιμάστε ξανά')`. Replaced Plan 05's `<Button data-slot="copy-cta-placeholder">` in `components/cart-drawer.tsx` footer with `<CopyToMessengerButton />`; dropped the unused `<Button>` import. Installed vitest as devDep + `test` / `test:watch` scripts + `vitest.config.ts` (`@/*` alias, node env, lib/**/*.test.ts include). TDD plan-level cycle implemented as two commits — `test(01-06)` for the RED gate (failing tests), `feat(01-06)` for the GREEN gate (implementation makes them pass). `npm test` exits 0 (5/5 tests pass); `npm run build` exits 0 (5 static pages export cleanly); `npx tsc --noEmit` reports zero errors; all 18 grep gates pass. Phase 1's user-visible vertical is now complete end-to-end: browse → product → add → drawer → copy → paste.

**Last session:** 2026-05-11T14:47:18Z
**Stopped at:** Completed 01-06-PLAN.md
**Resume file:** `.planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-07-PLAN.md` (next plan to execute)

**Files of record:**

- `.planning/PROJECT.md` — vision, constraints, decisions
- `.planning/REQUIREMENTS.md` — 65 v1 requirements with phase traceability
- `.planning/ROADMAP.md` — 4 phases with success criteria
- `.planning/config.json` — mode=yolo, granularity=coarse

---
*Initialized: 2026-05-10*
