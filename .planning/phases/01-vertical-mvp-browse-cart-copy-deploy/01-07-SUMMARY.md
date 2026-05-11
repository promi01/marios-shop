---
phase: 01-vertical-mvp-browse-cart-copy-deploy
plan: 07
subsystem: inventory-seed-and-production-deploy
tags: [inventory, seed-data, vercel-deploy, d-01, d-02, d-03, inv-05, found-05, dep-01, checkpoint-deferred, owner-action-required]
one_liner: "Replace the 1-product Walking-Skeleton seed with the full Phase 1 catalog (5 products / 5 brands covering D-01/D-02 surface — Tom Ford, Loewe, Creed, MFK, Nishane). Task 1 ships; Task 2 (Vercel production deploy) is DEFERRED to owner because the Vercel CLI auth flow requires browser-based login that Claude cannot perform."
dependency_graph:
  requires:
    - "01-01..01-06 — full Phase 1 vertical (catalog, product detail, cart store, drawer, copy-to-messenger) already shipped against the 1-product seed"
    - "lib/inventory.ts typed import surface (Plan 01-01) → products array consumed by generateStaticParams + getProductById"
    - "lib/copy-format.test.ts (Plan 01-06) → 5 vitest tests still pass against the expanded seed (they use synthetic fixtures, not data/inventory.json — verified)"
  provides:
    - "data/inventory.json (replaced) → 5 realistic placeholder products from 5 distinct brands, all variant types covered, stock=0 path exercised, fill_pct present on one opened variant"
    - "Production-ready build artifact (out/) → static HTML for all 5 product ids at out/product/{id}.html, plus out/index.html catalog and out/_not-found/index.html"
  affects:
    - "Catalog (out/index.html) — now shows 5 product cards across all four responsive breakpoints"
    - "Product detail (out/product/{id}.html × 5) — each gets its own statically generated page via generateStaticParams"
    - "Cart drawer + copy text — multi-item paste now exercisable (was previously single-item-only with the 1-product seed)"
    - "Phase 1 deploy story — local build is ready; production URL still pending owner Vercel auth (Task 2)"
tech_stack:
  added: []
  patterns:
    - "Seed expansion is data-only (no code changes) — the typed JSON import + generateStaticParams pattern from Plan 01-01 absorbs the new product set without any loader changes."
    - "Loewe canonical naming contract enforced across three sources: UI-SPEC §Copy-to-Messenger Format example, lib/copy-format.test.ts fixture, and data/inventory.json seed all use 'loewe-bittersweet-oud' / 'Bittersweet Oud' identically."
    - "Variant id namespace per product: short abbreviation + size + type (e.g. `tvf-50-sealed`, `bso-100-opened`, `av-100-sealed`, `br540-70-sealed`, `hac-50-sealed`). All 10 variant ids unique across the seed."
key_files:
  created:
    - ".planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-07-SUMMARY.md"
  modified:
    - "data/inventory.json (1 → 5 products, 1 → 10 variants)"
