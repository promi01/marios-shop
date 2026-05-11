---
phase: 01-vertical-mvp-browse-cart-copy-deploy
created: 2026-05-11
status: pending
---

# Walking Skeleton — Marios Shop Phase 1

> The thinnest possible end-to-end working slice for Phase 1. Plan 01 must deliver this skeleton. Everything else in the phase (Plans 02-07) iterates on top of it.

## What the Skeleton Delivers

After Plan 01 executes, the project state is:

1. A Next.js 15 (App Router) + TypeScript project at the repo root, configured for `output: 'export'`, builds without errors.
2. Tailwind CSS v4 + shadcn/ui (new-york style, neutral base) initialized; five primitives installed: `button`, `card`, `sheet`, `badge`, `sonner`.
3. Geist Sans loaded via `next/font/google` with the Greek subset; `<html lang="el">`.
4. `data/inventory.json` exists with **exactly 1 minimal product** (1 brand, 1 name, 1 variant of type `sealed`, 1 size, 1 price, stock > 0, populated `image_fallback_url`).
5. `lib/types.ts` exports `VariantType`, `Variant`, `Product`, `CartItem`.
6. `lib/inventory.ts` loads `data/inventory.json` as a typed import (`Product[]`).
7. `app/page.tsx` renders the wordmark "Marios Shop" + the 1 product as a clickable link to `/product/[id]`.
8. `app/product/[id]/page.tsx` exists with `generateStaticParams()` returning all product ids; renders the product brand/name + a single "Προσθήκη" button.
9. `lib/cart-store.ts` defines a Zustand store with `persist` middleware (key: `marios-shop-cart`), an `addItem` action, and the `isHydrated` flag pattern. The "Προσθήκη" button on the product page calls `addItem`.
10. `app/not-found.tsx` exists as a minimal placeholder (full polish in Plan 03).
11. `next.config.ts` has `output: 'export'` and `images: { unoptimized: true }`.
12. `npm run build` produces an `out/` directory with static files.
13. A Vercel preview deployment is configured (vercel.json + project linked) — production deploy lands in Plan 07 after the full inventory ships.

## Why This Is "Walking"

After Plan 01, a real user can:
- Open the dev server (`npm run dev`) or preview deploy.
- See the 1-product homepage.
- Click into the product page.
- Click "Προσθήκη" and have an item land in the persistent cart store (verify via `localStorage.getItem('marios-shop-cart')` in DevTools).

That is the **complete vertical** — scaffold + routing + real data read + real UI interaction + cart persistence + deployable static export. Every subsequent plan replaces stubs with full implementations against the same end-to-end shape.

## Architectural Decisions Locked by the Skeleton

These decisions, embodied in Plan 01, become the foundation for Plans 02-07 and future phases. They are NOT renegotiated.

| Decision | Locked Value | Source |
|----------|--------------|--------|
| Framework | Next.js 15 App Router + TypeScript | CONTEXT D-23, PROJECT |
| Build mode | `output: 'export'` static export | CONTEXT D-23, FOUND-01 |
| Styling | Tailwind CSS v4 + shadcn/ui (new-york, neutral) | UI-SPEC §Design System |
| Font | Geist Sans via `next/font/google` (latin + greek subsets) | CONTEXT D-19, UI-SPEC §Typography |
| Dark mode | Not supported (light only) | CONTEXT D-20 |
| Data source | `data/inventory.json` (typed import, build-time) | CONTEXT D-04, FOUND-04, INV-01 |
| Image strategy | `image_fallback_url` only; `next/image` with `unoptimized: true` | CONTEXT D-03, D-23 |
| Cart state | Zustand + `persist` middleware to localStorage | CONTEXT D-05 |
| Cart persist key | `marios-shop-cart` | CONTEXT D-05, CART-01 |
| Cart persist shape | `{ items: Array<{ product_id, variant_id, quantity }> }` only | CONTEXT D-06, CART-02 |
| Hydration pattern | `isHydrated: boolean` flag set in `useEffect` after rehydrate | CONTEXT D-07, CART-11 |
| Product routing | `app/product/[id]/page.tsx` + `generateStaticParams()` + `dynamicParams = false` | CONTEXT D-21, PROD-01 |
| 404 handling | `app/not-found.tsx` ships in Phase 1 (required for export) | CONTEXT D-22 |
| Package manager | npm | CONTEXT D-28 |
| Node version | LTS, pinned in `.nvmrc` | CONTEXT D-28 |
| Deploy target | Vercel | PROJECT, DEP-01, DEP-02 |
| Repo layout | Single Next.js app at root; `app/`, `components/`, `components/ui/`, `lib/`, `data/`, `public/` | CONTEXT D-27 |
| shadcn primitives in Phase 1 | `button`, `card`, `sheet`, `badge`, `sonner` only | CONTEXT D-17, UI-SPEC §shadcn Components |
| Toast library | Sonner (not `useToast`) | CONTEXT D-18 |
| UI language | Greek (`<html lang="el">`); only emoji allowed = 📋 on copy button | UI-06, UI-04 |
| Currency format | `{N}€` suffix, no space | CONTEXT D-26, UI-SPEC §Currency Format |

## Directory Layout (Locked)

```
marios-shop/
├── app/
│   ├── layout.tsx            (root layout, Geist font, <Toaster />, lang="el")
│   ├── page.tsx              (homepage)
│   ├── globals.css           (Tailwind v4 + shadcn tokens)
│   ├── not-found.tsx         (skeleton in Plan 01, polished later)
│   └── product/
│       └── [id]/
│           └── page.tsx      (product detail with generateStaticParams)
├── components/
│   └── ui/                   (shadcn primitives — created by `shadcn add`)
│       ├── button.tsx
│       ├── card.tsx
│       ├── sheet.tsx
│       ├── badge.tsx
│       └── sonner.tsx
├── lib/
│   ├── types.ts              (Product, Variant, VariantType, CartItem)
│   ├── inventory.ts          (typed JSON import + lookup helpers)
│   └── cart-store.ts         (Zustand store with persist + isHydrated)
├── data/
│   └── inventory.json        (single source of truth)
├── public/
│   └── favicon.ico
├── next.config.ts            (output: 'export', images.unoptimized: true)
├── tsconfig.json
├── tailwind.config.ts        (or Tailwind v4 inline config in globals.css)
├── components.json           (shadcn config)
├── .nvmrc                    (Node LTS)
├── package.json
└── vercel.json               (or Vercel project linked via dashboard)
```

Later plans add files inside this layout — they do not relocate it.

## Build Command Contract

- `npm run dev` — start local dev server on http://localhost:3000.
- `npm run build` — produces `out/` directory with static HTML/JS/CSS, zero server runtime.
- `npm run lint` — passes (Next.js defaults).

Plan 07 verifies `npm run build` against the full seed inventory and produces the production Vercel deploy.

---

*Skeleton specification frozen at 2026-05-11. Plans 02-07 build on this foundation without renegotiating it.*
