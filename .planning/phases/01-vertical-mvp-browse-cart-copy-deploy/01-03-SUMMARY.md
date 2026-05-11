---
phase: 01-vertical-mvp-browse-cart-copy-deploy
plan: 03
subsystem: product-detail
tags: [product-detail, variant-row, back-link, 404-polish, ui-spec-§5, ui-spec-§5a, ui-spec-§10, server-components]
one_liner: "Replace bare product detail with hero image + title block + notes + description + variants list (badge/size/price/Add or Εξαντλήθηκε stub), add BackLink, and polish app/not-found.tsx per UI-SPEC §10"
dependency_graph:
  requires:
    - "01-01 (Walking Skeleton): app/product/[id]/page.tsx routing wiring (generateStaticParams + dynamicParams=false), app/product/[id]/add-to-cart-button.tsx client island (locked signature), getProductById/products from lib/inventory.ts, lib/types.ts (Product, Variant)"
    - "01-02 (Catalog): <VariantBadge /> from components/variant-badge.tsx, formatPrice from lib/format.ts, registered <Badge variant='sealed|opened|decant'> on shadcn primitive"
  provides:
    - "components/back-link.tsx → <BackLink /> Server Component (label '← Πίσω στον κατάλογο') with focus ring"
    - "components/variant-row.tsx → <VariantRow productId={…} variant={…} /> Server Component composition: badge + size + price + AddToCartButton (stock>0) or disabled Εξαντλήθηκε button (stock===0)"
    - "components/product-detail.tsx → <ProductDetail product={…} /> Server Component (main container, BackLink, hero image with priority, title block, notes, description_gr, variants <ul>, bottom spacer)"
    - "app/product/[id]/page.tsx rewired to render <ProductDetail product={product} /> while preserving generateStaticParams + dynamicParams=false"
    - "app/not-found.tsx polished per UI-SPEC §10 (min-h-[60vh] flex column, heading + body + <Button asChild><Link /></Button> CTA)"
  affects:
    - "Plan 04 (Cart consumer + toast feedback): modifies app/product/[id]/add-to-cart-button.tsx internals WITHOUT touching variant-row/product-detail/back-link — signature is contract-locked"
    - "Plan 05 (Cart Drawer): no direct surface dependency, but the variant badge + format helpers seen here remain the canonical reference for drawer line items"
tech_stack:
  added: []
  patterns:
    - "Server Components for static-export product detail composition (no 'use client' in product-detail/variant-row/back-link/page)"
    - "Client-island reuse: <VariantRow> Server Component imports the Plan 01 <AddToCartButton> client island — Next.js renders the boundary transparently"
    - "next/image with `fill`, `unoptimized` (D-23), `priority` for above-the-fold hero, and explicit `sizes` for responsive loading"
    - "Stock=0 visual stub: disabled shadcn <Button> with aria-disabled and UI-SPEC §6 disabled-state classes — sits in place of the client island"
    - "<Button asChild> wrapping <Link> for the 404 CTA — preserves Radix Slot routing while applying primary-button styling"
key_files:
  created:
    - "components/back-link.tsx"
    - "components/variant-row.tsx"
    - "components/product-detail.tsx"
    - ".planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-03-SUMMARY.md"
  modified:
    - "app/product/[id]/page.tsx (rewired to render <ProductDetail>; preserved dynamicParams=false + generateStaticParams)"
    - "app/not-found.tsx (replaced minimal version with UI-SPEC §10 surface)"
decisions:
  - "app/product/[id]/add-to-cart-button.tsx was NOT modified by Plan 03. The Plan 01 client-island signature `AddToCartButton({productId, variantId, disabled})` is honored as a frozen contract for the duration of Wave 3 (Plan 04 owns the toast enrichment of that file's internals)."
  - "For the stock=0 visual stub on the product page, Plan 03 renders a disabled shadcn <Button> with `Εξαντλήθηκε` and the UI-SPEC §6 disabled classes (`disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed`) plus aria-disabled — NOT a passing `disabled` prop into <AddToCartButton>. Rationale: the stub is purely visual (no client interactivity, no Zustand wire-up needed) and rendering it server-side keeps the variant row a Server Component path when stock=0. <AddToCartButton> is still the client island when stock>0."
  - "Hero image uses `priority` (true) because it is the above-the-fold dominant element on the product detail page and pre-loading it improves perceived LCP — matches Next.js documented best practice. `sizes` is set to `(min-width: 768px) 768px, 100vw` matching the `max-w-3xl` container width."
  - "<ul> variants list uses `space-y-0` because each <li> already carries `border-t border-neutral-200 py-3` — no extra spacing needed. First row keeps the top border for a clean ruled list look (UI-SPEC §5a)."
  - "`<div className=\"h-16\" aria-hidden />` bottom spacer prevents Plan 04's sticky cart FAB (bottom-4 right-4, 56px tall) from covering the last variant row on mobile. UI-SPEC §Spacing Scale lists `h-16` (64px) as the canonical page-bottom safe-area."
  - "404 CTA uses `<Button asChild>` wrapping `<Link href=\"/\">` instead of a plain styled Link. Reasons: (a) the asChild pattern lets the Link become the Button's underlying element so routing + button styling coexist without DOM nesting issues, (b) it matches UI-SPEC §6 primary button anatomy verbatim (bg-black, h-9 default size, rounded-md), and (c) the spec literally says 'styled as primary button'."