decisions:
  - "Task 2 (Vercel production deploy) is DEFERRED — checkpoint:human-action explicitly required owner login. Claude executed Task 1 (seed expansion + local build verification) and documented exact owner steps below. DEP-01 stays Pending in REQUIREMENTS.md."
  - "Image URLs use fragrantica thumbnail format (`https://fimgs.net/mdimg/perfume/375x500.{id}.jpg`) for all 5 products. Per CONTEXT D-03 these are sole Phase 1 image source; next.config.ts has `images.unoptimized: true` so any HTTPS URL works without host allowlisting. Owner replaces with his own photos later by editing the JSON and pushing to main."
  - "Loewe canonical naming preserved verbatim — `id: 'loewe-bittersweet-oud'` + `name: 'Bittersweet Oud'`. The plan explicitly forbade renaming to a real-world Loewe oud (e.g. `001 Man`, `Solo Cedro`) because that would break Plan 06's `lib/copy-format.test.ts` fixture (`brand: 'Loewe', name: 'Bittersweet Oud'`) and the UI-SPEC §Copy-to-Messenger Format example (which renders `Loewe — Bittersweet Oud` byte-for-byte). The grep gate `Esencia Loewe` returns 0 — the incorrect alternative name is absent."
  - "Plan 06's 5 vitest tests pass unchanged against the expanded seed. The test file uses synthetic ResolvedItem fixtures (Tom Ford 50ml × 1 / Tom Ford 50ml × 1 + Loewe 100ml × 2 / decimal-price decant / opened-with-fill_pct contract / empty list) — none of them import data/inventory.json, so seed changes are isolated from the test surface. Verified by running `npm test` post-Write: 5/5 pass in 270ms."
  - "Variant id format choice: I used short brand-prefix abbreviations (`tvf`, `bso`, `av`, `br540`, `hac`) rather than full slugs because product-scoped uniqueness is the only invariant (Plan 02 docs note INV-04's cross-product check ships in Phase 2). Keeps the JSON readable and the variant ids short for the Messenger paste preview."
  - "Build verification was scoped to: `npm test` (5/5 pass), `npm run build` (exits 0, 9 static pages), and grep gates against the generated HTML (`Εξαντλήθηκε` in Creed page, `Bittersweet Oud` in Loewe page, `Tom Ford` + `Nishane` in homepage). The fragrantica image URLs are NOT fetched at build time (next.config.ts `images.unoptimized: true` defers to runtime per CONTEXT D-23) — so the build cannot fail on a 404'd image, only on a malformed URL string. All 5 URLs are syntactically valid HTTPS."
  - "Atomic commit `eb274cc` carries the entire seed expansion — single file diff, no collateral changes to lib/, components/, or app/. The clean diff keeps the audit trail simple for Phase 2's INV-04 build-time validator (when it lands, it will validate this exact JSON shape unchanged)."
  - "Task 2 deferral path: documented in the `Task 2 — DEFERRED (Owner Action Required)` section below as exact CLI commands and dashboard click-through. Owner picks Path A (Vercel CLI) or Path B (Vercel dashboard + GitHub) — both produce DEP-01 + FOUND-05's production URL."
metrics:
  duration_seconds: 75
  completed_date: "2026-05-11T14:55:00Z"
  tasks_completed: 1
  tasks_deferred: 1
  files_created: 1
  files_modified: 1
---

# Phase 1 Plan 7: Full Seed Inventory + Vercel Deploy Summary

Replaced the Walking Skeleton's 1-product `data/inventory.json` with the full Phase 1 seed: 5 realistic placeholder products from 5 distinct brands (Tom Ford, Loewe, Creed, MFK, Nishane) covering all CONTEXT D-01 / D-02 / D-03 requirements. Task 1 (seed + local build verification) ships; Task 2 (Vercel production deploy) is DEFERRED to owner action because Vercel CLI login requires browser-based auth that Claude cannot perform. Exact owner steps are documented below.

## Completed Tasks

| Task | Name | Commit | Status | Files |
| ---- | ---- | ------ | ------ | ----- |
| 1 | Expand seed inventory to 5 products (D-01/D-02 surface) | `eb274cc` | DONE | `data/inventory.json` |
| 2 | Vercel production deploy (checkpoint:human-action) | — | **DEFERRED — Owner Action Required** | none yet |

## Task 1 — What Shipped

**Seed inventory expanded from 1 product (1 variant) to 5 products (10 variants).**

### Five products

| # | id (slug) | brand | name | line | variants |
| - | --- | --- | --- | --- | --- |
| 1 | `tom-ford-tobacco-vanille` | Tom Ford | Tobacco Vanille | Private Blend | sealed 50ml @ 180€ (stock 3); decant 10ml @ 38€ (stock 6) |
| 2 | `loewe-bittersweet-oud` | Loewe | Bittersweet Oud | — | opened 100ml @ 95€ (stock 1, fill_pct 85); decant 5ml @ 18€ (stock 8) |
| 3 | `creed-aventus` | Creed | Aventus | — | sealed 100ml @ 320€ (**stock 0**); decant 10ml @ 55€ (stock 4) |
| 4 | `mfk-baccarat-rouge-540` | Maison Francis Kurkdjian | Baccarat Rouge 540 | — | sealed 70ml @ 280€ (stock 2); decant 5ml @ 32€ (stock 10) |
| 5 | `nishane-hacivat` | Nishane | Hacivat | Extrait de Parfum | sealed 50ml @ 145€ (stock 4); decant 10ml @ 32€ (stock 7) |

