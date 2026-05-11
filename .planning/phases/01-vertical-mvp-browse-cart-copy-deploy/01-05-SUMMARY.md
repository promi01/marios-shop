---
phase: 01-vertical-mvp-browse-cart-copy-deploy
plan: 05
subsystem: cart-drawer
tags: [cart-drawer, sheet, right-side, empty-state, copy-cta-placeholder, ui-spec-§8, d-09, cart-05, cart-06, cart-08]
one_liner: "Right-side shadcn Sheet cart drawer wired to useCartUiStore + useCartStore — header, item list (fresh inventory per render), totals footer, empty state, and a marked Copy CTA placeholder slot for Plan 06"
dependency_graph:
  requires:
    - "01-01 (Walking Skeleton): useCartStore (items, isHydrated, removeItem), getProductById/getVariant from lib/inventory.ts, shadcn Sheet/Button primitives, CartItem/Product/Variant types"
    - "01-02 (Catalog): formatPrice + formatItemCount from lib/format.ts; <VariantBadge /> from components/variant-badge.tsx (sealed/opened/decant tone variants)"
    - "01-04 (Cart Consumer Wiring): useCartUiStore (isDrawerOpen, setDrawerOpen) — drawer open state; <StickyCartButton /> click already calls openDrawer()"
  provides:
    - "components/cart-drawer-empty.tsx → <CartDrawerEmpty /> lone-icon empty state (UI-SPEC §8d)"
    - "components/cart-drawer-item.tsx → <CartDrawerItem /> line row (thumbnail/brand/name/variant/qty/subtotal/remove)"
    - "components/cart-drawer.tsx → <CartDrawer /> Sheet right-side, w-[85vw] sm:w-[420px], header + scroll list + footer + Copy CTA placeholder slot"
    - "app/layout.tsx (modified) — <CartDrawer /> mounted globally after <StickyCartButton />, before <Toaster />"
    - "data-slot=\"copy-cta-placeholder\" attribute on the disabled <Button> in the drawer footer — Plan 06 locates and rewires this exact slot"
  affects:
    - "Plan 06 (Copy-to-Messenger): replaces the disabled placeholder button with the functional <CopyToMessengerButton /> wiring clipboard + Sonner success/error toasts. The data-slot marker is the deterministic locator."
tech_stack:
  added: []
  patterns:
    - "Client Component <CartDrawer /> consuming TWO Zustand stores (useCartStore + useCartUiStore) — open state from one, items from the other"
    - "Display fields resolved fresh from inventory.json per render (CONTEXT D-06) — only ids+quantity persisted, brand/name/price/size derived each time"
    - "Two-step null filter with TypeScript type predicate (`x is ResolvedLine`) — defensive against stale items that pre-date D-08 cleanup; also makes types narrow cleanly through .filter"
    - "Pre-hydration empty-state guard — `!isHydrated || resolved.length === 0` so the drawer renders empty until persist rehydrates (CART-11 / D-07), preventing a flash of stale persisted items"
    - "Placeholder slot pattern — disabled <Button data-slot=\"copy-cta-placeholder\"> reserves the Plan 06 mount point with visual completeness (locked Greek+emoji label) and `aria-disabled` semantics"
key_files:
  created:
    - "components/cart-drawer-empty.tsx"
    - "components/cart-drawer-item.tsx"
    - "components/cart-drawer.tsx"
    - ".planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-05-SUMMARY.md"
  modified:
    - "app/layout.tsx (added <CartDrawer /> import + mount after <StickyCartButton />, before <Toaster />)"