metrics:
  duration_seconds: 148
  completed_date: "2026-05-11T11:23:16Z"
  tasks_completed: 2
  files_created: 3
  files_modified: 2
---

# Phase 1 Plan 3: Product Detail + 404 Polish Summary

Replace the bare product detail skeleton with the real surface per UI-SPEC §5 / §5a — hero image, title block (brand/name/line), notes, description_gr, variants list with badge + size + price + Add button (or disabled `Εξαντλήθηκε` stub for stock=0) — add a `← Πίσω στον κατάλογο` link, and polish `app/not-found.tsx` per UI-SPEC §10 with a primary-button CTA back to home. All four new/edited files are Server Components; the only client island remains the pre-existing `app/product/[id]/add-to-cart-button.tsx` from Plan 01, which Plan 03 imports without modifying.

## Completed Tasks

| Task | Name                                                                       | Commit    | Files                                                                                            |
| ---- | -------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| 1    | Build BackLink + VariantRow + ProductDetail and rewire the route           | `ea59ef9` | components/back-link.tsx, components/variant-row.tsx, components/product-detail.tsx, app/product/[id]/page.tsx |
| 2    | Polish the 404 page per UI-SPEC §10                                        | `6dc86be` | app/not-found.tsx                                                                                |

## Plan 03 Surface — Final Component File Paths

```
components/
  back-link.tsx           -- <BackLink /> Server Component, label '← Πίσω στον κατάλογο'
  variant-row.tsx         -- <VariantRow productId variant /> Server Component, badge+size+price + (AddToCartButton | disabled Εξαντλήθηκε stub)
  product-detail.tsx      -- <ProductDetail product /> Server Component, full UI-SPEC §5 composition
app/
  product/[id]/
    page.tsx              -- Rewired to render <ProductDetail product={product} />; generateStaticParams + dynamicParams=false preserved
    add-to-cart-button.tsx -- (NOT modified by Plan 03 — owned by Plan 01 and enriched by Plan 04)
  not-found.tsx           -- Polished per UI-SPEC §10
```

## Client Island Contract — UNCHANGED by Plan 03

`app/product/[id]/add-to-cart-button.tsx` was created by Plan 01 with the locked signature:

```typescript
export function AddToCartButton(props: {
  productId: string;
  variantId: string;
  disabled?: boolean;
}): JSX.Element;
```

Plan 03 imports this from `@/app/product/[id]/add-to-cart-button` into `components/variant-row.tsx` (stock > 0 branch only) and **does not modify the file**. Plan 04 will enrich the file's internals with Sonner toast feedback while preserving the function signature, so `<VariantRow>` continues to work transparently.

For stock = 0 variants, `<VariantRow>` renders a disabled shadcn `<Button>` server-side instead of invoking the client island — keeps the row composition lean and matches UI-SPEC §5a + §6 disabled state.

## UI-SPEC Compliance

### §5 Product Detail Page
- Container: `max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10` ✓
- Back link at top of page, `text-sm text-neutral-600 hover:text-neutral-950 inline-flex items-center gap-1` ✓
- Hero image: `aspect-square md:aspect-[4/5] rounded-lg overflow-hidden bg-stone-50` with `next/image` + `unoptimized` + `priority` ✓
- Title block: brand (small, neutral-600) → name (`<h1>` text-xl font-semibold) → line ✓
- Notes paragraph, `text-sm text-neutral-600 mt-3` ✓
- Description `text-sm text-neutral-950 leading-normal mt-4 whitespace-pre-line` ✓
- Variants `<ul>` with `mt-8 space-y-0` ✓
- Bottom spacer (`h-16 aria-hidden`) for sticky FAB clearance ✓

### §5a Variant Row
- `<li>` inside the `<ul>` (semantic list per §Accessibility Minimums) ✓
- Layout `flex items-center justify-between gap-3 border-t border-neutral-200 py-3` ✓
- Left cluster: `<VariantBadge>` + size text on top line, price (`text-base font-semibold`) on bottom line ✓
- Right cluster: AddToCartButton (stock>0) or disabled `Εξαντλήθηκε` button (stock=0) ✓
- `aria-disabled` on the stock=0 stub ✓
- `fill_pct` NOT rendered (PROD-07 deferred to Phase 2 per CONTEXT) ✓

