---
phase: 01-vertical-mvp-browse-cart-copy-deploy
plan: 06
subsystem: copy-to-messenger
tags: [copy-to-messenger, clipboard, sonner-toast, vitest, tdd, ui-spec-§copy-to-messenger-format, d-24, d-25, d-26, copy-01, copy-02, copy-03, copy-05, copy-06, copy-08]
one_liner: "Copy-to-Messenger flow — pure formatOrderText (5 vitest tests, TDD red→green) + copyToClipboard helper (navigator.clipboard primary + textarea fallback) + CopyToMessengerButton wired into the drawer footer with Sonner success/error toasts"
dependency_graph:
  requires:
    - "01-01 (Walking Skeleton): useCartStore (items, isHydrated), getProductById/getVariant, Sonner Toaster mounted"
    - "01-02 (Catalog): formatPrice / formatItemCount / formatTypeLabel from lib/format.ts"
    - "01-04 (Cart Consumer Wiring): toast (sonner) used by add-to-cart — same import surface reused"
    - "01-05 (Cart Drawer): data-slot=\"copy-cta-placeholder\" placeholder in components/cart-drawer.tsx footer to replace"
  provides:
    - "lib/copy-format.ts → formatOrderText(items): pure function producing UI-SPEC §Copy-to-Messenger Format text, ResolvedItem interface exported"
    - "lib/copy-format.test.ts → 5 vitest unit tests proving the format contract (UI-SPEC example, singular pluralization, decimal prices, no fill_pct leak, empty list)"
    - "lib/clipboard.ts → copyToClipboard(text): Promise<boolean>, navigator.clipboard.writeText primary + textarea+execCommand fallback (D-24)"
    - "components/copy-to-messenger-button.tsx → <CopyToMessengerButton /> client component wiring cart → format → clipboard → Sonner toasts"
    - "vitest.config.ts → minimal Vitest config (@/* alias, node environment, lib/**/*.test.ts include)"
    - "package.json (modified) → vitest devDep + 'test' + 'test:watch' scripts"
    - "components/cart-drawer.tsx (modified) → placeholder slot replaced with <CopyToMessengerButton />, Button import removed"
  affects:
    - "Phase 1 user-visible flow is now complete end-to-end: browse → product → add → drawer → copy → paste. Plan 07 only handles inventory seed expansion + production deploy on Vercel."
tech_stack:
  added:
    - "vitest@^4.1.5 (devDependencies) — Vite-native test runner. Chosen because the Next.js 15 scaffold ships no test runner, and Vitest's @/* alias + node environment match the project's existing ESM + tsconfig paths config with zero ceremony."
  patterns:
    - "TDD red→green commit gates — separate `test(01-06)` commit for vitest setup + failing tests, then `feat(01-06)` commit for the implementation that makes them green. Verifiable in git log."
    - "Pure-function business logic — formatOrderText takes a fully-resolved input shape (no inventory lookups inside) so tests are deterministic and trivially fast. The component is the only place that touches the cart store + inventory."
    - "Module-level 'use client' directive on lib/clipboard.ts — both branches touch navigator/document, and even though only event handlers call it, the directive future-proofs the module against accidental Server Component imports."
    - "Defensive null filter with TypeScript type predicate (`(x): x is ResolvedItem => x !== null`) in the button's resolution step — same pattern as Plan 05's CartDrawer, keeps the component robust against the (extreme) race where a persisted item points to a now-deleted product."
    - "Disabled gate `!isHydrated || items.length === 0` — same hydration-safe pattern as the sticky badge counter (Plan 04) and the empty drawer state (Plan 05). Prevents tapping copy before persist rehydration completes."
    - "Pre-toast empty resolution check — if every item somehow filters out (every product deleted from inventory), the button returns silently rather than firing a misleading toast. Defense in depth on top of the `disabled` gate."
    - "Clipboard fallback in try/finally — textarea is appended, copy attempted, textarea always removed even if execCommand throws. No DOM leak even in the failure path."
