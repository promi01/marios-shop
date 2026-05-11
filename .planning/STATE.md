---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 01-04-PLAN.md
last_updated: "2026-05-11T11:31:09Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 7
  completed_plans: 4
  percent: 57
---

# State: Marios Shop

**Last updated:** 2026-05-11 (Plan 01-04 complete)

## Project Reference

**Core value:** Facebook visitor (mostly mobile) builds a perfume order list in <30s and copies it for Messenger — no signup, no payment, no friction.
**Mode:** mvp (yolo)
**Granularity:** coarse
**Structure:** Vertical MVP (every phase delivers end-to-end user-visible slice)
**Tech stack:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui, static export, Vercel deploy.

## Current Position

Phase: 1 (Vertical MVP — Browse, Cart, Copy, Deploy) — EXECUTING
Plan: 5 of 7 (Plans 01–04 complete, ready for Plan 05 — Cart Drawer)

- **Milestone:** v1
- **Phase:** 1 — Vertical MVP — Browse, Cart, Copy, Deploy
- **Plan:** 01-04 Cart Consumer Wiring + Toast — COMPLETE
- **Status:** Executing Phase 1
- **Progress:** [██████░░░░] 57%

```
[#---] 0/4 phases complete (Phase 1: 4/7 plans)
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases planned | 4 |
| Phases complete | 0 |
| Plans complete | 4 |
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

- Execute Plan 05 (Cart Drawer): build `<CartDrawer />` `<Sheet side="right">` consuming `useCartUiStore.isDrawerOpen` from Plan 04, render header (`Καλάθι`) + scrollable item list (with `<CartDrawerItem />` line items: brand/name/variant/qty/subtotal/remove icon) + footer summary (`Σύνολο` + `N τεμάχια`) + empty state + Copy CTA placeholder slot (filled by Plan 06).

### Blockers

(none)

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

**Next action:** Execute Plan 01-05 (Cart Drawer): build `<CartDrawer />` Sheet right-side drawer consuming `useCartUiStore.isDrawerOpen` from Plan 04; render header (`Καλάθι`) + scrollable item list with `<CartDrawerItem />` (brand/name/variant + size + qty × price + subtotal + remove icon) + footer summary (`Σύνολο` + `N τεμάχια` + total €) + empty state + Copy CTA placeholder slot (filled by Plan 06).

**Last action:** Completed Plan 01-04 Cart Consumer Wiring + Toast — created `lib/cart-ui-store.ts` (ephemeral Zustand store with `isDrawerOpen` + `openDrawer`/`closeDrawer`/`setDrawerOpen`), `components/cart-hydration.tsx` (side-effect-only `<CartHydration />` calling `setHydrated()` once), `components/sticky-cart-button.tsx` (56×56 black FAB at `fixed bottom-4 right-4 z-40` with sum-of-quantity badge hidden when count=0 or pre-hydration, dynamic Greek aria-label, click → `openDrawer()`). Mounted both globally in `app/layout.tsx`. Enriched `app/product/[id]/add-to-cart-button.tsx` with Sonner `toast.success("Προστέθηκε: {brand} — {name}")` on successful add (silent stock clamp per D-11 → no toast); function signature `AddToCartButton({ productId, variantId, disabled })` preserved verbatim so Plan 03's `<VariantRow>` continues to work. `npm run build` exits 0; all 20 grep gates pass.

**Last session:** 2026-05-11T11:31:09Z
**Stopped at:** Completed 01-04-PLAN.md
**Resume file:** `.planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-05-PLAN.md` (next plan to execute)

**Files of record:**

- `.planning/PROJECT.md` — vision, constraints, decisions
- `.planning/REQUIREMENTS.md` — 65 v1 requirements with phase traceability
- `.planning/ROADMAP.md` — 4 phases with success criteria
- `.planning/config.json` — mode=yolo, granularity=coarse

---
*Initialized: 2026-05-10*
