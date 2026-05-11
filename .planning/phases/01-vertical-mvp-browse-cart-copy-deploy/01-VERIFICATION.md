---
phase: 01-vertical-mvp-browse-cart-copy-deploy
verified: 2026-05-11T15:05:00Z
status: human_needed
score: 34/35 requirements satisfied by code (1 owner-action checkpoint pending)
mode: mvp
overrides_applied: 0
human_verification:
  - test: "Vercel production deploy (Plan 07 Task 2 — checkpoint:human-action)"
    expected: "Owner runs Path A (Vercel CLI: npm install -g vercel && vercel login && vercel link && vercel --prod) OR Path B (push to GitHub + import via https://vercel.com/new). Produces live https://*.vercel.app production URL. After deploy: paste URL into 01-07-SUMMARY.md, mark DEP-01 + FOUND-05 Complete in REQUIREMENTS.md, flip Phase 1 to Complete in STATE.md."
    why_human: "Vercel CLI login (`vercel login`) opens a browser OAuth flow against the owner's Vercel + Git provider accounts. Claude cannot complete browser-based authentication. Classified as `checkpoint:human-action` in Plan 07 Task 2 by design."
  - test: "End-to-end mobile smoke test against live production URL"
    expected: "From the deployed URL on a mobile browser (or DevTools mobile emulation): (1) Hero 'Marios Shop' + tagline render; (2) Grid shows all 5 product cards with image+brand+name+price+badges; (3) Tap card → /product/{id} loads with hero image + variants; (4) Creed Aventus 100ml sealed shows 'Εξαντλήθηκε' disabled stub; (5) Tap 'Προσθήκη' → Sonner toast 'Προστέθηκε: {brand} — {name}', FAB badge increments; (6) Tap FAB → right-side drawer opens with items; (7) Tap '📋 Αντιγραφή για Messenger' → success toast, multi-item Messenger format pastes correctly; (8) Refresh → cart persists via localStorage marios-shop-cart."
    why_human: "User-flow / visual completeness verification on a real device + actual clipboard interaction with a paste target. Requires the live URL from human checkpoint above. Static-HTML/grep checks cannot prove the clipboard write actually lands in the paste buffer."
---

# Phase 1: Vertical MVP — Browse, Cart, Copy, Deploy — Verification Report

**Phase Goal:** "A first-time mobile visitor opens the deployed Vercel URL, browses a small real catalog, adds items to a persistent cart, copies a Messenger-ready order text. End-to-end live."
**Verified:** 2026-05-11T15:05:00Z
**Status:** human_needed (one owner-action checkpoint + one mandatory live-URL smoke test outstanding; everything code-side passes)
**Re-verification:** No — initial verification.

## User Flow Coverage (MVP Mode)

