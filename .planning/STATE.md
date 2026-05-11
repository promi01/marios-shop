---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 01-02-PLAN.md
last_updated: "2026-05-11T11:17:07Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 7
  completed_plans: 2
  percent: 29
---

# State: Marios Shop

**Last updated:** 2026-05-11 (Plan 01-02 complete)

## Project Reference

**Core value:** Facebook visitor (mostly mobile) builds a perfume order list in <30s and copies it for Messenger — no signup, no payment, no friction.
**Mode:** mvp (yolo)
**Granularity:** coarse
**Structure:** Vertical MVP (every phase delivers end-to-end user-visible slice)
**Tech stack:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui, static export, Vercel deploy.

## Current Position

Phase: 1 (Vertical MVP — Browse, Cart, Copy, Deploy) — EXECUTING
Plan: 3 of 7 (Plans 01–02 complete, ready for Plan 03 — Product Detail)

- **Milestone:** v1
- **Phase:** 1 — Vertical MVP — Browse, Cart, Copy, Deploy
- **Plan:** 01-02 Catalog — COMPLETE
- **Status:** Executing Phase 1
- **Progress:** [███░░░░░░░] 29%

```
[#---] 0/4 phases complete (Phase 1: 2/7 plans)
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases planned | 4 |
| Phases complete | 0 |
| Plans complete | 2 |
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

- Execute Plan 03 (Product Detail): BackLink + VariantRow + ProductDetail composition + polished 404.

### Blockers

(none)

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

**Next action:** Execute Plan 01-03 (Product Detail: BackLink + VariantRow + ProductDetail composition + polished 404).

**Last action:** Completed Plan 01-02 Catalog — Hero + responsive 1/2/3/4 ProductGrid + ProductCard wired, lib/format.ts contracted, shadcn Badge extended with sealed/opened/decant tone variants. `npm run build` exits 0 and out/index.html contains wordmark, tagline, Tom Ford Tobacco Vanille, 180€, and Σφραγισμένο badge.

**Last session:** 2026-05-11T11:17:07Z
**Stopped at:** Completed 01-02-PLAN.md
**Resume file:** `.planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-03-PLAN.md` (next plan to execute)

**Files of record:**

- `.planning/PROJECT.md` — vision, constraints, decisions
- `.planning/REQUIREMENTS.md` — 65 v1 requirements with phase traceability
- `.planning/ROADMAP.md` — 4 phases with success criteria
- `.planning/config.json` — mode=yolo, granularity=coarse

---
*Initialized: 2026-05-10*
