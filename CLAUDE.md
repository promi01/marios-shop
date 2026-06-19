# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Marios Shop**

Στατικό e-shop-style site για το προσωπικό στοκ αρωμάτων του Μάριου. Αντί για ένα Google Drive link με φωτογραφίες, μοιράζεται ένα URL σε ένα Facebook group όπου οι φίλοι/follower μπορούν να περιηγηθούν στη συλλογή, να φτιάξουν "καλάθι" και να αντιγράψουν την παραγγελία ως καθαρό κείμενο για να την στείλουν στο Messenger.

**Core Value:** Ένας επισκέπτης από Facebook (κυρίως κινητό) μπορεί σε <30 δευτερόλεπτα να βρει αρώματα που τον ενδιαφέρουν, να φτιάξει λίστα παραγγελίας, και να την αντιγράψει για Messenger — χωρίς εγγραφή, χωρίς πληρωμή, χωρίς τριβή.

### Constraints

- **Tech stack:** Next.js 15 (App Router) + TypeScript, Tailwind CSS, shadcn/ui — επιλέχθηκε από τον owner
- **Deploy:** Vercel free tier. ⚠️ **Δεν είναι πια static export** — από το Phase 5 (admin UI) το `output: 'export'` αφαιρέθηκε επειδή το admin χρειάζεται server-side mutations (Vercel Blob writes, επεξεργασία εικόνων). Το public catalog πλέον γίνεται **dynamic render με ISR (`revalidate = 60`)** και τα `/admin/*` είναι `force-dynamic`. Παραμένει zero-config στο free tier. *(Το `PROJECT.md` μπορεί ακόμα να λέει «static export» — αυτό είναι ξεπερασμένο.)*
- **Γλώσσα UI:** Ελληνικά — στοχευμένο κοινό
- **Mobile-first:** ~90% κινητό από Facebook
- **Στυλ:** minimal, λευκό background, Inter/Geist typography. Όχι gradients, όχι emoji στο UI, όχι bling
- **Storage:** μόνο localStorage (key: `marios-shop-cart`) — όχι cookies, όχι backend persistence
- **Privacy:** Vercel Analytics είναι aggregate-only — όχι PII tracking
<!-- GSD:project-end -->

## Commands

```bash
npm run dev        # next dev — predev hook validates data/inventory.json first
npm run build      # next build — prebuild hook validates data/inventory.json first
npm run lint       # next lint (next/core-web-vitals + next/typescript)
npm run test       # vitest run        (npm run test:watch for watch mode)
npx vitest run path/to/file.test.ts    # run a single test file
npx tsc --noEmit                       # type-check (no dedicated script)
npm run validate:inventory             # structural check of data/inventory.json
node scripts/audit-products.mjs        # manual QA: per-product notes/pyramid/accords/photos completeness
```

- `scripts/validate-inventory.mjs` runs automatically on `predev`/`prebuild` and **fails the build** on any structural error in `data/inventory.json`. Missing `public/` images are warnings, not errors.
- `/admin` runs inside the same Next.js app — there is no separate admin server.

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

- **Next.js 15** (App Router, React 19) + **TypeScript** (strict, `@/*` path alias → repo root)
- **Tailwind CSS v4** (`@tailwindcss/postcss`) + **radix-ui** primitives (shadcn/ui style); `lucide-react` icons, `sonner` toasts, `next-themes`
- **Zustand** — cart state (`lib/cart-store.ts`), persisted to `localStorage`
- **Vercel Blob** (`@vercel/blob`) — stores both `inventory.json` and product images
- **sharp** — server-side image processing (orientation/resize → JPEG) in admin upload
- **jose** — admin session JWT (HS256), verified in Edge middleware
- **@vercel/analytics** — aggregate-only event tracking
- **AI autofill** — Google Gemini REST (free tier, primary) with **@anthropic-ai/sdk** (paid, optional fallback)
- **vitest** — tests
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

- **UI language is Greek.** All user-facing strings are Greek. Variant type labels come from `lib/format.ts` (`formatTypeLabel`): sealed→«Σφραγισμένο», opened→«Ανοιγμένο»; `decant`/`sample` stay Latin by design.
- **Style:** minimal, white background, no gradients, **no emoji in the UI**, no bling. Mobile-first (~90% of traffic is mobile, from Facebook).
- **Diacritic-insensitive matching** is a recurring pattern: a `normalize()` helper (lowercase + NFD strip) appears in `lib/accords.ts`, `lib/note-images.ts`, and slug generation. Reuse it; don't re-implement.
- **Images render unoptimized** (`next.config.ts` disables image optimization; Blob URLs are allowlisted). Use a plain `<img>` for `/public/notes/*` photos, **not** `next/image`.
- **Inventory access is server-only:** `lib/inventory-server.ts` is `import 'server-only'`. Never fetch inventory from a client component — pass data down from a server component.
- **Fill-only-empty everywhere:** both client AI autofill and the server enrichment seed only fill *empty* fields; owner-entered (Blob) values always win.
- **AI autofill must stay free:** the owner requires zero AI charges, so Gemini's free tier is primary *by design* — do not make Anthropic the default. Secrets (`ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `BLOB_READ_WRITE_TOKEN`, `*_API_KEY`) live only in Vercel env / `.env.local`; never commit or paste them into chat.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

