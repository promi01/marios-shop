---
phase: 01-vertical-mvp-browse-cart-copy-deploy
plan: 02
subsystem: catalog
tags: [catalog, hero, product-grid, product-card, variant-badge, format-helpers, shadcn-badge-extension, ui-spec-§4]
one_liner: "Replace bare homepage with real catalog surface — hero band, responsive 1/2/3/4 grid, product cards with tone-badged variants — and register sealed/opened/decant variants on the shadcn Badge primitive"
dependency_graph:
  requires:
    - "01-01 (Walking Skeleton): shadcn Badge primitive, lib/types.ts (VariantType, Product), lib/inventory.ts (typed products), lib/utils.ts (cn helper)"
  provides:
    - "lib/format.ts → formatPrice, formatTypeLabel, formatItemCount (consumed by Plans 03–06)"
    - "components/ui/badge.tsx with three Phase 1 tone variants registered in cva (sealed/opened/decant) — Plans 03/05 can write `<Badge variant=\"sealed\">` directly"
    - "components/variant-badge.tsx → <VariantBadge type={...} /> wrapper around shadcn Badge"
    - "components/hero.tsx → Hero band (UI-SPEC §1)"
    - "components/product-grid.tsx → Responsive grid (UI-SPEC §2)"
    - "components/product-card.tsx → Product card with image/brand/name/price/badges (UI-SPEC §3)"
    - "app/page.tsx composing Hero + ProductGrid"
  affects:
    - "Plan 03 (Product Detail): consumes <VariantBadge /> and lib/format.ts (formatPrice for variant rows)"
    - "Plan 04 (Cart consumer): consumes lib/format.ts (formatPrice, formatItemCount)"
    - "Plan 05 (Cart Drawer): consumes <VariantBadge /> and lib/format.ts in DrawerItem"
    - "Plan 06 (Copy-to-Messenger): consumes lib/format.ts (formatPrice, formatItemCount, formatTypeLabel for the order text)"
tech_stack:
  added: []
  patterns:
    - "Server Components for catalog rendering (no `use client` in hero/grid/card/page)"
    - "shadcn primitive extension by adding cva variant keys, NOT by rewriting the file (Edit tool surgical change)"
    - "next/image with `unoptimized` + `fill` + `sizes` for external URL images under output: 'export'"
    - "Deterministic badge order (sealed → opened → decant) via fixed ordering array to avoid JSX reordering across renders"
key_files:
  created:
    - "lib/format.ts"
    - "components/variant-badge.tsx"
    - "components/hero.tsx"
    - "components/product-grid.tsx"
    - "components/product-card.tsx"
    - ".planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-02-SUMMARY.md"
  modified:
    - "components/ui/badge.tsx (added sealed/opened/decant variants to cva block; existing default/secondary/destructive/outline/ghost/link preserved)"
    - "app/page.tsx (full rewrite — replaces bare list with <Hero /> + <main><ProductGrid /></main>)"
decisions:
  - "Card image aspect ratio is 1:1 (`aspect-square`) per Claude's Discretion granted in CONTEXT — easier with mixed fragrance bottle proportions than 4:3, and matches UI-SPEC §3 anatomy. Final pick recorded for downstream plans."
  - "Tone badge classes match D-15 exactly: sealed `bg-emerald-50 text-emerald-700`, opened `bg-amber-50 text-amber-800`, decant `bg-blue-50 text-blue-700`. Each variant also carries `border-transparent` (defeats the shadcn base `border border-transparent` cleanly) and `font-normal` (overrides shadcn base `font-medium` per UI-SPEC §4 typography)."
  - "Existing shadcn variants `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` preserved unchanged in the cva block. Only three new keys appended — Plans 03–06 can continue to use `<Badge variant=\"secondary\">` etc. if needed."
  - "Price label rule (`από {n}€` vs `{n}€`) keyed on **in-stock variant count**, not total variant count. A product with two variants where one is stock=0 displays the bare `{lowest_in_stock_price}€` (not `από`). Defensive fallback when everything is out of stock shows the cheapest known price without the prefix."
  - "Badge ordering: sealed → opened → decant. Deterministic, prevents Set-iteration order surprises in future renders."
  - "`<VariantBadge>` is a thin wrapper that renders `<Badge variant={type}>{formatTypeLabel(type)}</Badge>` from `@/components/ui/badge`. NOT a raw `<span>`. UI-SPEC §4 contract honored."
metrics:
  duration_seconds: 131
  completed_date: "2026-05-11T11:17:07Z"
  tasks_completed: 2
  files_created: 5
  files_modified: 2
---

# Phase 1 Plan 2: Catalog Surface Summary

