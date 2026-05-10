# Phase 1: Vertical MVP — Browse, Cart, Copy, Deploy - Context

**Gathered:** 2026-05-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the thinnest deployable end-to-end slice of Marios Shop on Vercel. A first-time mobile visitor opens the production URL, sees a hero + a small grid of real-looking products, taps through to a product page, adds a variant to a persistent cart drawer, and copies a Messenger-ready order text to the clipboard.

**In scope:** Project scaffold (Next.js 15 + TS + Tailwind + shadcn), inventory.json schema + sample data, homepage with hero + grid (no filters/sort yet), product detail page, cart drawer with localStorage persistence, copy-to-Messenger button, Vercel deploy.

**Out of scope (handled in later phases):** Filters/search/sort (Phase 2), stock-availability flagging in cart (Phase 2), full visual polish/a11y (Phase 3), analytics events (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Inventory & Seed Data
- **D-01:** Phase 1 ships with 5-6 placeholder products in `data/inventory.json` — realistic fake fragrances (e.g., Tom Ford Tobacco Vanille, Loewe Bittersweet Oud, Creed Aventus, Maison Francis Kurkdjian Baccarat Rouge 540, Parfums de Marly Layton, Nishane Hacivat). Owner replaces with his actual collection later by editing the JSON.
- **D-02:** Seed data must exercise the full UI surface: at least 3 different brands, a mix of `sealed`/`opened`/`decant` variants across products, at least one variant with `stock = 0` (to test the "Εξαντλήθηκε" path even though Phase 1's auto-remove behavior covers cart-side stock=0), at least one `opened` variant with `fill_pct`.
- **D-03:** Product images for Phase 1 use `image_fallback_url` only — public URLs from brand sites or fragrantica thumbnails. No local `/public/products/*.jpg` files are committed yet. The `image_fallback_url` field is populated for every product; the `image` field can be empty/null.
- **D-04:** Inventory loader is a typed import of the JSON file at build time (Next.js 15 statically inlines it). Explicit Product/Variant/VariantType TypeScript types live in `lib/types.ts`.

### Cart State Architecture
- **D-05:** Cart state lives in **Zustand** with the `persist` middleware writing to `localStorage` under key `marios-shop-cart`. No React Context, no useReducer.
- **D-06:** Persisted shape is minimal: `{ items: Array<{ product_id, variant_id, quantity }> }`. Brand, name, price, size, type are NOT persisted — they are resolved fresh from `inventory.json` on every render. This guarantees no stale prices after a redeploy.
- **D-07:** Hydration handled via the **isHydrated flag pattern** — store exposes `isHydrated: boolean`, set to `true` inside a `useEffect` that runs after `persist` rehydrates. Cart badge counter and drawer contents render `0` / empty until `isHydrated === true`. Avoids React 19 hydration mismatches without `suppressHydrationWarning`.
- **D-08:** **Phase 1 stock-out behavior:** On cart drawer open (or on app mount after hydration), any cart item whose variant no longer exists in inventory or has `stock === 0` is **silently removed** from the cart. CART-12's "flag as unavailable" UX is explicitly deferred to Phase 2 — the auto-remove is a temporary simplification.

### Drawer & UX
- **D-09:** Cart drawer is a **right-side `Sheet`** (shadcn) on all viewports — covers ~85% width on mobile, ~420px on desktop. No bottom-sheet variant in Phase 1.
- **D-10:** "Προσθήκη" feedback: **Sonner toast** (top or bottom-center, single line — "Προστέθηκε: {brand} — {name}") + the sticky cart button's badge increments. The drawer does NOT auto-open. User stays on the catalog/product page to keep browsing.
- **D-11:** On product detail, every variant has a single "Προσθήκη" button that adds **+1** per click. No quantity stepper on the product page. Quantity adjustments happen inside the drawer (CART-07 — Phase 2). Stock-clamp toast on the product page is also Phase 2 (CART-04); Phase 1 only enforces the clamp silently.
- **D-12:** The sticky cart button (bottom-right, ~16px from edges) is **always visible**, including when the cart is empty (badge shows nothing, but the button is still tappable). Affordance reason: returning visitors expect to find their cart in a fixed location.

### Visual Identity (locked early to avoid Phase 3 churn)
- **D-13:** Primary accent = **pure black** (`#000000` / Tailwind `bg-black text-white` for buttons; `text-black` for links and active filter chips). The only colors in the system are: black, white, neutral grays, and the three variant-type tints.
- **D-14:** Hero treatment = **subtle band** with an off-white/cream background (`bg-stone-50` or `bg-neutral-50`), wordmark "Marios Shop" in Inter/Geist Bold ~32-40px, tagline below in `text-neutral-600` ~14-16px. Height ~140-180px, centered. Distinguishes the hero band from the white grid below without being loud.
- **D-15:** Variant type badges = **soft tones** — pastel background + saturated text:
  - `sealed` → `bg-emerald-50 text-emerald-700` "Σφραγισμένο"
  - `opened` → `bg-amber-50 text-amber-800` "Ανοιγμένο"
  - `decant` → `bg-blue-50 text-blue-700` "Decant"
  - Small radius (`rounded-full` chip), `text-xs`, `px-2.5 py-0.5`.
- **D-16:** Product cards = **soft shadow, no border**, `bg-white`, `rounded-lg`, image on top (4:3 or 1:1 aspect — final aspect to be picked during impl based on what fragrance images look best), brand + name + lowest-price line below. Spec says "no bling" — keep shadow minimal (`shadow-sm` resting, optional `hover:shadow-md` on desktop).

### Component Library Choices
- **D-17:** **shadcn/ui components installed in Phase 1:** `button`, `card`, `sheet` (cart drawer), `badge` (variant chips and stock indicators), `sonner` (toast). Other primitives (input, select, dropdown-menu, dialog) are deferred until Phase 2 needs them for filters/search.
- **D-18:** Toast library is **Sonner** (the modern shadcn-recommended option), not the older `useToast`/`Toast` primitive.
- **D-19:** Font = **Geist Sans** via `next/font/google` (`Geist`). Mono variant not needed.
- **D-20:** Dark mode is NOT supported in Phase 1 (or anywhere in v1).

### Routing & Build
- **D-21:** Product detail page is `app/product/[id]/page.tsx` with `generateStaticParams()` returning all product ids from `inventory.json` so each product page is statically generated for `output: 'export'`. `dynamicParams = false`.
- **D-22:** A 404 page (`app/not-found.tsx`) is shipped in Phase 1 for unknown product ids (PROD-09 is technically Phase 2, but `not-found.tsx` is required for `output: 'export'` to work cleanly so it's part of Phase 1 scaffolding). Real "Δεν βρέθηκε προϊόν" content with a link back to home.
- **D-23:** `next.config.ts`: `output: 'export'`, `images: { unoptimized: true }` (required for static export with external image URLs), no other custom config.

### Copy-to-Messenger
- **D-24:** Clipboard primary path = `navigator.clipboard.writeText()`. Fallback (textarea trick) is implemented but only kicks in if `navigator.clipboard` is undefined. No graceful-fallback toast wording difference in Phase 1 — both paths show the same "Αντιγράφηκε!" success toast (error toast on failure).
- **D-25:** Variant type localization in copy text uses **Greek labels matching the badges**: "Σφραγισμένο" / "Ανοιγμένο" / "Decant" (NOT the English "Sealed/Opened/Decant" shown in the user's example spec — the badges are already Greek so the copy text matches). For `opened` variants in copy text, do NOT include the `fill_pct` (the badge UI surfaces it; the order text stays compact for Messenger).
- **D-26:** Currency formatting = **`{N}€`** (suffix, no space) — matches the spec example (`180€ × 1 = 180€`). Used identically in catalog cards, product detail, drawer, and copy text.

### Repository Structure
- **D-27:** Single Next.js app at the repo root. Standard App Router layout:
  - `app/` (layout.tsx, page.tsx, product/[id]/page.tsx, not-found.tsx)
  - `components/` (cart-drawer, product-card, variant-badge, sticky-cart-button, hero, etc.)
  - `components/ui/` (shadcn primitives)
  - `lib/` (types.ts, format.ts, inventory.ts, cart-store.ts, copy-format.ts)
  - `data/inventory.json`
  - `public/` (favicon only in Phase 1)
- **D-28:** Package manager = **npm** (default for Next.js create-next-app, no need to introduce pnpm/bun yet). Node version pinned via `.nvmrc` to current LTS.

### Claude's Discretion
- Exact Tailwind shade choices within the locked palette (e.g., `stone-50` vs `neutral-50` for the hero band) — pick what looks best in implementation.
- Card image aspect ratio (4:3 vs 1:1) — pick during impl based on what works with chosen sample image URLs.
- Exact font sizes, spacing scale, and breakpoint behavior beyond the responsive grid spec (1/2/3/4 cols).
- Sonner toast position, duration, and theme — sensible defaults.
- ESLint/Prettier config — Next.js defaults are fine.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level decisions
- `.planning/PROJECT.md` — Project context, core value, constraints, key decisions table
- `.planning/REQUIREMENTS.md` — Full v1 requirement list with REQ-IDs (35 mapped to Phase 1)
- `.planning/ROADMAP.md` §"Phase 1" — Phase goal, success criteria, requirement mapping

### Phase 1 scope clarifications
- `.planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-CONTEXT.md` — This document. The implementation decisions above LOCK choices for Phase 1.

### External docs (none authored by owner — using framework docs)
- Next.js 15 App Router static export: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- Zustand persist middleware: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
- shadcn/ui Sheet + Sonner: https://ui.shadcn.com/docs/components/sheet | /docs/components/sonner

No external user-provided ADRs/specs exist for this phase — requirements and decisions are fully captured in the docs above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. Phase 1 creates the foundation.

### Established Patterns
- None yet — Phase 1 establishes the patterns subsequent phases will follow:
  - Zustand stores with `persist` + `isHydrated` flag (cart-store will be the template for any future client-side state)
  - shadcn primitives wrapped in `components/ui/` + composed feature components in `components/`
  - Greek-only user-facing strings; type-safe enums for any user-facing labels
  - `lib/format.ts` for currency, type-label, and other formatters used across UI and copy text

### Integration Points
- `inventory.json` is the only data source — every product/variant lookup goes through `lib/inventory.ts` (typed, memoized).
- Cart store reads `inventory.json` lazily to validate items on hydrate (auto-remove logic) and to compute display fields (price, name, badge type).

</code_context>

<specifics>
## Specific Ideas

- "Apple-store / fragrance-brand aesthetic" — keeps the visual signal pure: black + white + neutral grays + the three soft variant tints. No gradients, no flashy hover states. Mentioned during Visual identity discussion.
- "Familiar e-shop pattern" — right-side cart drawer is the convention shoppers expect from sites like Sephora, Notino, Mecca. Mentioned during Drawer direction discussion.
- "Realistic fakes" for inventory — names/notes from the actual fragrance world (Tom Ford, Loewe, Creed, MFK, etc.) so the screenshots and shareable preview look like a real shop, not lorem ipsum.

</specifics>

<deferred>
## Deferred Ideas

- **Stock=0 cart-flagging UX** (CART-12) — Phase 1 silently auto-removes; Phase 2 will replace with the proper "items unavailable" state in the drawer.
- **Stock-clamp toast** (CART-04) — Phase 1 enforces the clamp silently; Phase 2 adds the user-facing "Δεν υπάρχει επαρκές stock" toast.
- **Quantity stepper on product page** — explicitly rejected for Phase 1; in-drawer +/- only (CART-07, Phase 2).
- **Filters/search/sort** (CAT-04..07) — Phase 2.
- **fill_pct in copy text** — explicitly omitted to keep Messenger order text compact. Could be revisited later if owner reports buyers ask about it.
- **Local product photos** (`/public/products/`) — owner will upload his own photos at his pace; Phase 1 uses external fallback URLs only.
- **PROD-09 (404 for unknown product ids)** is mapped to Phase 2 in roadmap but the `not-found.tsx` skeleton ships in Phase 1 because static export requires it. Phase 2 will polish the 404 content.

</deferred>

---

*Phase: 1-Vertical MVP — Browse, Cart, Copy, Deploy*
*Context gathered: 2026-05-10*