### §6 Primary Button (disabled state, stock=0 stub)
- `disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed` ✓
- Label `Εξαντλήθηκε` ✓
- `aria-disabled="true"` ✓

### §10 404 Page
- `min-h-[60vh] flex flex-col items-center justify-center text-center px-6` ✓
- Heading `text-xl font-semibold text-neutral-950` with exact `Δεν βρέθηκε προϊόν` ✓
- Body `text-sm text-neutral-600 mt-2` with exact `Το προϊόν που ψάχνετε δεν υπάρχει ή έχει αφαιρεθεί.` ✓
- CTA `<Button asChild>` wrapping `<Link href="/">` with label `Επιστροφή στον κατάλογο` ✓

### §Copywriting Contract
- Back link: `← Πίσω στον κατάλογο` ✓
- Out-of-stock stub: `Εξαντλήθηκε` ✓
- 404 strings: all three exact matches ✓
- Add CTA: `Προσθήκη` (sourced from the unchanged Plan 01 client island) ✓

## Requirements Covered

- **PROD-01:** `/product/[id]` is statically generated for every product id (preserved from Plan 01 — `generateStaticParams` + `dynamicParams = false`).
- **PROD-02:** Hero image renders from `image_fallback_url` with `next/image` + `unoptimized` + `priority`.
- **PROD-03:** Brand, name, line, notes, and `description_gr` all display in the title-block region.
- **PROD-04:** Variants list shows badge (via `<VariantBadge>`), size in ml, formatted price (via `formatPrice`), and `Προσθήκη` Add button (or `Εξαντλήθηκε` stub).
- **PROD-08:** `← Πίσω στον κατάλογο` link ships and is keyboard-accessible (focus ring + Tab reachable).

## Build Verification

`npm run build` exits 0 and produces:

- `out/index.html` — homepage (unchanged from Plan 02).
- `out/product/tom-ford-tobacco-vanille.html` — full UI-SPEC §5 product detail with:
  - `Tobacco Vanille` (≥1 occurrence) — product name
  - `Πίσω στον κατάλογο` (≥1 occurrence) — back-link label
  - `Σφραγισμένο` (≥1 occurrence) — variant badge label
  - `Προσθήκη` (≥1 occurrence) — Add CTA label
  - `180€` (≥1 occurrence) — variant price
- `out/404.html` — polished 404 with `Δεν βρέθηκε προϊόν` and `Επιστροφή στον κατάλογο`.

All source-level grep gates from the plan's `<verify>` block pass:

| Gate | File | Result |
|------|------|--------|
| `generateStaticParams` | `app/product/[id]/page.tsx` | 1 |
| `<ProductDetail` | `app/product/[id]/page.tsx` | 1 |
| `Εξαντλήθηκε` | `components/variant-row.tsx` | 1 |
| `AddToCartButton` | `components/variant-row.tsx` | 2 (import + JSX) |
| `from '@/app/product/[id]/add-to-cart-button'` | `components/variant-row.tsx` | 1 |
| `description_gr` | `components/product-detail.tsx` | 2 (truthy check + render) |
| `← Πίσω στον κατάλογο` | `components/back-link.tsx` | 1 |
| `Δεν βρέθηκε προϊόν` | `app/not-found.tsx` | 1 |
| `Το προϊόν που ψάχνετε δεν υπάρχει ή έχει αφαιρεθεί.` | `app/not-found.tsx` | 1 |
| `Επιστροφή στον κατάλογο` | `app/not-found.tsx` | 1 |
| `min-h-[60vh]` | `app/not-found.tsx` | 1 |
| `Button asChild` | `app/not-found.tsx` | 1 |

## TypeScript Verification

`npm run build` includes the Next.js type-check step (`Linting and checking validity of types ...`) and reports zero errors. The `<Product>` and `<Variant>` types from `lib/types.ts` flow through `<ProductDetail>` and `<VariantRow>` without any `any` cast or assertion. `<VariantBadge type={variant.type} />` accepts `VariantType` because Plan 02 already registered the matching cva keys on the shadcn `<Badge>` primitive.

## Decisions Made