Replace the bare homepage with the real catalog surface — hero band, responsive product grid, and product cards with tone-badged variants — and register the three Phase 1 variant-type tone variants (`sealed`/`opened`/`decant`) on the shadcn `<Badge>` primitive's cva block so downstream plans can use `<Badge variant="sealed">` directly.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend Badge with tone variants + format helpers + VariantBadge | `6da4dbc` | lib/format.ts, components/ui/badge.tsx, components/variant-badge.tsx |
| 2 | Build Hero + ProductGrid + ProductCard, wire into app/page.tsx | `c8749b6` | components/hero.tsx, components/product-grid.tsx, components/product-card.tsx, app/page.tsx |

## Catalog Component File Paths (Quick Reference)

```
components/
  hero.tsx                  -- Hero band, bg-stone-50, py-10 md:py-12, wordmark + tagline
  product-grid.tsx          -- max-w-7xl, grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6
  product-card.tsx          -- <Link> wrapper, next/image (aspect-square + unoptimized), brand/name/price/badges
  variant-badge.tsx         -- <Badge variant={type}>{formatTypeLabel(type)}</Badge>
  ui/
    badge.tsx               -- shadcn primitive EXTENDED with sealed/opened/decant tone variants
lib/
  format.ts                 -- formatPrice, formatTypeLabel, formatItemCount
app/
  page.tsx                  -- <Hero /> + <main><ProductGrid products={products} /></main>
```

## Price Label Rule (LOCKED for Plans 03+)

The price line on a product card follows this rule, implemented in `components/product-card.tsx → priceLabel(product)`:

1. **`≥ 2` variants in stock:** `από ${formatPrice(lowestInStockPrice)}` — e.g. `από 18€`.
2. **Exactly `1` variant in stock:** `formatPrice(lowestInStockPrice)` — e.g. `180€` (no prefix).
3. **Everything out of stock (defensive fallback):** `formatPrice(min(all variant prices))` — bare price, no `από` prefix.

`από` is the only Greek prefix used; it is hardcoded in `product-card.tsx` (not a helper) because it is the only "multi-variant cheapest" copy in Phase 1.

## shadcn Badge Variants — Final Registered Set

`components/ui/badge.tsx` now exposes these variants via the `badgeVariants` cva block. **Plans 03 and 05 can write `<Badge variant="sealed">` directly without re-registering — they have already been registered here.**

| Variant key | Classes |
|-------------|---------|
| `default` | `bg-primary text-primary-foreground [a&]:hover:bg-primary/90` (preserved from shadcn) |
| `secondary` | `bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90` (preserved) |
| `destructive` | `bg-destructive text-white …` (preserved) |
| `outline` | `border-border text-foreground …` (preserved) |
| `ghost` | `[a&]:hover:bg-accent …` (preserved) |
| `link` | `text-primary underline-offset-4 …` (preserved) |
| **`sealed`** | `border-transparent bg-emerald-50 text-emerald-700 font-normal` — label "Σφραγισμένο" |
| **`opened`** | `border-transparent bg-amber-50 text-amber-800 font-normal` — label "Ανοιγμένο" |
| **`decant`** | `border-transparent bg-blue-50 text-blue-700 font-normal` — label "Decant" |

`<VariantBadge type={t} />` in `components/variant-badge.tsx` renders `<Badge variant={t}>{formatTypeLabel(t)}</Badge>`. The Greek label is supplied by `formatTypeLabel` from `lib/format.ts`. Border-transparent + font-normal override defeats the shadcn base classes cleanly without touching them.

## `lib/format.ts` — Locked Contract for Plans 03–06

```typescript
import type { VariantType } from '@/lib/types';

export function formatPrice(n: number): string;        // 180 → "180€"; 179.5 → "179.50€"; 180.0 → "180€"
export function formatTypeLabel(type: VariantType): string;  // exhaustive switch (no default), Greek labels
export function formatItemCount(n: number): string;    // 1 → "1 τεμάχιο"; 3 → "3 τεμάχια"; 0 → "0 τεμάχια"
```

- `formatPrice` integer detection uses `Number.isInteger` — handles `180.0` correctly as integer.
- `formatTypeLabel` switch is exhaustive over `VariantType` ('sealed' | 'opened' | 'decant'); no `default` clause means TypeScript will flag any future `VariantType` addition.
- `formatItemCount(0)` returns `"0 τεμάχια"` (the plural form — Greek treats zero as plural for this noun).

## Build Verification

`npm run build` exits 0 and produces:

- `out/index.html` — homepage with:
  - Wordmark `Marios Shop` (1 occurrence)
  - Tagline `Επιλεγμένα αρώματα από τη συλλογή μου` (1 occurrence)
  - Seed product brand `Tom Ford` (1 occurrence)
  - Seed product name `Tobacco Vanille` (1 occurrence)
  - Price `180€` (1 occurrence; single in-stock variant so no `από` prefix)
  - Badge label `Σφραγισμένο` (1 occurrence — seed has 1 sealed variant with stock=3)
- `out/product/tom-ford-tobacco-vanille.html` — unchanged from Plan 01 (Plan 03 replaces it).
- `out/_not-found/index.html` — unchanged from Plan 01.

Build output: `Compiled successfully in 4.0s`, no warnings, no errors. All five static pages exported.

## TypeScript Verification

`npx tsc --noEmit` reports zero errors. The cva extension is type-safe — `VariantProps<typeof badgeVariants>` now accepts the three new `sealed`/`opened`/`decant` keys for the `variant` prop, and `<Badge variant={type}>` in `variant-badge.tsx` (where `type: VariantType`) compiles cleanly because `VariantType`'s union members exactly match the new cva keys.

## All UI-SPEC §4 Constraints Honored

- [x] `<VariantBadge>` is built on shadcn `<Badge variant=...>` (NOT a raw `<span>`).
- [x] Three tone variants registered via cva.
- [x] Visible text (Greek label) carries semantic meaning — no color-only badges.
- [x] `rounded-full px-2 py-0.5 text-xs` — inherited from shadcn base, matches UI-SPEC §4 anatomy.
- [x] No icon inside the badge (Phase 1 keeps badges minimal).
- [x] Static — no hover/active states on the variant badge itself (the parent `<Link>` card handles hover state).

## Deviations from Plan

None — plan executed exactly as written.

The plan's "if shadcn used `rounded-md` instead of `rounded-full`" contingency did not trigger; the installed `components/ui/badge.tsx` already uses `rounded-full` per shadcn's new-york style defaults. Similarly the "if shadcn uses `<div>`" contingency: the installed file uses `<span>` (or `Slot.Root` when `asChild`), so UI-SPEC §4's `<span>` recommendation is honored without any change.

## Known Stubs

None — every component is fully wired to inventory data. No placeholders, no "coming soon" text, no `=[]` defaults flowing to render.

## Threat Flags

None — Plan 02 adds no network endpoints, no auth paths, no schema or trust-boundary changes. All catalog rendering is server-side at build time from a typed JSON import.

## Manual Smoke-Test Plan (documented per acceptance criteria)

1. `npm run dev` → http://localhost:3000 shows:
   - `bg-stone-50` hero band with `Marios Shop` and `Επιλεγμένα αρώματα από τη συλλογή μου`.
   - One product card on mobile (single column), with the Tom Ford Tobacco Vanille image, brand, name, `180€`, and a `Σφραγισμένο` badge in emerald tone.
2. Resize to 640px+ → grid becomes 2 cols. 768px+ → 3 cols. 1024px+ → 4 cols.
3. Tap the card → navigates to `/product/tom-ford-tobacco-vanille` (existing Plan 01 page; Plan 03 replaces).
4. Keyboard-tab onto the card → visible focus ring (`ring-2 ring-neutral-950 ring-offset-2`).

## Self-Check: PASSED

Files asserted by Self-Check:
- FOUND: `lib/format.ts`
- FOUND: `components/ui/badge.tsx` (modified — contains `sealed:`, `opened:`, `decant:` keys + `bg-emerald-50`, `bg-amber-50`, `bg-blue-50`)
- FOUND: `components/variant-badge.tsx` (contains `<Badge variant`, imports from `@/components/ui/badge`, NO `<span>`)
- FOUND: `components/hero.tsx` (contains `bg-stone-50`, `Επιλεγμένα αρώματα από τη συλλογή μου`)
- FOUND: `components/product-grid.tsx` (contains `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`, `max-w-7xl`)
- FOUND: `components/product-card.tsx` (contains `aspect-square`, `shadow-sm`, `από `, `image_fallback_url`, `next/image`)
- FOUND: `app/page.tsx` (contains `<Hero`, `<ProductGrid`)
- FOUND: `out/index.html` (build artifact — contains `Marios Shop`, `Επιλεγμένα αρώματα`, `Σφραγισμένο`, `Tom Ford`, `Tobacco Vanille`, `180€`)

Commits asserted by Self-Check:
- FOUND: `6da4dbc` (Task 1 — Badge extension + format helpers + VariantBadge)
- FOUND: `c8749b6` (Task 2 — Hero + ProductGrid + ProductCard + app/page.tsx)