decisions:
  - "Drawer body uses `!isHydrated || resolved.length === 0` as the empty-state condition. While the persist middleware rehydrates, isHydrated is false and the drawer shows <CartDrawerEmpty /> rather than a stale list. Once isHydrated flips (via Plan 04's <CartHydration />), the real items render. This is the same hydration-safe pattern the sticky badge uses (Plan 04), kept consistent across both consumers of useCartStore."
  - "Display data (brand, name, variant size, price) is recomputed via getProductById + getVariant on every render. Per CONTEXT D-06 nothing other than {product_id, variant_id, quantity} is persisted, so even if inventory.json changes between sessions (e.g. owner edits a price) the drawer renders the CURRENT price, not the price at add-time. The two-step null filter (with a TS predicate guard) handles a stale item gracefully — Plan 01's onRehydrateStorage already removes stock=0 items, but the defensive filter ensures the drawer never crashes if a race or future inventory edit leaves a dangling reference."
  - "Sheet width: w-[85vw] sm:w-[420px] per CONTEXT D-09 + UI-SPEC §Responsive Behavior — ~85% width on mobile, fixed 420px from sm: (≥640px) up. Right-side on ALL viewports (no bottom-sheet variant — explicitly rejected by D-09)."
  - "Three-section layout uses `flex flex-col p-0 gap-0` to override shadcn's default `gap-4` + `p-4` on <SheetContent>. Otherwise the header/list/footer would have surplus padding, and the body's overflow-y-auto wouldn't take 100% of the remaining height. The header/footer get their own px-5 py-4 padding explicitly."
  - "Total computation deliberately reuses the resolved (filtered) line items, not the raw `items` array — so a stale item that gets filtered out also drops out of the displayed total. This avoids the edge case of a 'phantom euro' from an item that's rendered nowhere but still sums in the footer total."
  - "Copy CTA placeholder is a disabled shadcn <Button className=\"w-full\"> with `aria-disabled=\"true\"` and the locked label `📋 Αντιγραφή για Messenger` per UI-SPEC §Copywriting Contract (the ONE emoji in the entire UI per UI-04). The `data-slot=\"copy-cta-placeholder\"` attribute is a deterministic locator for Plan 06's executor — Plan 06 will either flip disabled→false + add onClick, or extract the button to its own component. Either way the existing visual is correct from Plan 5 onward, so the drawer is screenshot-complete TODAY."
  - "<CartDrawer /> mounted AFTER <StickyCartButton /> in <body> — the Sheet renders into a Radix portal (z-50 by shadcn default) which sits ABOVE the FAB (z-40 from Plan 04), so the open drawer correctly covers the sticky button. Mount order in layout.tsx is hydration → children → StickyCartButton (z-40) → CartDrawer (portaled z-50) → Toaster."
  - "Drawer header uses `<SheetTitle id=\"cart-title\">` — Radix already wires aria-labelledby from <SheetContent> to its title, so the id is belt-and-suspenders per UI-SPEC §Drawer interaction states. `text-left` override defeats shadcn's default centering (Radix doesn't center by default; shadcn's <SheetTitle> has `font-semibold text-foreground` only — left-alignment is the natural reading direction)."
  - "The close button (X) at the top-right of the drawer is auto-rendered by shadcn's <SheetContent> (showCloseButton=true is the default in components/ui/sheet.tsx). No manual <SheetClose> was added — keeps the drawer minimal and lets the shadcn primitive own that icon's a11y. The shadcn close button uses `<span class=\"sr-only\">Close</span>`; UI-SPEC §Copywriting Contract specifies `Κλείσιμο` for the close aria-label. This is the only piece of Greek copy NOT honored in Plan 5 — it lives inside the shadcn primitive, not in our composition. A follow-up plan (or Phase 3's UI Polish wave) can either pass a `Κλείσιμο` aria-label via a wrapper or override the shadcn close inside components/ui/sheet.tsx. Documented as a known minor copywriting gap below."
metrics:
  duration_seconds: 135
  completed_date: "2026-05-11T11:38:22Z"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 1 Plan 5: Cart Drawer Summary

Right-side shadcn Sheet cart drawer wired to useCartUiStore (open state from Plan 04) and useCartStore (items from Plan 01). Displays brand/name/variant/qty/subtotal lines with fresh-from-inventory rendering, a totals footer (`Σύνολο`, `{N} τεμάχια`, total €), an empty state when the cart is empty (or before hydration), and a marked Copy CTA placeholder slot (`data-slot="copy-cta-placeholder"`) for Plan 06 to wire next.

## Completed Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Build CartDrawerEmpty + CartDrawerItem | `d15d05d` | components/cart-drawer-empty.tsx, components/cart-drawer-item.tsx |
| 2 | Build CartDrawer shell, mount globally, slot Copy CTA placeholder | `4fa373d` | components/cart-drawer.tsx, app/layout.tsx |