### D-01 / D-02 / D-03 Audit (all pass)

| Constraint | Source | Result |
|------------|--------|--------|
| 5–6 placeholder products | D-01 | 5 products ✓ |
| ≥ 3 distinct brands | D-02 | 5 brands (Tom Ford, Loewe, Creed, MFK, Nishane) ✓ |
| All three variant types present | D-02 | sealed × 4, opened × 1, decant × 5 ✓ |
| ≥ 1 variant with `stock = 0` | D-02 | exactly 1 (Creed `av-100-sealed`) ✓ |
| ≥ 1 `opened` variant with `fill_pct` | D-02 | Loewe `bso-100-opened` fill_pct=85 ✓ |
| Every product has `image_fallback_url` | D-03 | 5/5 fragrantica HTTPS URLs ✓ |
| `image` field is null/empty (no local /public/products/) | D-03 | 5/5 image=null ✓ |
| Loewe canonical naming (`loewe-bittersweet-oud` / `Bittersweet Oud`) | UI-SPEC §Copy-to-Messenger Format + Plan 06 test fixture | matches exactly ✓ |
| `Esencia Loewe` does NOT appear (incorrect name absent) | Plan 07 verification gate | grep returns 0 ✓ |

### Verification — Local Build Gates

```
$ npm test
 RUN  v4.1.5
 Test Files  1 passed (1)
      Tests  5 passed (5)
   Duration  270ms

$ npm run build
 ▲ Next.js 15.5.18
 ✓ Compiled successfully in 3.1s
 ✓ Generating static pages (9/9)
 ✓ Exporting (2/2)

Route (app)                                 Size  First Load JS
┌ ○ /                                      297 B         182 kB
├ ○ /_not-found                            123 B         103 kB
└ ● /product/[id]                        3.06 kB         204 kB
    ├ /product/tom-ford-tobacco-vanille
    ├ /product/loewe-bittersweet-oud
    ├ /product/creed-aventus
    └ [+2 more paths]
```

`out/product/{id}.html` exists for all five product ids. Bundle size grew marginally (`/product/[id]` route 2.31 kB → 3.06 kB) — proportional to the increase in `generateStaticParams()` output but well under any practical limit.

### Grep Gates (all pass)

| Gate | File | Found | Expected |
|------|------|-------|----------|
| `Tom Ford` | data/inventory.json | ≥ 1 | ≥ 1 ✓ |
| `Loewe` | data/inventory.json | ≥ 1 | ≥ 1 ✓ |
| `Bittersweet Oud` | data/inventory.json | ≥ 1 | ≥ 1 ✓ |
| `loewe-bittersweet-oud` | data/inventory.json | ≥ 1 | ≥ 1 ✓ |
| `Esencia Loewe` | data/inventory.json | 0 | 0 ✓ (incorrect name absent) |
| `Creed` | data/inventory.json | ≥ 1 | ≥ 1 ✓ |
| `Maison Francis Kurkdjian` | data/inventory.json | ≥ 1 | ≥ 1 ✓ |
| `Nishane` | data/inventory.json | ≥ 1 | ≥ 1 ✓ |
| `"stock": 0` | data/inventory.json | 1 | ≥ 1 ✓ |
| `"fill_pct":` | data/inventory.json | 1 | ≥ 1 ✓ |
| `"sealed"` | data/inventory.json | 4 | ≥ 1 ✓ |
| `"opened"` | data/inventory.json | 1 | ≥ 1 ✓ |
| `"decant"` | data/inventory.json | 5 | ≥ 1 ✓ |
| `Εξαντλήθηκε` | out/product/creed-aventus.html | ≥ 1 | ≥ 1 ✓ |
| `Bittersweet Oud` | out/product/loewe-bittersweet-oud.html | ≥ 1 | ≥ 1 ✓ |
| `Tom Ford` | out/index.html | ≥ 1 | ≥ 1 ✓ |
| `Nishane` | out/index.html | ≥ 1 | ≥ 1 ✓ |

