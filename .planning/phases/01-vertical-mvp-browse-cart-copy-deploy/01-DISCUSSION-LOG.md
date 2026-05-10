# Phase 1: Vertical MVP — Browse, Cart, Copy, Deploy - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-10
**Phase:** 1-Vertical MVP — Browse, Cart, Copy, Deploy
**Areas discussed:** Seed inventory data, Cart state library, Drawer + UX, Visual identity

---

## Seed Inventory Data

### Q1: Ποιά προϊόντα μπαίνουν στο Phase 1 inventory.json;

| Option | Description | Selected |
|--------|-------------|----------|
| Θα σου δώσω τα πραγματικά τώρα | Stop and gather real collection | |
| Placeholder πλασματικά | 5-6 realistic fakes; owner replaces later | ✓ |
| Μόνο 1-2 fakes | Bare minimum to build | |

**User's choice:** Placeholder πλασματικά (Recommended)
**Notes:** Recommended path — keeps momentum, owner edits the JSON when ready.

### Q2: Τι κάνουμε με τις εικόνες προϊόντων για Phase 1;

| Option | Description | Selected |
|--------|-------------|----------|
| External URLs | image_fallback_url to public sources | ✓ |
| Placeholder γκρί πλακάκι | Generic placeholder.svg | |
| Εγώ θα ανεβάσω φωτογραφίες | Owner uploads to /public/products/ | |

**User's choice:** External URLs (Recommended)
**Notes:** No local images committed in Phase 1; owner can swap later.

### Q3: Πόσα products να έχει το seed inventory;

| Option | Description | Selected |
|--------|-------------|----------|
| 5-6 | Enough to test grid + Phase 2 filtering | ✓ |
| 3 | Spec minimum | |
| 10+ | Fuller grid feel | |

**User's choice:** 5-6 (Recommended)

### Q4: Ο σκοπός των seed products;

| Option | Description | Selected |
|--------|-------------|----------|
| Ποικιλία | Diverse brands/types/stock levels (incl stock=0) | ✓ |
| Απλά uniform | Similar items, faster to build | |

**User's choice:** Ποικιλία (Recommended)
**Notes:** Diversity exposes the entire UI surface in development.

---

## Cart State Library

### Q1: Cart state management;

| Option | Description | Selected |
|--------|-------------|----------|
| Zustand | Small bundle, persist middleware, hooks API | ✓ |
| React Context + useReducer | Zero deps, more boilerplate | |
| Jotai | Atomic state, overkill for cart | |

**User's choice:** Zustand (Recommended)

### Q2: Πώς να αποφύγουμε hydration mismatch;

| Option | Description | Selected |
|--------|-------------|----------|
| isHydrated flag | useEffect-set flag, render after rehydrate | ✓ |
| suppressHydrationWarning | Hides warnings, masks bug | |
| Client-only component | Render cart UI client-side only | |

**User's choice:** isHydrated flag (Recommended)

### Q3: Τι ακριβώς περνάει στο localStorage;

| Option | Description | Selected |
|--------|-------------|----------|
| Μόνο ids + qty | { product_id, variant_id, quantity }; price resolved fresh | ✓ |
| Snapshot όλων των δεδομένων | brand/name/price baked in; survives inventory drift | |

**User's choice:** Μόνο ids + qty (Recommended)
**Notes:** Prevents stale prices after redeploy.

### Q4: Αν ένα variant που έχει στο cart γίνει stock=0 μετά από redeploy;

| Option | Description | Selected |
|--------|-------------|----------|
| Μένει στο cart ως unavailable (Phase 2) | CART-12 flagging | |
| Auto-remove στο Phase 1 | Simpler; abrupt for buyer | ✓ |

**User's choice:** Auto-remove στο Phase 1
**Notes:** User chose abrupt-but-simple for Phase 1; Phase 2 (CART-12) will introduce the proper flag-as-unavailable UX.

---

## Drawer + UX

### Q1: Πόθεν ανοίγει το cart drawer σε mobile;