| # | Step (from phase goal) | Expected | Evidence in codebase | Status |
|---|---|---|---|---|
| 1 | Visitor opens the deployed Vercel URL on mobile and sees the homepage with a hero + ≥3 products grid | `output: 'export'` + responsive `<Hero>` + `<ProductGrid>` rendering all 5 products | `next.config.ts:4` `output: 'export'`; `npm run build` exits 0, generates `out/index.html` (30,510 bytes); homepage HTML contains Tom Ford, Loewe, Creed, Nishane, Maison Francis Kurkdjian (≥4 occurrences each), "Marios Shop" wordmark, "Επιλεγμένα αρώματα από τη συλλογή μου" tagline; `<ProductGrid>` uses `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` responsive grid. PRODUCTION URL still pending owner deploy. | LOCAL PASS / DEPLOY PENDING (Owner action) |
| 2 | Visitor taps product card → `/product/[id]`, sees variants, adds variant to cart | `generateStaticParams()` emits route per product id; product detail composes hero/title/notes/description/variants; `<AddToCartButton>` calls `useCartStore.addItem` | `app/product/[id]/page.tsx:7` `generateStaticParams` returns all 5 ids; `out/product/{5-ids}.html` all exist; `components/product-detail.tsx` renders BackLink + hero `<Image>` + brand + name + line + notes + description_gr + `<VariantRow>` list; `components/variant-row.tsx` mounts `<AddToCartButton productId variantId />` for in-stock variants and a disabled "Εξαντλήθηκε" `<Button>` for stock=0 (confirmed via `grep "Εξαντλήθηκε" out/product/creed-aventus.html` → 2 hits); `app/product/[id]/add-to-cart-button.tsx:50` calls `useCartStore.getState().addItem` + fires `toast.success(\`Προστέθηκε: ${product.brand} — ${product.name}\`)` on quantity increase | VERIFIED |
| 3 | Visitor opens cart drawer (sticky button + badge), sees items, removes an item | `<StickyCartButton>` always rendered + badge with sum-of-quantities + click → `useCartUiStore.openDrawer()`; `<CartDrawer>` is a right-side `<Sheet>` consuming `isDrawerOpen`; `<CartDrawerItem>` shows brand/name/variant/qty/subtotal + `<Trash2>` calls `removeItem` | `app/layout.tsx:33-34` mounts `<StickyCartButton />` and `<CartDrawer />` globally; `components/sticky-cart-button.tsx:24` count = `items.reduce((sum, i) => sum + i.quantity, 0)` per CAT-09 (sum-of-qty, NOT array length); button always renders per D-12 (badge hidden when `count===0 \|\| !isHydrated`); `components/cart-drawer.tsx:66` `<SheetContent side="right">` per D-09; `components/cart-drawer-item.tsx:74-81` `<button onClick={() => removeItem(...)}>` with `<Trash2>` icon + Greek `aria-label="Αφαίρεση {brand} {name}"`; drawer footer shows `Σύνολο` + total € + `formatItemCount(totalItems)` | VERIFIED |
| 4 | Cart survives a full page refresh (localStorage `marios-shop-cart`) without hydration mismatch | Zustand `persist` middleware with `name: 'marios-shop-cart'` + `partialize` to `{items}` only; `isHydrated` flag flipped by `<CartHydration>` in `useEffect`; badge/drawer render `0`/empty until hydrated | `lib/cart-store.ts:55` `name: 'marios-shop-cart'` matches success criterion exactly; `partialize: (state) => ({ items: state.items })` persists only the persistent shape; `isHydrated: false` initial + `setHydrated()` action; `components/cart-hydration.tsx:18-20` flips flag in `useEffect`; `<StickyCartButton>` gates badge on `isHydrated && count > 0`; `<CartDrawer>` gates list on `!isHydrated \|\| resolved.length === 0` → empty state; `onRehydrateStorage` auto-removes items whose variant is missing or stock=0 per D-08 (`lib/cart-store.ts:58-72`) | VERIFIED |
| 5 | Visitor taps "📋 Αντιγραφή για Messenger" and formatted order text is on clipboard | `<CopyToMessengerButton>` in drawer footer with locked label; `copyToClipboard` uses `navigator.clipboard.writeText` primary + textarea/`execCommand('copy')` fallback per D-24; success/error Sonner toasts | `components/copy-to-messenger-button.tsx:84` button text `📋 Αντιγραφή για Messenger` (the single 📋 emoji in the UI per UI-04); `disabled={!isHydrated \|\| items.length === 0}` per COPY-08; `handleCopy` resolves fresh ResolvedItem[] per D-06 (NO `fill_pct` per D-25), calls `formatOrderText` → `copyToClipboard`; `lib/clipboard.ts:25` `await navigator.clipboard.writeText(text)` primary + `:48` `document.execCommand('copy')` textarea fallback; `lib/copy-format.ts:43-62` produces UI-SPEC format with header `Παραγγελία — Marios Shop`, numbered items, `formatItemCount`-pluralized footer; 5/5 vitest tests pass (`npm test` → 5 passing in 308ms), incl. byte-equality test for two-item Tom Ford + Loewe Bittersweet Oud example + singular `1 τεμάχιο` + decimal `17.50€` + no-Γέμιση contract for opened + empty list returns `""`. Real clipboard write only verifiable on a live device — see human verification. | CODE VERIFIED / LIVE-DEVICE TEST PENDING |

## Requirement Coverage Audit (35 REQ-IDs)