1. **`add-to-cart-button.tsx` is read-only for Plan 03.** Plan 04 runs in parallel within Wave 3 and owns the internals; Plan 03 only imports the function. Verified by `git log --name-only --oneline ea59ef9..HEAD` — neither Task 1 nor Task 2 touched the file.
2. **Stock=0 stub is server-side disabled `<Button>`, not `<AddToCartButton disabled>`.** The stub never needs the Zustand wire-up, so keeping it as a Server Component avoids spinning up an unused client island per row. Plan 04's toast enrichment is naturally bypassed for stock=0 — correct behavior.
3. **Hero `priority` + `sizes`.** Pre-loads the LCP image and gives the browser an explicit sizes hint matching the `max-w-3xl` container width (≤768px viewport gets 100vw, ≥768px gets 768px). External URLs work because `next.config.ts` has `images: { unoptimized: true }` per D-23.
4. **`<ul>` `space-y-0` + `border-t` per row.** A clean ruled list — every row including the first one has its top border, which UI-SPEC §5a accepts.
5. **64px bottom spacer.** Plan 04 will add a sticky cart FAB at `bottom-4 right-4` (h-14 w-14). 56px tall + 16px margin = 72px of vertical real estate consumed at the page bottom. The `h-16` (64px) spacer prevents the last variant row from being obscured on small viewports; the FAB itself sits on top so the spacer doesn't push it down further.
6. **404 uses `<Button asChild>`** to keep DOM nesting clean: `<a>` becomes the Button — no `<button>` inside `<a>` (which would be invalid HTML).

## Deviations from Plan

None — plan executed exactly as written.

The plan's `<verify>` block for Task 2 expected `test -f out/404.html`; the Next.js 15 static export does produce `out/404.html` at the top level (in addition to the `out/_not-found/` route prerender mentioned in Plan 01's summary). Both paths exist and contain the polished content — no deviation needed.

## Known Stubs

The disabled `Εξαντλήθηκε` button rendered for `variant.stock === 0` is the Phase 1 visual stub for PROD-05. The seed inventory (Plan 01) currently contains zero `stock=0` variants — only `tvf-50-sealed` with `stock: 3`. The stub code path is present, type-checked, and grep-verified, but it cannot be exercised against the live build until Plan 07 replaces the seed with the full multi-variant inventory (which D-02 says must include at least one `stock=0` variant). This is by design — UI-SPEC §5a's visual contract for stock=0 is in place; Plan 07 will surface the rendered output.

## Threat Flags

None — Plan 03 adds no network endpoints, no auth paths, no schema changes, no client-side data fetching. All product-detail rendering happens server-side at build time from the same typed JSON import the rest of Phase 1 uses. The only DOM-input surface is the static `<Link>` and the unchanged `<AddToCartButton>` client island (which Plan 04 owns).

## Manual Smoke-Test Plan (documented per acceptance criteria)

After Plan 04 merges in Wave 3, an end-to-end manual smoke test on `npm run dev` should:

1. From `/`, tap the Tom Ford Tobacco Vanille card → lands on `/product/tom-ford-tobacco-vanille`.
2. Confirm visible: hero image, `Tom Ford` brand line, `Tobacco Vanille` heading, `Private Blend` line, notes paragraph (`tobacco, vanilla, spice`), description_gr paragraph.
3. Variant row shows: `Σφραγισμένο` badge in emerald tone + `50ml` + `180€` + `Προσθήκη` button.
4. Tap `Προσθήκη` → after Plan 04 lands, a Sonner toast surfaces; cart store has 1 item. (Before Plan 04 lands, no toast — only the cart store increments.)
5. Tap the `← Πίσω στον κατάλογο` link → returns to `/`.
6. Visit `/product/does-not-exist` → renders the polished 404 with the `Επιστροφή στον κατάλογο` button styled black. Tap returns to `/`.
7. Keyboard-tab through the page → focus ring visible on back-link, Add button, and 404 CTA.

## Self-Check: PASSED

Files asserted by Self-Check:
- FOUND: `components/back-link.tsx`
- FOUND: `components/variant-row.tsx`
- FOUND: `components/product-detail.tsx`
- FOUND: `app/product/[id]/page.tsx` (modified — contains `<ProductDetail` + `generateStaticParams`)
- FOUND: `app/not-found.tsx` (modified — contains `min-h-[60vh]` + `Button asChild`)
- FOUND: `out/index.html` (build artifact)
- FOUND: `out/product/tom-ford-tobacco-vanille.html` (build artifact — contains `Tobacco Vanille`, `Πίσω στον κατάλογο`, `Σφραγισμένο`, `Προσθήκη`, `180€`)
- FOUND: `out/404.html` (build artifact — contains `Δεν βρέθηκε προϊόν`, `Επιστροφή στον κατάλογο`)
- NOT MODIFIED (intentional): `app/product/[id]/add-to-cart-button.tsx` (locked signature preserved for Wave 3 parallel execution)

Commits asserted by Self-Check:
- FOUND: `ea59ef9` (Task 1 — BackLink + VariantRow + ProductDetail + page rewire)
- FOUND: `6dc86be` (Task 2 — 404 polish)