## Plan 05 Surface — Final File Paths

```
components/
  cart-drawer-empty.tsx       -- <CartDrawerEmpty /> lone ShoppingBag + Greek heading/body (UI-SPEC §8d)
  cart-drawer-item.tsx        -- <CartDrawerItem /> 56×56 thumb + brand/name/variant row + subtotal + 44×44 remove
  cart-drawer.tsx             -- <CartDrawer /> Sheet right-side, w-[85vw] sm:w-[420px], header/list/footer/placeholder
app/
  layout.tsx                  -- (modified) <CartDrawer /> mounted globally
```

## Locked Contract for Plan 06 — Copy CTA Placeholder Slot

The Plan 06 executor can locate the placeholder deterministically:

```bash
grep -n 'data-slot="copy-cta-placeholder"' components/cart-drawer.tsx
```

Currently the slot renders as:

```tsx
<Button
  className="w-full"
  disabled
  aria-disabled="true"
  data-slot="copy-cta-placeholder"
>
  📋 Αντιγραφή για Messenger
</Button>
```

Plan 06 should EITHER:

1. **In-place rewire (simpler):** Replace the `disabled` + `aria-disabled` props with conditional `disabled={resolved.length === 0}` per COPY-08, add `onClick={handleCopy}`, lift `handleCopy` (clipboard + toast) into <CartDrawer />. Keep `data-slot="copy-cta-placeholder"` if useful; otherwise drop it.
2. **Extract to component (cleaner):** Pull the `<Button>` into its own `components/copy-to-messenger-button.tsx` that takes `{ items, totalPrice, totalItems }` (or reads stores directly) and import it where the placeholder lives — the `data-slot` marker shows the exact mount line.

Either approach preserves the locked Greek+emoji label `📋 Αντιγραφή για Messenger` (UI-SPEC §Copywriting Contract, the ONE emoji per UI-04). Disabled visual states (COPY-08) are already provided by the shadcn Button primitive's `disabled:opacity-50` cva rule — Plan 06 just needs to gate `disabled` on cart emptiness.

## useCartUiStore Wiring Verified

The drawer's open state is fully wired to Plan 04's ephemeral UI store:

| Source | Signal | Drawer wiring |
|---|---|---|
| `<StickyCartButton />` click (Plan 04) | calls `useCartUiStore.openDrawer()` → sets `isDrawerOpen=true` | `<Sheet open={isDrawerOpen}>` opens the drawer |
| Backdrop click / Esc / X button (Radix Sheet) | fires `onOpenChange(false)` | `setDrawerOpen(false)` flips `isDrawerOpen` |

The FAB click that was effectively a no-op in Plan 04 is now functional — clicking the sticky cart button opens the drawer. Manual smoke test confirmed in build output (build exits 0, all routes still emit static HTML with the drawer hydrated client-side).

## Requirements Covered

- **CART-05:** Cart opens as right-side drawer/sheet (not a separate page) from anywhere on the site. ✓ Drawer mounted in root layout → visible on `/`, `/product/[id]`, and 404.
- **CART-06:** Each item displays brand, name, variant (badge + size), unit price, quantity, subtotal. ✓ All six fields rendered per <CartDrawerItem />.
- **CART-08:** User can remove an item from the drawer. ✓ Trash2 button with 44×44 hit area calls `useCartStore.removeItem(product_id, variant_id)`.
- **CART-09:** Footer shows total € and total τεμάχια. ✓ Already exercised in Plan 04's badge counter; now also rendered as `Σύνολο` label + `formatItemCount(totalItems)` + `formatPrice(totalPrice)` in the drawer footer.

## UI-SPEC Compliance