All gates pass.

### Variant ID Uniqueness Audit (manual — INV-04 build-time validator lands in Phase 2)

All 10 variant ids are unique across the seed: `tvf-50-sealed`, `tvf-10-decant`, `bso-100-opened`, `bso-5-decant`, `av-100-sealed`, `av-10-decant`, `br540-70-sealed`, `br540-5-decant`, `hac-50-sealed`, `hac-10-decant`. Within each product, the variant ids are also unique (a stronger invariant — the one Phase 2's INV-04 will enforce). No duplicates found.

## Task 2 — DEFERRED (Owner Action Required)

**Why:** `vercel login` opens a browser to complete OAuth authentication against your Vercel account. Claude does not have access to your browser session or your Vercel credentials — this step is structurally human-only. Once you're logged in, the rest of the deploy can be either dashboard-driven (Path B) or CLI-driven (Path A).

The codebase is **production-ready right now** — `npm run build` exits 0 against the 5-product seed and the `out/` directory contains all the static HTML Vercel will serve. The only remaining work is the Vercel project link + deploy.

### Path A — Vercel CLI (faster if you don't mind a one-time browser login)

Run from the repo root `C:\Users\user\Desktop\CLAUDE CODE\marios shop`:

```
npm install -g vercel
vercel login
```

After `vercel login` opens your browser and you complete authentication, return to the terminal:

```
vercel link
```

Accept the defaults to create a new Vercel project named `marios-shop` (or any name you prefer). This writes a `.vercel/project.json` linking the repo to your Vercel project.

Deploy a preview to confirm Vercel's build matches the local build:

```
vercel
```

Vercel will print a preview URL like `https://marios-shop-{hash}-{username}.vercel.app`. Open it on a mobile browser (or DevTools mobile emulation) and confirm the full smoke test:
1. Hero "Marios Shop" + tagline visible at the top.
2. All 5 product cards render with images, brand, name, lowest-price line, badges.
3. Tap any card → `/product/{id}` loads with hero image + variants list.
4. On Creed Aventus, the 100ml sealed variant shows `Εξαντλήθηκε` (greyed disabled stub) instead of the "Προσθήκη" button.
5. Tap "Προσθήκη" on any in-stock variant → Sonner toast `Προστέθηκε: {brand} — {name}`, sticky cart FAB badge increments.
6. Tap the FAB → drawer opens with the item. Add a few more → multi-item drawer works.
7. Tap "📋 Αντιγραφή για Messenger" → success toast. Paste into any text field — the multi-item Messenger format renders correctly.
8. Refresh the page → cart contents persist (localStorage `marios-shop-cart`).

Then promote to production:

```
vercel --prod
```

Copy the resulting production URL (e.g. `https://marios-shop.vercel.app`).

For **DEP-01 (auto-deploy from `main`)**: open the Vercel dashboard → your project → Settings → Git → connect your GitHub/GitLab/Bitbucket repo. Set the production branch to `main`. From then on every push to `main` triggers a production deploy automatically.

### Path B — Vercel dashboard + GitHub import (no CLI needed)

If you'd rather skip the CLI entirely:

1. Create an empty GitHub repo (e.g. `marios-shop`) via the GitHub web UI.
2. From this repo root, push the local commits:
   ```
   git remote add origin https://github.com/{your-username}/marios-shop.git
   git branch -M main
   git push -u origin main
   ```
3. Open https://vercel.com/new and click **Import** on the `marios-shop` repository.
4. Accept the auto-detected Next.js framework preset (Vercel reads `next.config.ts`'s `output: 'export'` and serves `out/` as a static site).
5. Click **Deploy**. Vercel builds and gives you the production URL.

Path B handles DEP-01 implicitly — Vercel auto-deploys every push to `main` once the GitHub repo is linked. No dashboard click-through needed.

### When Task 2 completes

Once you have the production URL:

1. Run the full smoke test from Path A step 4 against the live URL.
2. Update this file's frontmatter `tasks_deferred: 1` → `tasks_deferred: 0`, add `tasks_completed: 2`, paste the production URL into a new `## Task 2 — Completed (Owner)` section.
3. Mark `DEP-01` and `FOUND-05` complete in `.planning/REQUIREMENTS.md` (currently both still Pending; only `INV-05` was marked complete in this partial-completion run).
4. Update `.planning/STATE.md` to flip Phase 1 to "Complete" and advance to Phase 2 (`/gsd-execute-phase 2`).

## Plan 07 Surface — Final File Paths

```
data/
  inventory.json         (replaced — 1 product → 5 products, 1 → 10 variants)
.planning/phases/01-vertical-mvp-browse-cart-copy-deploy/
  01-07-SUMMARY.md       (this file)
```

No code changes. No test changes. The full Phase 1 vertical (Plans 01–06) already handles the expanded seed without modification — proven by `npm test` + `npm run build` passing on first try.

## Decisions Made

1. **Followed the plan's seed JSON verbatim.** Every field — slugs, variant ids, prices, stock numbers, fill_pct, image_fallback_url values — comes from the plan's `<action>` block exactly as written. No "improvements" or substitutions. Plan 07's planner pre-audited the seed against D-01/D-02/D-03, so any deviation would risk breaking that audit.

2. **Loewe canonical naming locked.** `loewe-bittersweet-oud` / `Bittersweet Oud` is the cross-document contract anchored in UI-SPEC §Copy-to-Messenger Format AND `lib/copy-format.test.ts` (Plan 06 fixture). Renaming the product to a real-world Loewe oud (e.g. `001 Man`, `Solo Cedro`) would have broken Plan 06's tests and the UI-SPEC byte-equality fixture. The product description-side text uses "Loewe oud" generically — owner can swap the description/notes/image later without touching the slug/name.

3. **Task 2 deferred via SUMMARY documentation, NOT via a "phantom commit".** The plan instructs `type="checkpoint:human-action"` which means STOP and let a human handle auth. I executed that exactly: no Vercel commands run, no `.vercel/` directory, no fake CLI output. The SUMMARY documents the exact two paths (CLI vs dashboard) so the owner can pick whichever fits their workflow.

4. **Used fragrantica HTTPS image URLs.** Per CONTEXT D-03 + the plan's `<action>` note: any HTTPS URL works because `next.config.ts` has `images.unoptimized: true`. If a specific URL 404s in the browser, the owner replaces it by editing data/inventory.json (per the plan's runtime note and CONTEXT §Deferred Ideas — Local product photos).

5. **Verified seed expansion does NOT break Plan 06's tests.** The plan said "npm test still passes (Plan 06's format tests use synthetic data, not the seed)". Confirmed by running `npm test` post-Write: 5/5 tests still pass in 270ms. The test file uses inline `ResolvedItem` fixtures, never imports `data/inventory.json` — seed changes are isolated.