| # | Req | Description (short) | Status | Evidence |
|---|---|---|---|---|
| 1 | FOUND-01 | Next.js 15 App Router + TS + `output:'export'` builds | SATISFIED | `package.json` deps: next ^15, react ^19, typescript ^5; `next.config.ts:4` `output:'export'`; `npm run build` produced 9 static pages cleanly |
| 2 | FOUND-02 | Tailwind + shadcn installed & functional | SATISFIED | `package.json` devDeps: tailwindcss ^4, @tailwindcss/postcss; `components.json` present; shadcn primitives (button/card/sheet/badge/sonner) all live in `components/ui/` and are imported throughout |
| 3 | FOUND-03 | TS types for Product / Variant / VariantType / CartItem | SATISFIED | `lib/types.ts` exports all four typed correctly (VariantType union, `fill_pct?` optional) |
| 4 | FOUND-04 | inventory.json read at build time via typed import | SATISFIED | `lib/inventory.ts:1` `import inventoryData from '@/data/inventory.json'` typed as `Product[]`; consumed by homepage, `generateStaticParams`, cart store rehydrate filter, drawer, copy button |
| 5 | FOUND-05 | Deployable on Vercel as static site w/ production URL | PENDING (owner-action checkpoint) | Code is production-ready: `npm run build` exits 0, `out/` contains all expected static HTML. Vercel deploy itself is Plan 07 Task 2 deferred per `type="checkpoint:human-action"`. Path A (CLI) or Path B (GitHub import) documented in 01-07-SUMMARY.md. NOT a verification failure — recognized as owner-only step in verification context. |
| 6 | INV-01 | Product schema covers all spec fields | SATISFIED | `lib/types.ts` `Product` has id/brand/name/line/image/image_fallback_url/notes/description_gr/variants[]; matched 1:1 in `data/inventory.json` |
| 7 | INV-02 | Variant schema covers all spec fields | SATISFIED | `lib/types.ts` `Variant` has id/type/size_ml/price/stock/fill_pct? |
| 8 | INV-05 | ≥3 real sample products | SATISFIED | `data/inventory.json` contains 5 products from 5 brands (Tom Ford / Loewe / Creed / MFK / Nishane), 10 variants total |
| 9 | CAT-01 | Homepage `/` with hero + tagline | SATISFIED | `app/page.tsx` mounts `<Hero>` + `<ProductGrid>`; `components/hero.tsx` renders "Marios Shop" + "Επιλεγμένα αρώματα από τη συλλογή μου"; `out/index.html` contains both strings |
| 10 | CAT-02 | Responsive grid 1/2/3/4 cols | SATISFIED | `components/product-grid.tsx:7` uses `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6` |
| 11 | CAT-03 | Product card: image, brand, name, lowest price, badges | SATISFIED | `components/product-card.tsx` renders `<Image>` (image_fallback_url, aspect-square), brand, name, `priceLabel(product)` (από-prefix for ≥2 in-stock variants, bare for 1) via `formatPrice`, distinct `<VariantBadge>`s in sealed→opened→decant deterministic order |
| 12 | CAT-09 | Sticky cart FAB + badge counter | SATISFIED | `components/sticky-cart-button.tsx` — `fixed bottom-4 right-4 z-40 h-14 w-14 rounded-full bg-black` FAB; badge = sum-of-quantity `items.reduce((sum,i)=>sum+i.quantity,0)`; gated on `isHydrated && count>0`; dynamic Greek aria-label via `formatItemCount`; mounted globally in `app/layout.tsx` |
| 13 | PROD-01 | `/product/[id]` statically generated | SATISFIED | `app/product/[id]/page.tsx:5-9` `dynamicParams = false` + `generateStaticParams()` over `products`; `out/product/{5-ids}.html` all exist |
| 14 | PROD-02 | Large product image + fallback URL support | SATISFIED | `components/product-detail.tsx:11-19` renders `next/image` from `product.image_fallback_url` w/ priority + sizes + unoptimized per D-23 |
| 15 | PROD-03 | Brand / name / line / notes / description_gr | SATISFIED | `components/product-detail.tsx:21-34` renders all five fields, conditional on optional ones; description_gr uses `whitespace-pre-line` for newline preservation |
| 16 | PROD-04 | Variants list with size_ml, price, type badge, stock state, "Προσθήκη" | SATISFIED | `components/variant-row.tsx` renders `<VariantBadge>` + `{variant.size_ml}ml` + `formatPrice(variant.price)` + `<AddToCartButton>` (or disabled "Εξαντλήθηκε" stub for stock=0) |
| 17 | PROD-08 | Back link to catalog | SATISFIED | `components/back-link.tsx` renders `<Link href="/">← Πίσω στον κατάλογο</Link>`; appears in `out/product/{id}.html` |
| 18 | CART-01 | Zustand + persist to `marios-shop-cart` | SATISFIED | `lib/cart-store.ts:17-76` `create<CartStore>()(persist(...))` with `name: 'marios-shop-cart'`, `storage: createJSONStorage(() => localStorage)` |
| 19 | CART-02 | Cart item shape `{product_id, variant_id, quantity}` | SATISFIED | `lib/types.ts:24-28` `CartItem` interface exactly this; `partialize` persists only this shape |
| 20 | CART-03 | Adding increments existing variant's qty, else adds | SATISFIED | `lib/cart-store.ts:22-43` `addItem` — finds existing matching `product_id+variant_id` and bumps qty (clamped to stock per D-11); else appends `{...quantity: 1}` |
| 21 | CART-05 | Cart opens as drawer/sheet from anywhere | SATISFIED | `<CartDrawer>` mounted in root layout; opens via `useCartUiStore.openDrawer()` driven from any page's `<StickyCartButton>` |
| 22 | CART-06 | Drawer per-item shows brand / name / variant / price / qty / subtotal | SATISFIED | `components/cart-drawer-item.tsx:58-73` renders brand, name, `<VariantBadge>` + `{size_ml}ml` + `{quantity} × {formatPrice(price)}` + subtotal — six fields total |
| 23 | CART-08 | Remove item from drawer | SATISFIED | `components/cart-drawer-item.tsx:74-82` `<button onClick={() => removeItem(item.product_id, item.variant_id)}>` calling Zustand `removeItem` action |
| 24 | CART-09 | Drawer footer total € + total τεμάχια | SATISFIED | `components/cart-drawer.tsx:96-104` footer renders `Σύνολο` label, `formatItemCount(totalItems)`, total via `formatPrice(totalPrice)` |
| 25 | CART-11 | Hydrate from localStorage w/o mismatch | SATISFIED | `lib/cart-store.ts` `isHydrated` flag; `components/cart-hydration.tsx` mounted first in `<body>` flips it in `useEffect`; `<StickyCartButton>` + `<CartDrawer>` gate visual on `isHydrated` → SSR/CSR render identical "empty" state until hydration |
| 26 | COPY-01 | Primary "📋 Αντιγραφή για Messenger" button in drawer | SATISFIED | `components/copy-to-messenger-button.tsx:84` exact text; `data-slot="copy-cta"`; full-width `<Button>` in drawer footer |
| 27 | COPY-02 | Formatted text per spec template (header + numbered items + footer) | SATISFIED | `lib/copy-format.ts:43-62` `formatOrderText` — header `Παραγγελία — Marios Shop`, numbered items with `{i}. {brand} — {name}` then `   {typeLabel} {size_ml}ml — {price}€ × {qty} = {subtotal}€` indented, footer `Σύνολο: {total}€ — {N} τεμάχια`; 5/5 vitest tests prove the exact byte sequence |
| 28 | COPY-03 | Per-item shape `{brand} — {name}` / `{Type} {size_ml}ml — {price}€ × {qty} = {subtotal}€` | SATISFIED | Lines 50-51 of `lib/copy-format.ts`; matched byte-for-byte by `lib/copy-format.test.ts` Test 1 |
| 29 | COPY-05 | Footer total € + total τεμάχια | SATISFIED | `lib/copy-format.ts:55-57` `Σύνολο: ${formatPrice(totalPrice)} — ${formatItemCount(totalQty)}`; singular/plural test passes |
| 30 | COPY-06 | Real clipboard write w/ textarea fallback | SATISFIED | `lib/clipboard.ts:21-55` — primary `navigator.clipboard.writeText(text)` with secure-context check, fallback off-screen textarea + `document.execCommand('copy')`, try/finally cleanup |
| 31 | COPY-08 | Empty cart → button disabled | SATISFIED | `components/copy-to-messenger-button.tsx:38` `const isEmpty = !isHydrated \|\| items.length === 0;` → `disabled={isEmpty} aria-disabled={isEmpty}` |
| 32 | UI-06 | All user-facing strings in Greek | SATISFIED | Spot-checked every component — hero tagline, badge labels (Σφραγισμένο/Ανοιγμένο/Decant — Decant intentionally English by spec), Προσθήκη, Εξαντλήθηκε, Πίσω στον κατάλογο, Καλάθι, Σύνολο, τεμάχιο/τεμάχια, "Αντιγράφηκε!", "Δεν αντιγράφηκε — δοκιμάστε ξανά", "Προστέθηκε: …", "Άνοιγμα καλαθιού …", "Αφαίρεση …", "Το καλάθι σας είναι άδειο", "Δεν βρέθηκε προϊόν", "Επιστροφή στον κατάλογο", "📋 Αντιγραφή για Messenger". One known minor gap: shadcn `<SheetContent>` auto-rendered close button still uses English `Close` sr-only label (Phase 3 fix per Plan 05 SUMMARY). |
| 33 | UI-07 | Text-only "Marios Shop" wordmark | SATISFIED | `components/hero.tsx:5` `<h1>Marios Shop</h1>` — text only, no image/SVG logo |
| 34 | DEP-01 | Vercel project linked w/ auto-deploys from main | PENDING (owner-action checkpoint) | Same owner-action checkpoint as FOUND-05. Path A connects via dashboard Settings→Git; Path B via GitHub import (handles DEP-01 implicitly). Not a verification failure per phase context. |
| 35 | DEP-02 | `next build` produces `out/` with static files, no server runtime | SATISFIED | `npm run build` output confirmed: "✓ Compiled successfully", "✓ Generating static pages (9/9)", "✓ Exporting (2/2)"; `out/` contains `index.html`, `404.html`, `product/{5}.html`, `_next/*` chunks; no server bundle since `output: 'export'` enforces static |