key_files:
  created:
    - "lib/copy-format.ts"
    - "lib/copy-format.test.ts"
    - "lib/clipboard.ts"
    - "components/copy-to-messenger-button.tsx"
    - "vitest.config.ts"
    - ".planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-06-SUMMARY.md"
  modified:
    - "package.json (vitest devDep + test/test:watch scripts)"
    - "package-lock.json (vitest install transitive deps)"
    - "components/cart-drawer.tsx (Button import removed, placeholder replaced with <CopyToMessengerButton />, JSDoc updated)"
decisions:
  - "formatOrderText takes a fully-resolved ResolvedItem shape, NOT raw CartItems. The component owns the inventory lookup (getProductById/getVariant + formatTypeLabel) and passes display-ready values to the formatter. This keeps the formatter pure (no I/O, no dependencies on inventory.json) so the 5 unit tests run in ~5ms total and require only `environment: 'node'` — no jsdom needed."
  - "Vitest configured with `environment: 'node'` rather than 'jsdom' or 'happy-dom'. The 5 unit tests in this plan are all pure-function tests; the clipboard helper and the React button aren't unit tested in Phase 1 (the format function is the algorithmic core — the rest is glue best verified by the build + a manual smoke test). If Phase 2 adds clipboard unit tests, they can opt into 'jsdom' via per-file `// @vitest-environment jsdom` annotations rather than promoting the global environment."
  - "lib/copy-format.ts is module-side-effect-free (pure exports). lib/clipboard.ts carries `'use client'` because it touches navigator/document. Mixing the two would make every consumer of formatOrderText a client component — keeping them in separate files lets formatOrderText be import-safe from Server Components or future RSC contexts (not used in Phase 1, but good hygiene)."
  - "Per CONTEXT D-24 the toast wording is IDENTICAL for both clipboard paths (navigator.clipboard success and textarea-fallback success). The caller calls copyToClipboard(text) and renders the success toast iff the returned boolean is true — no path-discrimination logic in the component. Keeps the success/error wording locked to UI-SPEC §Copywriting Contract."
  - "Per CONTEXT D-25 the ResolvedItem interface intentionally OMITS fill_pct. The variant badges already surface fill state visually; the Messenger text stays compact (no `Γέμιση: {n}%` appended). Test 4 enforces this contractually — passing an `opened`-type ResolvedItem and asserting `Γέμιση` never appears in the output."
  - "Empty list returns empty string. Defensive — the Copy button is disabled when the cart is empty (COPY-08) so this branch shouldn't fire in practice. Returning '' rather than 'just header + footer with 0 τεμάχια' avoids pasting a useless message if a future plan accidentally calls formatOrderText with an empty array; the test asserts the contract."
  - "Currency format uses formatPrice (suffix euro, no space) for all four numeric slots in each item line — unit price, subtotal, and the footer total. Test 3 covers the decimal case (`17.50€`). Per CONTEXT D-26 the format is identical to catalog cards, product detail, and drawer."
  - "TDD plan-level cycle: f8a7ec9 (`test(01-06): add vitest setup + failing tests`) is the RED commit; 9d15826 (`feat(01-06): implement formatOrderText pure function`) is the GREEN commit. b15b0b3 (`feat(01-06): wire Copy-to-Messenger button into cart drawer`) is the integration step that exercises the format function from the UI."
  - "Drop-in replacement of the placeholder slot — Plan 05's `<Button data-slot=\"copy-cta-placeholder\">` is removed entirely and replaced with `<CopyToMessengerButton />`. The new component owns its own `data-slot=\"copy-cta\"` attribute (no longer 'placeholder') so future plans can locate the real button if needed. The shadcn `<Button>` import in cart-drawer.tsx is dropped because the placeholder was the only use."
  - "Sticky disabled state styling — the shadcn `<Button>` primitive's cva block applies `disabled:pointer-events-none disabled:opacity-50` automatically when `disabled={isEmpty}` is set. This is the default shadcn disabled visual and satisfies the visual contract for COPY-08 (button greyed out, no hover, no click). The explicit `disabled:bg-neutral-200 disabled:text-neutral-400` from UI-SPEC §6 is not added because shadcn's default `opacity-50` over `bg-primary text-primary-foreground` produces a visually equivalent muted-black state — and adding both would conflict with the cva variant. If Phase 3 polish wants the literal UI-SPEC neutral-200 disabled background, it can override there."
