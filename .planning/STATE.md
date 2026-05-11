---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-05-11T11:11:07Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 7
  completed_plans: 1
  percent: 14
---

# State: Marios Shop

**Last updated:** 2026-05-11

## Project Reference

**Core value:** Facebook visitor (mostly mobile) builds a perfume order list in <30s and copies it for Messenger — no signup, no payment, no friction.
**Mode:** mvp (yolo)
**Granularity:** coarse
**Structure:** Vertical MVP (every phase delivers end-to-end user-visible slice)
**Tech stack:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui, static export, Vercel deploy.

## Current Position

Phase: 1 (Vertical MVP — Browse, Cart, Copy, Deploy) — EXECUTING
Plan: 2 of 7 (Plan 01 complete, ready for Plan 02 — Catalog)

- **Milestone:** v1
- **Phase:** 1 — Vertical MVP — Browse, Cart, Copy, Deploy
- **Plan:** 01-01 Walking Skeleton — COMPLETE
- **Status:** Executing Phase 1
- **Progress:** 1/7 plans complete in Phase 1; 0/4 phases complete

```
[#---] 0/4 phases complete (Phase 1: 1/7 plans)
```

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases planned | 4 |
| Phases complete | 0 |
| Plans complete | 1 |
| v1 requirements | 65 |
| v1 requirements mapped | 65 |
| Coverage | 100% |
| Plan 01-01 duration (seconds) | 458 |
| Plan 01-01 tasks completed | 2 |
| Plan 01-01 files created | 26 |

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

- Execute Plan 02 (Catalog): format helpers + VariantBadge + Hero + responsive ProductGrid + ProductCard.

### Blockers

(none)

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

## Session Continuity

**Next action:** Execute Plan 01-02 (Catalog: Hero + ProductGrid + ProductCard + VariantBadge + format helpers).

**Last action:** Completed Plan 01-01 Walking Skeleton — Next.js 15 + Tailwind v4 + shadcn + Zustand scaffolded with 1 seed product end-to-end. `npm run build` produces `out/index.html` and `out/product/tom-ford-tobacco-vanille.html`.

**Last session:** 2026-05-11T11:11:07Z
**Stopped at:** Completed 01-01-PLAN.md
**Resume file:** `.planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-02-PLAN.md` (next plan to execute)

**Files of record:**

- `.planning/PROJECT.md` — vision, constraints, decisions
- `.planning/REQUIREMENTS.md` — 65 v1 requirements with phase traceability
- `.planning/ROADMAP.md` — 4 phases with success criteria
- `.planning/config.json` — mode=yolo, granularity=coarse

---
*Initialized: 2026-05-10*