**Counts:**
- SATISFIED by code: 33/35
- PENDING (owner-action checkpoint): 2/35 (FOUND-05, DEP-01) — explicitly recognized in verification context as deferred-to-owner, NOT a failure.

## Phase 1 Success Criteria (5 from ROADMAP.md)

| # | Success Criterion | Status |
|---|---|---|
| 1 | Mobile visitor opens deployed Vercel URL → homepage with hero + ≥3 products grid | LOCAL PASS (static export ready, all 5 product cards in `out/index.html`) / PRODUCTION URL pending owner deploy |
| 2 | Tap card → `/product/[id]`, see variants, add variant to cart | VERIFIED (5/5 product pages exported, `<VariantRow>` + `<AddToCartButton>` flow proven by code + grep) |
| 3 | Open cart drawer (sticky button + badge), see items, remove an item | VERIFIED (`<StickyCartButton>` + `<CartDrawer>` mounted globally; remove handler wired) |
| 4 | Cart survives full refresh, no hydration mismatch (localStorage `marios-shop-cart`) | VERIFIED (Zustand persist + `partialize` + `isHydrated` gating; auto-remove on rehydrate per D-08) |
| 5 | Tap "📋 Αντιγραφή για Messenger" → formatted order text on clipboard | CODE VERIFIED (formatOrderText byte-equality test passes; clipboard primary + textarea fallback wired) / LIVE-DEVICE smoke pending owner |