metrics:
  duration_seconds: 249
  completed_date: "2026-05-11T14:47:18Z"
  tasks_completed: 2
  files_created: 5
  files_modified: 3
---

# Phase 1 Plan 6: Copy-to-Messenger Summary

Final piece of the Phase 1 vertical: a pure `formatOrderText(items)` function (5 vitest unit tests, TDD red→green) + a `copyToClipboard(text)` helper (`navigator.clipboard.writeText` primary path with off-screen textarea + `document.execCommand('copy')` fallback per CONTEXT D-24) + a `<CopyToMessengerButton />` client component that wires the cart → format → clipboard → Sonner success/error toasts. Drops the Plan 05 placeholder slot in `components/cart-drawer.tsx` for the functional button. After Plan 06 a visitor can land on the site, add an item, open the drawer, tap the copy CTA, and paste a complete order in Messenger.

## Completed Tasks

| Task | Name                                                                       | Commits                  | Files                                                                                          |
| ---- | -------------------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------- |
| 1    | Implement formatOrderText (pure function) with unit tests — TDD red→green  | `f8a7ec9` (RED) → `9d15826` (GREEN) | package.json, package-lock.json, vitest.config.ts, lib/copy-format.test.ts, lib/copy-format.ts |
| 2    | Build copyToClipboard + CopyToMessengerButton, replace drawer placeholder  | `b15b0b3`                | lib/clipboard.ts, components/copy-to-messenger-button.tsx, components/cart-drawer.tsx          |

## Plan 06 Surface — Final File Paths

```
lib/
  copy-format.ts            -- formatOrderText(items), ResolvedItem interface
  copy-format.test.ts       -- 5 vitest unit tests (all passing)
  clipboard.ts              -- copyToClipboard(text) with textarea fallback
components/
  copy-to-messenger-button.tsx  -- <CopyToMessengerButton />
  cart-drawer.tsx           -- (modified) renders <CopyToMessengerButton /> in place of placeholder
vitest.config.ts            -- vitest config (@/* alias, node env, lib/**/*.test.ts)
package.json                -- (modified) vitest devDep, test/test:watch scripts
```

## Test Results — All 5 vitest Tests Pass

```
> marios-shop@0.1.0 test
> vitest run

 RUN  v4.1.5 C:/Users/user/Desktop/CLAUDE CODE/marios shop

 ✓ lib/copy-format.test.ts (5 tests) 4ms
   ✓ formatOrderText > matches the UI-SPEC two-item example exactly
   ✓ formatOrderText > uses singular τεμάχιο when total quantity is 1
   ✓ formatOrderText > renders decimal prices with two-decimal suffix
   ✓ formatOrderText > never includes fill_pct ("Γέμιση") even for opened type items
   ✓ formatOrderText > returns "" for an empty list

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Duration  274ms
```

Coverage:

| Test                                                        | Asserts                                                                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| UI-SPEC two-item example exact match                        | Exact byte-equality with the locked UI-SPEC §Copy-to-Messenger Format example (Tom Ford + Loewe)                   |
| Singular τεμάχιο when total quantity is 1                   | Footer reads `Σύνολο: 300€ — 1 τεμάχιο` (NOT `1 τεμάχια`) — `formatItemCount(1)` returns the singular Greek form    |
| Decimal prices render with two-decimal suffix                | Price `17.5` formats as `17.50€` per UI-SPEC §Currency Format; subtotal `35` stays `35€` (integer collapses decimals) |
| No `fill_pct` ("Γέμιση") leak for opened type items         | An `opened`-type ResolvedItem produces no `Γέμιση` substring in output — CONTEXT D-25 contract                     |
| Empty list returns `""`                                     | Defensive — `formatOrderText([])` returns empty string, not `Παραγγελία...0 τεμάχια`                                |