| Option | Description | Selected |
|--------|-------------|----------|
| Από δεξιά (right sheet) | shadcn Sheet, familiar e-shop pattern | ✓ |
| Από κάτω (bottom sheet) | Native mobile feel | |
| Responsive (bottom mobile / right desktop) | Best UX, double effort | |

**User's choice:** Από δεξιά (right sheet) Recommended

### Q2: Τι συμβαίνει όταν πατάς "Προσθήκη";

| Option | Description | Selected |
|--------|-------------|----------|
| Toast + badge update | Sonner toast + counter bump | ✓ |
| Auto-open drawer | Drawer opens immediately | |
| Σκέτο badge bump (silent) | No feedback beyond counter | |

**User's choice:** Toast + badge update (Recommended)

### Q3: Στην σελίδα product, το "Προσθήκη" για κάθε variant;

| Option | Description | Selected |
|--------|-------------|----------|
| Απλό +1 click | Each click adds 1; +/- in drawer | ✓ |
| Quantity stepper δίπλα στο κουμπί | Per-product stepper | |

**User's choice:** Απλό +1 click (Recommended)
**Notes:** Quantity adjustments handled inside the drawer (CART-07, Phase 2).

### Q4: Το sticky cart button κάτω δεξιά;

| Option | Description | Selected |
|--------|-------------|----------|
| Πάντα visible | Even when cart empty | ✓ |
| Μόνο όταν cart έχει >=1 item | Cleaner empty state, more disorienting | |

**User's choice:** Πάντα visible (Recommended)

---

## Visual Identity

### Q1: Accent color για primary buttons, links, active filters;

| Option | Description | Selected |
|--------|-------------|----------|
| Μαύρο (true minimal) | Apple-store / fragrance-brand vibe | ✓ |
| Deep navy | Warmer, adds a color | |
| Burgundy / wine | Niche-perfume vibe, locks a mood | |

**User's choice:** Μαύρο (true minimal) Recommended

### Q2: Hero treatment;

| Option | Description | Selected |
|--------|-------------|----------|
| Σκέτο wordmark + tagline | Centered on white, ~140-180px | |
| Subtle band (απαλό gray/cream) | Tinted band, editorial feel | ✓ |
| Sticky compact header | No real hero, products start immediately | |

**User's choice:** Subtle band (απαλό gray/cream)
**Notes:** Editorial / catalog vibe; distinguishes hero from grid without being loud.

### Q3: Τα chips για sealed/opened/decant - πόσο έντονα;

| Option | Description | Selected |
|--------|-------------|----------|
| Soft tones | Pastel bg + saturated text | ✓ |
| Solid κορεσμένα | Pure chips, more visible | |
| Outline-only | Borders + text only, very low-key | |

**User's choice:** Soft tones (Recommended)

### Q4: Product cards style;

| Option | Description | Selected |
|--------|-------------|----------|
| Borderless + τονισμένη φωτο | Image-first, no border/shadow | |
| Bordered card | shadcn default, traditional e-shop | |
| Soft shadow, no border | Subtle lift | ✓ |

**User's choice:** Soft shadow, no border
**Notes:** Spec says "no bling" — keep `shadow-sm` resting; optional `hover:shadow-md` on desktop only.

---

## Claude's Discretion

- Exact Tailwind shades within locked palette (e.g., `stone-50` vs `neutral-50` for hero band)
- Card image aspect ratio (4:3 vs 1:1)
- Exact font sizes, spacing scale, breakpoint tweaks beyond `1/2/3/4` cols
- Sonner toast position, duration, theme
- ESLint/Prettier config (Next.js defaults)

## Deferred Ideas

- CART-12 stock-flagging UX → Phase 2
- CART-04 stock-clamp toast → Phase 2
- Quantity stepper on product page → explicitly rejected for v1
- Filters/search/sort → Phase 2
- `fill_pct` in copy-to-Messenger text → omitted for compactness
- Local `/public/products/*` photos → owner uploads at own pace
- PROD-09 (404 polish) → Phase 2 (skeleton ships in Phase 1 for export)