## D-NN Decision Spot-Check (locked decisions actually shipped)

| Decision | Expected | Evidence | Status |
|---|---|---|---|
| D-08 | Auto-remove on rehydrate for stock=0 / missing variant | `lib/cart-store.ts:58-72` `onRehydrateStorage` filters items where `!variant \|\| stock <= 0`, clamps remaining qty to stock | VERIFIED |
| D-09 | Right-side `<Sheet>` only, w-[85vw] / sm:w-[420px] | `components/cart-drawer.tsx:66-67` `<SheetContent side="right" className="w-[85vw] sm:w-[420px] ..."`  | VERIFIED |
| D-10 | Add-to-cart fires toast, drawer does NOT auto-open | `add-to-cart-button.tsx:59` `toast.success(\`Προστέθηκε: …\`)`; no `openDrawer()` call in handler | VERIFIED |
| D-12 | Sticky cart button always visible (badge optional) | `sticky-cart-button.tsx:33-49` button always rendered; only badge gated on `isHydrated && count > 0` | VERIFIED |
| D-13 | Pure black accent | `sticky-cart-button.tsx:38` `bg-black text-white`; `text-neutral-950` for headings throughout | VERIFIED |
| D-15 | Badge tones — emerald-50/700, amber-50/800, blue-50/700 | `components/ui/badge.tsx:25-27` cva variants for sealed/opened/decant match exactly | VERIFIED |
| D-21 | `generateStaticParams` over all product ids | `app/product/[id]/page.tsx:7-9` returns `products.map(p => ({ id: p.id }))`; `dynamicParams = false`; `out/product/{5-ids}.html` confirms emission | VERIFIED |
| D-23 | `output: 'export'`, `images: { unoptimized: true }` | `next.config.ts:3-7` both set | VERIFIED |
| D-24 | Clipboard primary + textarea fallback, identical toasts | `lib/clipboard.ts:21-55` matches D-24 contract; `copy-to-messenger-button.tsx:69-72` fires same `Αντιγράφηκε!` / `Δεν αντιγράφηκε …` regardless of path | VERIFIED |
| D-25 | Greek typeLabel in copy text, NO fill_pct in output | `copy-to-messenger-button.tsx:52` uses `formatTypeLabel(variant.type)` (Greek per `lib/format.ts:17-25`); `lib/copy-format.ts:13-22` `ResolvedItem` interface intentionally omits fill_pct; `copy-format.test.ts` Test 4 (`MFK Ανοιγμένο` opened-type) asserts `out.not.toContain('Γέμιση')` | VERIFIED |
| D-26 | Suffix currency, no space (`180€`) | `lib/format.ts:7-10` `${n}€` for integers / `${n.toFixed(2)}€` for decimals; consumed by ProductCard, VariantRow, CartDrawerItem, formatOrderText, drawer footer total | VERIFIED |