6. **Atomic single-file commit (`eb274cc`) for Task 1.** Clean diff: 1 file changed, 61 insertions, 4 deletions. No collateral changes to lib/, components/, app/, or config. Makes Phase 2's eventual INV-04 build-time validator trivially auditable against this exact JSON shape.

7. **REQUIREMENTS.md partial completion.** Only `INV-05` ("Sample inventory with ≥3 real products") is marked complete — that's the requirement Task 1 alone satisfies. `FOUND-05` ("Project deployable on Vercel...") and `DEP-01` ("Vercel project linked with auto-deploys from main") remain Pending until owner completes Task 2. Marking FOUND-05 + DEP-01 complete before the production URL is live would be incorrect — the deploy hasn't happened yet, only the code is deploy-ready.

## Deviations from Plan

### Auto-fixed Issues

None — Plan 07 Task 1 executed exactly as written. The seed JSON in the plan's `<action>` block is the seed JSON now in `data/inventory.json`, byte-for-byte. All grep gates passed on first run, `npm test` passed first try, `npm run build` exited 0 first try.

### Deferred Actions

- **Task 2 (Vercel production deploy)** — Deferred to owner action per `type="checkpoint:human-action"` semantics. Exact steps documented above in `Task 2 — DEFERRED (Owner Action Required)`. No code changes pending; the codebase is production-ready right now.