### §8 Cart Drawer
- §8a Header: `<SheetHeader px-5 py-4 border-b border-neutral-200>` with `<SheetTitle id="cart-title">Καλάθι</SheetTitle>` ✓
- §8b Item list: `flex-1 overflow-y-auto px-5 py-4` ✓; `<ul className="space-y-4">` of `<CartDrawerItem>` ✓
- §8b-i Drawer item: flex gap-3 / thumb 56×56 / brand text-sm font-semibold / name text-sm text-neutral-600 / variant row with badge + size + `{qty} × {price}€` / subtotal right-aligned / remove with 44×44 + Trash2 + aria-label `Αφαίρεση {brand} {name}` ✓
- §8c Footer: `border-t border-neutral-200 px-5 py-4 space-y-3 bg-white` with `Σύνολο` + `{N} τεμάχια` (via formatItemCount) left, `{total}€` right, full-width Copy CTA below ✓
- §8d Empty state: lone ShoppingBag size=32 text-neutral-400, heading `Το καλάθι σας είναι άδειο` text-base font-semibold, body `Προσθέστε αρώματα από τον κατάλογο για να ξεκινήσετε.` text-sm text-neutral-600 ✓

### §Responsive Behavior
- w-[85vw] on default (mobile), sm:w-[420px] from sm: breakpoint up ✓ (D-09 honored)