11/11 spot-checked D-NN decisions shipped as locked.

## Build & Test Gate

| Gate | Command | Expected | Actual | Status |
|---|---|---|---|---|
| Vitest | `npm test` | 5 tests passing | `Test Files 1 passed (1); Tests 5 passed (5); Duration 308ms` | PASS |
| Next build | `npm run build` | exits 0, 9 static pages, `out/{index,404,product/*}.html` present | "✓ Compiled successfully in 2.6s", "✓ Generating static pages (9/9)", "✓ Exporting (2/2)"; `/`, `/_not-found`, `/product/[id]` × 5 (Tom Ford / Loewe / Creed / MFK / Nishane) | PASS |
| Static-export integrity | `ls out/` | `index.html` + `404.html` + `product/{5-ids}.html` | All present (sizes 10K–30K bytes) | PASS |

## Anti-Pattern Scan

| Pattern | Hits | Verdict |
|---|---|---|
| `TODO \| FIXME \| XXX \| HACK` | 0 | Clean |
| `placeholder \| coming soon \| not yet implemented` | 1 (`copy-to-messenger-button.tsx:27` — code comment explaining historical `data-slot="copy-cta-placeholder"` replacement; actual `data-slot` is `copy-cta` now) | Info only — historical comment, not a stub |
| `return null;` | 4 (defensive filters for stale cart items × 2, `CartHydration` side-effect-only returning null, `lowestInStockPrice` null when all variants OOS) | All intentional and documented |
| `=> {}` empty handlers | 0 | Clean |
| Hardcoded empty `[]` / `{}` rendered to UI | 0 | Clean — all data flows from `data/inventory.json` (typed import) and `useCartStore.items` (persisted) |

## Data-Flow Trace (Level 4)

| Artifact | Data variable | Source | Real data? | Status |
|---|---|---|---|---|
| `app/page.tsx` `<ProductGrid>` | `products` | `lib/inventory.ts → import @/data/inventory.json` (5 products) | Yes — typed JSON import at build time | FLOWING |
| `app/product/[id]/page.tsx` `<ProductDetail>` | `product` | `getProductById(id)` over `products` array | Yes | FLOWING |
| `<CartDrawer>` items list | `resolved` | maps `useCartStore.items` (localStorage-persisted) → resolved with fresh inventory lookup (D-06) | Yes — live from store + inventory | FLOWING |
| `<StickyCartButton>` badge | `count` | `items.reduce((sum,i)=>sum+i.quantity,0)` | Yes — sum of quantities, NOT array length (CAT-09 contract) | FLOWING |
| `<CopyToMessengerButton>` order text | `resolved` `ResolvedItem[]` → `formatOrderText(resolved)` | Same as drawer — store items + inventory join per click; format proven by vitest byte-equality test | Yes | FLOWING |