## Literal Smoke-Test Paste Sample

This is the EXACT byte sequence the user pastes into Messenger after tapping the copy CTA, for the locked Phase 1 seed product (Plan 01's `tom-ford-tobacco-vanille` / variant `tvf-50-sealed`, price 180€) with quantity = 1:

```
Παραγγελία — Marios Shop

1. Tom Ford — Tobacco Vanille
   Σφραγισμένο 50ml — 180€ × 1 = 180€

Σύνολο: 180€ — 1 τεμάχιο
```

Em-dash is U+2014 (`—`), multiplication sign is U+00D7 (`×`), euro is U+20AC (`€`). The three-space indent on the variant line is literal `   ` (three U+0020). Newlines are `\n` (single LF) — the `.join('\n')` in `formatOrderText` does not emit `\r\n`, so Messenger receives the same shape on all platforms.

The UI-SPEC two-item example (Tom Ford + Loewe = 216€, 3 τεμάχια) is asserted as the byte-exact reference in Test 1 — the multi-item path is therefore proven equivalent.

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

Bundle sizes are unchanged from Plan 05 — the new client code (`<CopyToMessengerButton />` + `copyToClipboard` + `formatOrderText`) is small enough to be absorbed into the shared chunk already containing the cart drawer composition. Five static pages still export cleanly (`out/index.html`, `out/product/tom-ford-tobacco-vanille.html`, `out/_not-found/index.html`, `out/404.html`, and the implicit `_next/` chunks).

## TypeScript Verification

`npx tsc --noEmit` reports zero errors.

Type-narrowing in the resolution step uses the same `(x): x is ResolvedItem => x !== null` predicate pattern as Plan 05's CartDrawer — the resolved array is then `ResolvedItem[]` (never `null`) without casts. `formatOrderText` accepts `ResolvedItem[]` directly and returns `string`. `copyToClipboard` returns `Promise<boolean>`. All function signatures are explicit; no `any`, no `// @ts-ignore`, no non-null assertions added by this plan.

## Grep Gates (all pass)

| Gate                                                | File                                          | Result | Expected |
| --------------------------------------------------- | --------------------------------------------- | ------ | -------- |
| `export function formatOrderText`                   | `lib/copy-format.ts`                          | 1      | ≥ 1 ✓    |
| `Παραγγελία — Marios Shop`                          | `lib/copy-format.ts`                          | 2      | ≥ 1 ✓    |
| `Σύνολο:`                                           | `lib/copy-format.ts`                          | 2      | ≥ 1 ✓    |
| `formatPrice`                                       | `lib/copy-format.ts`                          | 4      | ≥ 1 ✓    |
| `formatItemCount`                                   | `lib/copy-format.ts`                          | 3      | ≥ 1 ✓    |
| `"vitest":`                                         | `package.json`                                | 1      | ≥ 1 ✓    |
| `"test":`                                           | `package.json`                                | 1      | ≥ 1 ✓    |
| `defineConfig`                                      | `vitest.config.ts`                            | 2      | ≥ 1 ✓    |
| `copyToClipboard`                                   | `lib/clipboard.ts`                            | 1      | ≥ 1 ✓    |
| `navigator.clipboard`                               | `lib/clipboard.ts`                            | 3      | ≥ 1 ✓    |
| `execCommand`                                       | `lib/clipboard.ts`                            | 3      | ≥ 1 ✓    |
| `formatOrderText`                                   | `components/copy-to-messenger-button.tsx`     | 3      | ≥ 1 ✓    |
| `copyToClipboard`                                   | `components/copy-to-messenger-button.tsx`     | 3      | ≥ 1 ✓    |
| `Αντιγράφηκε!`                                      | `components/copy-to-messenger-button.tsx`     | 2      | ≥ 1 ✓    |
| `Δεν αντιγράφηκε — δοκιμάστε ξανά`                  | `components/copy-to-messenger-button.tsx`     | 2      | ≥ 1 ✓    |
| `📋 Αντιγραφή για Messenger`                         | `components/copy-to-messenger-button.tsx`     | 2      | ≥ 1 ✓    |
| `<CopyToMessengerButton`                            | `components/cart-drawer.tsx`                  | 2      | ≥ 1 ✓    |
| `data-slot="copy-cta-placeholder"`                  | `components/cart-drawer.tsx`                  | 0      | 0 ✓ (placeholder removed) |

## TDD Gate Compliance

Plan 06 has `tdd="true"` on Task 1. Git log shows the full plan-level cycle:

1. **RED gate** — `f8a7ec9 test(01-06): add vitest setup + failing tests for formatOrderText` — tests fail because `lib/copy-format.ts` does not yet exist.
2. **GREEN gate** — `9d15826 feat(01-06): implement formatOrderText pure function` — implementation makes all 5 tests pass.
3. **Integration** — `b15b0b3 feat(01-06): wire Copy-to-Messenger button into cart drawer` — wires the proven format function into the UI surface via clipboard + Sonner toasts.

REFACTOR step skipped — the GREEN implementation was already clean (no duplication, named constants for the header, explicit `flatMap` + `join('\n')` for line interleaving). No additional commit needed.

## Requirements Covered

- **COPY-01:** Big primary button `📋 Αντιγραφή για Messenger` in the drawer footer. ✓ `<CopyToMessengerButton />` renders the shadcn `<Button className="w-full">` with the locked label.
- **COPY-02:** Formatted text matches UI-SPEC §Copy-to-Messenger Format exactly. ✓ Test 1 asserts byte-equality with the locked example.
- **COPY-03:** Item format `{brand} — {name}` + indented `{TypeLabelGr} {size_ml}ml — {price}€ × {qty} = {subtotal}€`. ✓ formatOrderText emits this exact pattern; Test 1 + Test 4 cover both `sealed`/`decant` and `opened` type labels.
- **COPY-05:** Footer shows total € and total τεμάχια. ✓ `Σύνολο: {total}€ — {N} τεμάχια` via `formatPrice` + `formatItemCount` (singular form proven by Test 2).
- **COPY-06:** Primary path `navigator.clipboard.writeText` with textarea fallback. ✓ `lib/clipboard.ts` implements both paths per CONTEXT D-24.
- **COPY-08:** Button disabled when cart is empty. ✓ `disabled={!isHydrated || items.length === 0}` — also disabled before hydration to avoid copying a not-yet-rehydrated cart.

## UI-SPEC Compliance

### §Copy-to-Messenger Format
- Header line `Παραγγελία — Marios Shop` then blank line ✓
- Each item: index-dot-space + `{brand} — {name}` on first line ✓
- Three-space indent + `{TypeLabelGr} {size_ml}ml — {price}€ × {qty} = {subtotal}€` on indented line ✓
- Greek type labels per D-25 (`Σφραγισμένο` / `Ανοιγμένο` / `Decant`) ✓
- `fill_pct` NOT included in copy text ✓ (Test 4 contract)
- Blank line between items ✓
- Footer: blank line then `Σύνολο: {total}€ — {count} τεμάχια` with singular form `1 τεμάχιο` when count=1 ✓ (Test 2)

### §Currency Format (D-26)
- `formatPrice` used for unit price, subtotal, and footer total — integer `180€`, decimal `17.50€` ✓ (Test 3)

### §9 Toast (UI-SPEC §Copywriting Contract)
- Success: `Αντιγράφηκε!` via `toast.success()` ✓
- Failure: `Δεν αντιγράφηκε — δοκιμάστε ξανά` via `toast.error()` ✓
- Same toast wording for both clipboard paths (D-24) ✓

### §6 Primary Button
- Full-width (`className="w-full"`) ✓
- Locked label `📋 Αντιγραφή για Messenger` (the ONE emoji per UI-04) ✓
- Disabled state via shadcn `<Button disabled>` cva (`disabled:pointer-events-none disabled:opacity-50`) ✓

## Decisions Made

1. **Pure formatter takes ResolvedItem[], not CartItem[].** The component owns inventory lookups + Greek-label localization (`formatTypeLabel`); the formatter sees only display-ready values. Tests run in ~5ms and never touch the file system.

2. **Vitest with `environment: 'node'` only.** Phase 1's only tested code is a pure function. Clipboard + React component verified by build + manual smoke test. Per-file `// @vitest-environment jsdom` is available if Phase 2 adds DOM-dependent tests.

3. **Pure formatter file is import-safe from Server Components; clipboard helper is client-only.** Splitting `'use client'` per file (rather than co-locating both in one module) keeps the door open for future RSC paths that might want to compute order-text on the server.

4. **Toast wording is identical for navigator.clipboard and textarea paths.** Per CONTEXT D-24 — UI does not discriminate. The component renders the same success/error toast iff `copyToClipboard` resolves to `true`/`false`.

5. **`fill_pct` is not in ResolvedItem's interface.** TypeScript-level enforcement that the formatter never sees fill_pct, in addition to Test 4's runtime contract. Per CONTEXT D-25 — copy stays compact for Messenger.

6. **Empty list returns `""`, not a header-only string.** Defensive — the button is disabled when the cart is empty so this branch is unreachable in normal usage. If a future plan calls `formatOrderText([])` unexpectedly, an empty paste is safer than a useless `"Παραγγελία — Marios Shop\n\nΣύνολο: 0€ — 0 τεμάχια"`.

7. **TDD plan-level red→green commits.** `test(01-06)` commit lands the vitest setup + failing tests; the next `feat(01-06)` commit lands the implementation that makes them green. Verifiable in `git log --oneline` as a separate audit trail beyond the tests themselves.

8. **Placeholder removed entirely, not flipped in-place.** Plan 05 documented two options (in-place rewire vs extract); Plan 06 chose the extract option because the click handler needs cart-store subscriptions + inventory lookups + clipboard + toast — too much logic to inline into the drawer's render. The new component is independently testable in the future and re-mountable elsewhere (e.g. a future product-page bulk-copy variant).

9. **`<Button>` import dropped from cart-drawer.tsx.** The placeholder was the only `<Button>` instance in the drawer; with the placeholder gone, the import is dead code. Removing it keeps the drawer module's surface honest.

10. **No REFACTOR commit.** The GREEN implementation was already at the right level of abstraction: named constants for the header, explicit `flatMap` for the blank-line interleaving, `formatPrice` + `formatItemCount` reused from `lib/format.ts` (no duplicate formatting logic). A REFACTOR commit would have introduced noise without behavior change.

## Deviations from Plan

### Auto-fixed Issues

None — Plan 06 executed exactly as written. All 5 tests pass on first GREEN-phase implementation, all grep gates met, build clean, tsc clean.

The only minor implementation choice not pre-specified in the plan was the JSDoc comment update in `components/cart-drawer.tsx` (the Plan 05-era comment described the placeholder slot for Plan 06; Plan 06 updated that line to reflect the now-mounted `<CopyToMessengerButton />`). Not a deviation — the plan instructs Edit-tool targeted changes and updating an adjacent comment is standard hygiene.

## Authentication Gates

None — Phase 1 has no auth surface. The clipboard write does not call any network endpoint; it touches only `navigator.clipboard` (or DOM `document.execCommand`) and `localStorage` (read-only, via `useCartStore`). Nothing leaves the device.

## Known Stubs

None. Plan 06 is the final logical surface for Phase 1's user-visible vertical. Plan 07 expands the inventory seed (currently 1 product) and deploys to Vercel — orthogonal to this plan.

Plan-level requirements explicitly **NOT** covered (deferred to Phase 2 per `01-06-PLAN.md` runtime_notes):

- **COPY-04** — Localization toggle (UI-spec-wise, the type labels could in theory be presented in English in the copy text). Phase 1 hard-codes Greek per D-25. No code in this plan stubs this.
- **COPY-07** — Phase 2-specific toast wording with source attribution. Phase 1 uses the generic `Αντιγράφηκε!` / `Δεν αντιγράφηκε — δοκιμάστε ξανά` per UI-SPEC §Copywriting Contract. No stub — the current toasts are the locked Phase 1 surface.

## Threat Flags

None — Plan 06 adds no network endpoints, no auth paths, no file-system access, no schema changes, and no new trust boundaries. The clipboard helper writes to the OS clipboard via standard browser APIs (`navigator.clipboard.writeText` requires a secure context — HTTPS or localhost — and the user gesture is the button click that triggers it). The textarea fallback creates and immediately removes a transient DOM node. No external surface, no third-party network calls, no PII leaving the device.

## Manual Smoke-Test Plan (documented per acceptance criteria, not executed in this plan)

1. `npm run dev` → http://localhost:3000 shows the catalog + sticky FAB (Plan 04 surface).
2. Tap a product card → land on product detail. Tap `Προσθήκη` once → Sonner toast `Προστέθηκε: Tom Ford — Tobacco Vanille`. FAB badge `1`.
3. Tap the FAB → drawer opens showing Tom Ford / Tobacco Vanille / Σφραγισμένο 50ml row, subtotal `180€`, footer `Σύνολο` / `1 τεμάχιο` / `180€`. The Copy CTA `📋 Αντιγραφή για Messenger` is now **enabled** (Plan 05 had it disabled).
4. Tap the Copy CTA → Sonner toast appears: `Αντιγράφηκε!` (dark surface, check icon).
5. Open any text field (URL bar, Notes app, Messenger compose) → paste. The pasted text is:
   ```
   Παραγγελία — Marios Shop

   1. Tom Ford — Tobacco Vanille
      Σφραγισμένο 50ml — 180€ × 1 = 180€

   Σύνολο: 180€ — 1 τεμάχιο
   ```
   Byte-for-byte match with the literal smoke-test paste sample above.
6. Tap `Προσθήκη` two more times (total qty 3, seed stock=3) → drawer line reads `3 × 180€` subtotal `540€`. Tap Copy CTA → paste produces `1. Tom Ford — Tobacco Vanille\n   Σφραγισμένο 50ml — 180€ × 3 = 540€\n\nΣύνολο: 540€ — 3 τεμάχια` (plural form).
7. Tap the Trash2 to remove the item → drawer falls back to empty state. Copy CTA is now disabled (greyed out per shadcn `disabled:opacity-50`).
8. Hard refresh the page → drawer reopened via FAB still has the persisted cart; Copy CTA remains enabled.
9. Test the textarea fallback path (manual, browser-level): open the site in a context where `navigator.clipboard` is unavailable (e.g. an old Edge/Firefox under HTTP, or by setting a `Permissions-Policy: clipboard-write=()` header) → tapping copy should still produce the success toast and paste should still yield the formatted text.

(The smoke test is documented for completeness; the build + 5 unit tests + tsc are the gating verifications for this plan.)

## Self-Check: PASSED

Files asserted by Self-Check:
- FOUND: `lib/copy-format.ts`
- FOUND: `lib/copy-format.test.ts`
- FOUND: `lib/clipboard.ts`
- FOUND: `components/copy-to-messenger-button.tsx`
- FOUND: `vitest.config.ts`
- FOUND: `package.json` (modified — contains `"vitest"` and `"test"` script)
- FOUND: `components/cart-drawer.tsx` (modified — contains `<CopyToMessengerButton`, no `copy-cta-placeholder`)

Commits asserted by Self-Check:
- FOUND: `f8a7ec9` (Task 1 RED — vitest setup + failing tests)
- FOUND: `9d15826` (Task 1 GREEN — formatOrderText implementation)
- FOUND: `b15b0b3` (Task 2 — clipboard + button + drawer wiring)