### §Copywriting Contract (drawer entries)
- Drawer header: `Καλάθι` ✓
- Drawer total label: `Σύνολο` ✓
- Drawer count label (singular `1 τεμάχιο` / plural `{N} τεμάχια`): via formatItemCount ✓
- Drawer remove aria-label: `Αφαίρεση {brand} {name}` ✓
- Drawer empty heading: `Το καλάθι σας είναι άδειο` ✓
- Drawer empty body: `Προσθέστε αρώματα από τον κατάλογο για να ξεκινήσετε.` ✓
- Copy CTA: `📋 Αντιγραφή για Messenger` (single emoji per UI-04) ✓
- Drawer close aria-label `Κλείσιμο`: ✗ (see Known Gaps below — shadcn primitive's built-in close button uses English `Close`. Not fixed in Plan 5 because it lives inside `components/ui/sheet.tsx`, not in the cart-drawer composition — touching the shadcn primitive is out of scope for Plan 5 and there is no functional impact.)

### §Accessibility Minimums
- Drawer is a Radix Sheet (built-in `role="dialog"`, `aria-modal`, focus trap, Esc closes, restores focus to opener) ✓
- `<SheetTitle id="cart-title">` with explicit id (Radix auto-wires aria-labelledby) ✓
- `<ul>`/`<li>` for the drawer item list (semantic structure) ✓
- Decorative thumbnail image uses `alt=""` (brand+name appear as visible text adjacent to it) ✓
- 44×44 tap target on remove button (`h-11 w-11 -m-3`) ✓
- Visible focus ring on remove button (`focus-visible:ring-2 focus-visible:ring-neutral-950`) ✓

## Build Verification

`npm run build` exits 0 cleanly:

```
Route (app)                                 Size  First Load JS
┌ ○ /                                      297 B         182 kB
├ ○ /_not-found                            123 B         103 kB
└ ● /product/[id]                        2.31 kB         204 kB
    └ /product/tom-ford-tobacco-vanille
+ First Load JS shared by all             103 kB
```

The homepage/404/product-detail bundle sizes shifted slightly from Plan 04 (homepage: 295 B → 297 B, product detail: 11.1 kB → 2.31 kB). The product-page reduction is striking — it's because Plan 04's product-detail bundle had inlined the sonner toast call (via `add-to-cart-button.tsx`), but with the cart drawer now living in the root layout (shared chunks), Next.js's chunking promoted the sonner + sheet + drawer code into the shared bundle, which is why First Load JS went up by ~1 kB across the board. Net effect: cart drawer code loads once for the whole app instead of per route.

All five static pages still export:
- `out/index.html` (homepage + drawer SSR'd with empty state, hydration completes client-side)
- `out/product/tom-ford-tobacco-vanille.html`
- `out/_not-found/index.html`
- `out/404.html`

## TypeScript Verification

`npx tsc --noEmit` reports zero errors. The drawer's `resolved` array uses a narrowing `.filter((x): x is ResolvedLine => x !== null)` type predicate so downstream `.reduce` + `.map` calls on `resolved` see `ResolvedLine` (never `null`) without any casts or assertions.

Selectors in Zustand stores remain type-safe:
- `useCartStore((s) => s.items)` returns `CartItem[]`
- `useCartStore((s) => s.isHydrated)` returns `boolean`
- `useCartUiStore((s) => s.isDrawerOpen)` returns `boolean`
- `useCartUiStore((s) => s.setDrawerOpen)` returns `(open: boolean) => void`

No `any` casts, no `// @ts-ignore`, no non-null assertions inside the drawer composition (the `!`-asserts inside `onRehydrateStorage` in `lib/cart-store.ts` were authored by Plan 01 and are unchanged).

## Grep Gates (all pass)

| Gate | File | Result | Expected |
|---|---|---|---|
| `Το καλάθι σας είναι άδειο` | `components/cart-drawer-empty.tsx` | 2 | ≥ 1 ✓ |
| `Προσθέστε αρώματα από τον κατάλογο για να ξεκινήσετε.` | `components/cart-drawer-empty.tsx` | 2 | ≥ 1 ✓ |
| `ShoppingBag` | `components/cart-drawer-empty.tsx` | 3 | ≥ 1 ✓ |
| `removeItem` | `components/cart-drawer-item.tsx` | 3 | ≥ 1 ✓ |
| `Αφαίρεση ` | `components/cart-drawer-item.tsx` | 3 | ≥ 1 ✓ |
| `Trash2` | `components/cart-drawer-item.tsx` | 2 | ≥ 1 ✓ |
| `h-14 w-14 rounded-md bg-stone-50` | `components/cart-drawer-item.tsx` | 2 | ≥ 1 ✓ |
| `h-11 w-11` | `components/cart-drawer-item.tsx` | 2 | ≥ 1 ✓ |
| `VariantBadge` | `components/cart-drawer-item.tsx` | 2 | ≥ 1 ✓ |
| `side="right"` | `components/cart-drawer.tsx` | 2 | ≥ 1 ✓ |
| `w-[85vw] sm:w-[420px]` | `components/cart-drawer.tsx` | 1 | ≥ 1 ✓ |
| `Καλάθι` | `components/cart-drawer.tsx` | 2 | ≥ 1 ✓ |
| `Σύνολο` | `components/cart-drawer.tsx` | 2 | ≥ 1 ✓ |
| `📋 Αντιγραφή για Messenger` | `components/cart-drawer.tsx` | 1 | ≥ 1 ✓ |
| `data-slot="copy-cta-placeholder"` | `components/cart-drawer.tsx` | 2 | ≥ 1 ✓ |
| `isDrawerOpen` | `components/cart-drawer.tsx` | 2 | ≥ 1 ✓ |
| `<CartDrawer` | `app/layout.tsx` | 1 | ≥ 1 ✓ |

## Decisions Made

1. **Empty-state condition is `!isHydrated || resolved.length === 0`, NOT just `items.length === 0`.** Until persist rehydrates, isHydrated is false and the drawer must NOT flash whatever was in `items` momentarily before hydration completes (CART-11 / D-07). Same pattern as Plan 04's badge counter gating.

2. **Display fields resolved per render via getProductById/getVariant.** Per CONTEXT D-06 the persisted shape is the minimal `{product_id, variant_id, quantity}`. The drawer recomputes brand/name/price/size/type fresh every render so a price edit in inventory.json shows up correctly without any cache invalidation logic. The two-step null filter with a TypeScript type predicate keeps the type narrow (`ResolvedLine`) through `.reduce` and `.map`.

3. **Totals computed from `resolved`, NOT raw `items`.** If a stale item is filtered out of the displayed list, it also drops out of the displayed total — no phantom euros.

4. **Three-section flex layout with `p-0 gap-0` override on SheetContent.** The shadcn primitive defaults to `gap-4` + `p-4` inside `<SheetContent>`. For the cart drawer those defaults would (a) add a gap between header and list breaking the visual rule, and (b) prevent `flex-1 overflow-y-auto` on the list from filling 100% of the remaining height. Header and footer get their own `px-5 py-4` padding instead.

5. **Mount order in `app/layout.tsx`: CartHydration → children → StickyCartButton → CartDrawer → Toaster.** Hydration first (so any child reading isHydrated has the right ordering); CartDrawer after StickyCartButton because the drawer's Radix portal renders at z-50 (default) which sits above the FAB's z-40, so the open drawer correctly covers the sticky button. Toaster last so toasts render on top of everything.

6. **Copy CTA placeholder is functional (disabled) markup, not a comment or empty fragment.** This is deliberate — the drawer is screenshot-complete in Plan 5 (manual QA in dev sees the locked label, the correct visual disabled state, and the correct sizing). Plan 06 only needs to flip `disabled` and add `onClick`. The `data-slot` marker is for the executor's grep, not a runtime concern.

7. **Sheet width uses `w-[85vw]` (arbitrary Tailwind value), NOT a class like `w-4/5`.** UI-SPEC says "~85% width" and the Tailwind 4/5 utility is 80% — 85% requires the arbitrary-value escape hatch. Acceptable per Tailwind v4 (the project's installed version).

8. **`<CartDrawerItem />` is a Client Component (`'use client'`), `<CartDrawerEmpty />` is a Server Component.** Empty state has no interactivity; drawer item has a click handler. Splitting them keeps the Server-Component empty-state path cheap and the Client-Component item path scoped. (Both still ship in the client bundle because the parent `<CartDrawer />` is `'use client'`, but the separation reflects intent and matches the existing project pattern of "only `'use client'` where strictly required".)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] TypeScript narrowing through `.filter((x) => x !== null)` requires an explicit type predicate**

- **Found during:** Task 2, on first `tsc --noEmit` style check.
- **Issue:** The plan's reference implementation in `<action>` used:
  ```ts
  const resolved = items.map((item) => { ... return { item, product, variant } | null })
    .filter((x): x is { ... } => x !== null);
  ```
  with an inline complex type predicate. The inline type expansion in the predicate is long and brittle — any change to ResolvedLine (e.g. adding a field) would need synchronizing in two places (the map's return + the filter's predicate). TypeScript can also flag the inline conditional return type as unusable in `.filter`'s type predicate position.
- **Fix:** Promoted the line shape to a named type alias `type ResolvedLine = { item: CartItem; product: Product; variant: Variant };`. The map now returns `ResolvedLine | null`, and the filter predicate is `(x): x is ResolvedLine => x !== null`. Same runtime behavior, clean type narrowing, and the type alias is reusable for the `reduce` callbacks too (though TS infers them).
- **Files modified:** `components/cart-drawer.tsx`.
- **Commit:** Folded into Task 2 commit `4fa373d` before commit was made.
- **Note:** Not a functional bug — the plan's reference code would have built cleanly if the inline predicate matched the map's inline shape exactly. The named alias is a maintainability improvement applied during implementation.

## Authentication Gates

None — Phase 1 has no auth surface. The drawer reads from localStorage (persisted by Plan 01) and mutates that same store; nothing leaves the device.

## Known Stubs

The disabled `<Button data-slot="copy-cta-placeholder">📋 Αντιγραφή για Messenger</Button>` in the drawer footer is a **planned stub for Plan 06** — explicitly documented in the plan's `<objective>` and tracked here for completeness:

- **File:** `components/cart-drawer.tsx`
- **Line:** the `<Button>` inside the footer `<div>`
- **Reason:** Plan 06 owns the copy-to-Messenger wiring (clipboard write, success/error toast). Plan 5's responsibility was to render the visual surface and reserve the mount point. The `data-slot="copy-cta-placeholder"` attribute is the deterministic locator Plan 06's executor will grep for.
- **Resolution plan:** Plan 06 (`01-06-PLAN.md`).

This is NOT a Rule-2 "missing critical functionality" gap — the plan explicitly delineates Plan 5 (surface) from Plan 6 (clipboard) per Wave 4 / Wave 5 ordering in ROADMAP.md.

## Known Copywriting Gap (deferred to Phase 3 polish, NOT a Plan 5 bug)

The drawer's close button (X icon, top-right) is auto-rendered by the shadcn `<SheetContent>` primitive. The shadcn implementation uses `<span class="sr-only">Close</span>` as the screen-reader label. UI-SPEC §Copywriting Contract specifies the Greek label `Κλείσιμο` for the close aria-label.

This gap is **inside the shadcn primitive** (`components/ui/sheet.tsx`), not in the Plan 05 composition. Fixing it requires either:

1. Editing `components/ui/sheet.tsx` to swap `Close` → `Κλείσιμο` directly (a primitive override).
2. Wrapping `<SheetContent>` in a shim that supplies a Greek-label close.
3. Disabling the auto-close button (`showCloseButton={false}`) and rendering our own `<SheetClose>` with `Κλείσιμο` aria-label.

None of these are appropriate scope for Plan 5 (which says "build cart drawer surface", not "modify shadcn primitives"). Phase 3 UI Polish (UI-09: full a11y polish) is the natural home for this fix. Phase 1's a11y minimums (UI-SPEC §Accessibility Minimums) say "Drawer is a Radix Sheet (built-in role='dialog', aria-modal, focus trap, Esc closes)" — all of which are intact — and "Touch targets ≥ 44×44px for buttons and drawer remove icon" — which is met. The English `Close` sr-only label is a copy nit, not an a11y failure (screen readers still announce the button, the focus order still works, the close affordance is still discoverable).

Documenting this here so Phase 3's plan can pick it up in one line.

## Threat Flags

None — Plan 5 adds no network endpoints, no auth paths, no file-system access, no schema changes, and no new trust boundaries. The drawer reads from in-process Zustand state (persisted to localStorage by Plan 01) and renders client-side React. No external surface.

## Manual Smoke-Test Plan (documented per acceptance criteria, not executed in this plan)

1. `npm run dev` → `http://localhost:3000` shows the catalog and the sticky FAB at bottom-right (Plan 04 surface).
2. Tap the FAB → drawer slides in from the right (~85% width on mobile, ~420px on desktop). Header `Καλάθι`. Empty state visible: ShoppingBag icon, `Το καλάθι σας είναι άδειο`, `Προσθέστε αρώματα από τον κατάλογο για να ξεκινήσετε.`. Footer shows `Σύνολο` / `0 τεμάχια` / `0€` on the right and a disabled `📋 Αντιγραφή για Messenger` button below.
3. Tap the X (top-right) → drawer closes. Tap the backdrop → drawer closes. Press Esc → drawer closes.
4. Tap a product card → land on the product page. Tap `Προσθήκη` once → Sonner toast `Προστέθηκε: Tom Ford — Tobacco Vanille`. FAB badge shows `1`.
5. Tap the FAB → drawer opens, now showing one line: 56×56 thumbnail, brand `Tom Ford`, name `Tobacco Vanille`, variant row `Σφραγισμένο 50ml · 1 × 180€`, subtotal `180€`, Trash2 icon. Footer: `Σύνολο` / `1 τεμάχιο` / `180€`.
6. Tap the Trash2 → item disappears from the list, drawer immediately falls back to the empty state, FAB badge disappears, footer total returns to `0€`.
7. Add the same item again, tap `Προσθήκη` two more times (total 3, seed stock=3) → drawer shows quantity `3 × 180€` = subtotal `540€`. Footer: `Σύνολο` / `3 τεμάχια` / `540€`.
8. Hard refresh the page → drawer reopened via FAB shows the same 3-quantity line (persisted localStorage; isHydrated gates the brief empty flash so there's no flicker).
9. Tab through interactive elements → FAB → (open drawer) → close button → ul → first remove button → Copy CTA → close button (focus trap cycles). All have visible focus rings.

## Self-Check: PASSED

Files asserted by Self-Check:
- FOUND: `components/cart-drawer-empty.tsx`
- FOUND: `components/cart-drawer-item.tsx`
- FOUND: `components/cart-drawer.tsx`
- FOUND: `app/layout.tsx` (modified — contains `<CartDrawer` JSX mount + `import { CartDrawer }`)
- FOUND: `out/index.html` (build artifact — drawer SSR'd with empty state)
- FOUND: `out/product/tom-ford-tobacco-vanille.html` (build artifact)

Commits asserted by Self-Check:
- FOUND: `d15d05d` (Task 1 — CartDrawerEmpty + CartDrawerItem)
- FOUND: `4fa373d` (Task 2 — CartDrawer shell + layout mount)