No hollow props, no static-fallback returns, no disconnected wiring detected.

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Vitest unit tests pass | `npm test` (verifier ran) | 5 passing, 308ms | PASS |
| Static export builds | `npm run build` (verifier ran) | Exit 0; 9 static pages; correct routes | PASS |
| Stock=0 path lands disabled "Εξαντλήθηκε" in static HTML | `grep "Εξαντλήθηκε" out/product/creed-aventus.html` | 2 hits | PASS |
| Tom Ford / Loewe / Creed / Nishane / MFK present on homepage | `grep "<brand>" out/index.html` | 4 hits each (React server tree + streaming) | PASS |
| Greek hero strings on homepage | `grep "Marios Shop\|Επιλεγμένα αρώματα"` | both present | PASS |
| 404 page Greek copy | `grep "Δεν βρέθηκε\|Επιστροφή στον κατάλογο" out/404.html` | 3 hits each | PASS |
| `marios-shop-cart` localStorage key wired | `grep "marios-shop-cart"` | matches `lib/cart-store.ts:55` only | PASS |
| Single 📋 emoji in UI (UI-04) | grep `📋` in source | only `components/copy-to-messenger-button.tsx:84` (one occurrence in JSX label) | PASS |

## Deferred Items (Step 9b)

The following items came up as "not yet implemented" but are explicitly addressed in later milestone phases — NOT actionable gaps for Phase 1:

| Item | Addressed in | Evidence |
|---|---|---|
| Stock indicator "Τελευταία τεμάχια" / "Εξαντλήθηκε" badge in catalog | Phase 2 | ROADMAP.md SC#2 for Phase 2; REQUIREMENTS.md PROD-05/06 mapped to Phase 2 |
| `fill_pct` rendering on opened variants ("Γέμιση: X%") | Phase 2 | PROD-07 mapped to Phase 2 |
| Stock-clamp warning toast | Phase 2 | CART-04 mapped to Phase 2 |
| In-drawer quantity stepper (+/-) | Phase 2 | CART-07 mapped to Phase 2 |
| Cart "Καθαρισμός" + confirm | Phase 2 | CART-10 mapped to Phase 2 |
| Stale cart items flagging UX (instead of silent auto-remove) | Phase 2 | CART-12 mapped to Phase 2; D-08 explicitly defers |
| Filters / search / sort | Phase 2 | CAT-04..08 mapped to Phase 2 |
| Type localization tweaks in copy text | Phase 2 | COPY-04 mapped to Phase 2 |
| Toast wording "source attribution" enrichment | Phase 2 | COPY-07 mapped to Phase 2 |
| Visual polish, a11y, full UI system | Phase 3 | UI-01..05, UI-08, UI-09 mapped to Phase 3 |
| Vercel Analytics events, README | Phase 4 | ANL-01..05, DEP-03 mapped to Phase 4 |

## Known Minor Gaps (Documented, Non-Blocking)

- shadcn `<SheetContent>` auto-renders close button with English `Close` sr-only label — Phase 3 UI-09 fix (Plan 05 SUMMARY logged this).
- Geist Google Font subset workaround — uses `latin` + `latin-ext` only because the Google Fonts API does not ship a Geist `greek` subset; Greek glyphs render via system-font fallback. Documented Rule-1 deviation in 01-01-SUMMARY.md; visual contract holds.

## Gaps Summary

**No code-side gaps.** All 33 code-realizable Phase 1 requirements are satisfied; all 5 ROADMAP Success Criteria are passable on the static export. All 11 spot-checked D-NN decisions shipped as locked. `npm run build` and `npm test` both exit clean. No stubs, TODO markers, hollow props, or disconnected wiring detected anywhere in the source tree (`app/`, `components/`, `lib/`, `data/`).

**Two outstanding items are explicit owner-action checkpoints** (Plan 07 Task 2, recognized in verification context):
1. FOUND-05 / DEP-01 — Vercel production deploy (`checkpoint:human-action`, requires browser-based OAuth).
2. End-to-end smoke test on the live production URL on a real mobile device — depends on item 1.

Both are correctly classified as owner-required, not as code defects. The status `human_needed` reflects exactly this state: code is done, awaiting owner deploy + smoke verification before the phase can be flipped to Complete in STATE.md.

---

*Verified: 2026-05-11T15:05:00Z*
*Verifier: Claude (gsd-verifier, Opus 4.7 1M)*