### Rendering & routing
Dynamic Next.js app (not static export). Public catalog (`app/page.tsx`) and product pages (`app/product/[id]/page.tsx`) use **ISR** (`export const revalidate = 60`). Admin routes are `force-dynamic`. An **Edge middleware** (`middleware.ts`) gates `/admin/:path*` and `/api/admin/:path*`, allowing only `/admin/login` through unauthenticated.

### Inventory data flow (the core of the app)
Single source of truth is one JSON file, `inventory.json`, in **Vercel Blob**. The checked-in `data/inventory.json` is the bootstrap/fallback used when `BLOB_READ_WRITE_TOKEN` is unset or a Blob fetch fails.

- **Read** — `lib/inventory-server.ts` `fetchInventory()` lists/fetches the Blob (cache-tagged `inventory`, `revalidate:60`), falling back to the local file. Every read is passed through `enrich()`.
- **Enrichment** — `data/note-enrichment.json` (keyed by product id) supplies hand-curated notes / olfactory pyramid / accords / Greek description. `enrich()` **fills only empty fields**, so anything the owner saved via admin overrides the seed. It exists because several products were added before AI autofill, or were never autofilled.
- **Write** — `lib/inventory-store.ts` (`createProduct`/`updateProduct`/`deleteProduct`) read-modify-writes the whole Blob file, then invalidates caches: `revalidateTag('inventory')` + `revalidatePath('/')`, `revalidatePath('/product/[id]','page')`, `revalidatePath('/admin')`.
- **Validation** — `scripts/validate-inventory.mjs` enforces the schema at build time (unique ids, variant types, price/stock integers, `fill_pct` only on `opened`, accords shape).

### Domain model (`lib/types.ts`)
`Product { id, brand, name, line?, images[], notes, top_notes, heart_notes, base_notes, description_gr, accords: {name,intensity}[], active?, variants[] }`. `Variant { id, type, size_ml, price, stock, fill_pct? }` with `type ∈ sealed | opened | decant | sample`. `active === false` hides a product everywhere (filtered from catalog, `/product/[id]` 404s, excluded from cart/copy); `undefined` means active (backward compat).

### Public buyer flow (no checkout, no payment, no login)
Browse (`components/catalog-client.tsx` — variant-type tabs + brand/search/sort filters) → product detail (`components/product-detail.tsx`) → add to cart (`lib/cart-store.ts` — Zustand, localStorage key `marios-shop-cart`, clamps qty to stock) → cart drawer (`components/cart-drawer.tsx`) → **copy order text** (`components/copy-to-messenger-button.tsx` + `lib/copy-format.ts`) to paste into Messenger.

### Fragrantica-style fragrance presentation
- **Main accords bars** (`components/main-accords.tsx` + `lib/accords.ts`): 26 canonical Greek accord labels, each mapped to a fixed color in `ACCORD_DEFS`. `prepareAccords()` sorts by intensity, drops weak (<12), caps at 10, and sizes each bar relative to the strongest. AI autofill and enrichment **must use these exact Greek labels** or a bar renders neutral grey.
- **Olfactory pyramid** (`components/olfactory-pyramid.tsx` + `lib/note-images.ts`): each comma-separated note is matched (diacritic-insensitive, most-specific-first) to a **real ingredient photo** at `public/notes/<slug>.jpg`. Unmatched notes fall back to a serif monogram tile. ⚠️ If `noteImage()` returns a slug but the file is missing, the `<img>` 404s (visible broken image) — every mapped slug needs a real file in `public/notes/`. `node scripts/audit-products.mjs` catches this across all products.

### Admin (owner-facing CMS — no code or JSON editing)
- **Auth:** single `ADMIN_PASSWORD` (constant-time compare, `lib/auth.ts`) → `jose` HS256 JWT in httpOnly cookie `marios_admin` (30-day) → verified by `middleware.ts`.
- **Product form** (`components/admin/product-form.tsx`): fill brand+name, then **«Αυτόματη συμπλήρωση»** calls `app/admin/autofill-action.ts`, which tries **Gemini** (free, `GEMINI_API_KEY`) then **Anthropic** (`ANTHROPIC_API_KEY`), returning structured notes/pyramid/accords/description guarded by a `known` confidence flag to curb hallucination.
- **Images** (`app/admin/upload-action.ts`): `sharp` rotates/resizes to ≤1600px JPEG and uploads to Blob under `products/`; the uploader supports multi-file + reorder, first image is the cover.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