## Authentication Gates

**Task 2 IS the authentication gate.** Vercel CLI login (`vercel login`) and/or the Vercel dashboard's Git integration require browser-based OAuth against the owner's Vercel + GitHub accounts. Claude cannot perform either step. This is exactly the `human-action` checkpoint contract from `references/checkpoints.md` — the 1% case of a truly unavoidable manual step.

Per the executor protocol's "auth-gate" doc:
- Recognized as an auth gate (not a bug)
- Stopped current task (Task 2)
- Documented the exact auth steps the owner must take (two paths above)
- Specified verification command for each path (the 8-step smoke test against the live URL)

No code was committed for Task 2 — committing fake deploy artifacts would have polluted the audit trail. The SUMMARY is the only artifact for Task 2, by design.

## Known Stubs

None for Plan 07 itself. The seed JSON is the final Phase 1 surface — owner replaces with his actual collection by editing the JSON file later, but that's an explicitly deferred D-01 action ("Owner replaces with his actual collection by editing data/inventory.json") and not a stub in the codebase.

Pre-existing Phase 2 stubs unchanged by Plan 07 (these were already documented in Plan 01-03's SUMMARY and earlier):
- **PROD-05** "Εξαντλήθηκε" disabled stub for stock=0 — Phase 1 ships a disabled-button visual; Plan 07's Creed Aventus 100ml sealed variant now exercises this path in the live HTML (`grep "Εξαντλήθηκε" out/product/creed-aventus.html` returns 1).
- **PROD-07** `fill_pct` rendering on opened variants — Phase 1 stores `fill_pct: 85` on Loewe `bso-100-opened` in the data but does NOT render it in the UI. Phase 2 surfaces it as "Γέμιση: 85%" per UI-SPEC.
- **CART-12** stock=0 cart flagging — Phase 1 silently auto-removes (D-08); Phase 2 will replace with proper "items unavailable" UX.
- **CART-04** stock-clamp toast on Add — Phase 1 enforces clamp silently; Phase 2 adds user-facing toast.

None of the above are blockers for Phase 1 shipping. They're explicitly mapped to Phase 2 per the ROADMAP coverage table.

## Threat Flags

None — Plan 07 changes only `data/inventory.json`, which is read at build time by a typed JSON import (no network fetch, no runtime parse, no untrusted input). The image_fallback_url values are HTTPS URLs to a public CDN (fragrantica.com / fimgs.net); they're loaded by `next/image` with `unoptimized: true` at the visitor's browser. No new auth paths, no new schema at trust boundaries, no new network endpoints introduced by the data change.

Task 2's deploy will add a public production URL — that's the intended outcome of Phase 1 (FOUND-05 + DEP-01). It's not a new threat surface because:
- The site is fully static (no API routes, no server runtime)
- No PII / no auth / no payment endpoints exist on the site
- localStorage (cart persistence) is client-side only, never sent over the wire
- Vercel Analytics is deferred to Phase 4

## Self-Check: PASSED

Files asserted by Self-Check:
- FOUND: `data/inventory.json` (modified — replaces 1-product seed with 5-product seed)
- FOUND: `out/product/tom-ford-tobacco-vanille.html`
- FOUND: `out/product/loewe-bittersweet-oud.html`
- FOUND: `out/product/creed-aventus.html`
- FOUND: `out/product/mfk-baccarat-rouge-540.html`
- FOUND: `out/product/nishane-hacivat.html`
- FOUND: `out/index.html` (contains `Tom Ford`, `Loewe`, `Creed`, `Maison Francis Kurkdjian`, `Nishane`)
- FOUND: `.planning/phases/01-vertical-mvp-browse-cart-copy-deploy/01-07-SUMMARY.md` (this file)

Commits asserted by Self-Check:
- FOUND: `eb274cc` (Task 1 — `feat(01-07): expand seed inventory to 5 products covering D-01/D-02`)

Tasks NOT in Self-Check (deferred):
- Task 2 commit — DEFERRED, no commit exists by design (owner must run Vercel CLI / dashboard).
