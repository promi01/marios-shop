# Marios Shop

## What This Is

Στατικό e-shop-style site για το προσωπικό στοκ αρωμάτων του Μάριου. Αντί για ένα Google Drive link με φωτογραφίες, μοιράζεται ένα URL σε ένα Facebook group όπου οι φίλοι/follower μπορούν να περιηγηθούν στη συλλογή, να φτιάξουν "καλάθι" και να αντιγράψουν την παραγγελία ως καθαρό κείμενο για να την στείλουν στο Messenger.

## Core Value

Ένας επισκέπτης από Facebook (κυρίως κινητό) μπορεί σε <30 δευτερόλεπτα να βρει αρώματα που τον ενδιαφέρουν, να φτιάξει λίστα παραγγελίας, και να την αντιγράψει για Messenger — χωρίς εγγραφή, χωρίς πληρωμή, χωρίς τριβή.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Στατικό site χωρίς backend, αναπτυσσόμενο σε Vercel (static export)
- [ ] Homepage με hero, grid από product cards, φίλτρα (τύπος/brand/text), sort
- [ ] Σελίδα προϊόντος με όλα τα variants και stock indicators
- [ ] Cart drawer με persistence στο localStorage
- [ ] "Αντιγραφή για Messenger" — formatted text σύμφωνα με spec
- [ ] Inventory διαβάζεται από `/data/inventory.json` (single source of truth)
- [ ] Mobile-first UI στα Ελληνικά με minimal aesthetic
- [ ] Vercel Analytics με custom events (product_viewed, added_to_cart, cart_copied)

### Out of Scope

- Payments / checkout — η συναλλαγή κλείνει manual μέσω Messenger
- User accounts / login — δεν υπάρχει concept χρήστη
- Backend / database — όλο το state είναι στο `inventory.json` + localStorage
- Server-side rendering / dynamic routes — output: 'export' only
- Πολυγλωσσία — μόνο Ελληνικά για τώρα
- Reviews / ratings — δεν χρειάζεται για προσωπικό στοκ
- Admin UI για inventory — επεξεργάζεται απευθείας το JSON
- Image hosting service — εικόνες στο /public/products/ ή external fallback URL

## Context

**Τύπος προϊόντος:** Αρώματα — sealed (σφραγισμένα), opened (ανοιγμένα με fill_pct), και decants (μικρά μπουκάλια απο-εμφιαλωμένα). Κάθε προϊόν έχει ένα ή πολλά variants με δικό τους size_ml, price, stock.

**Κοινό:** ~90% mobile traffic μέσω Facebook group link. Δεν περιμένεις επανερχόμενους χρήστες — κάθε επίσκεψη πιθανότατα είναι one-shot browse.

**Ροή παραγγελίας:** Browse → Add to cart → Copy formatted text → Άνοιγμα Messenger → Paste → Συνεννόηση και πληρωμή εκτός site.

**Inventory churn:** Το στοκ αλλάζει συχνά (σπάνια αρώματα, decants εξαντλούνται). Ο Μάριος επεξεργάζεται απευθείας το `inventory.json` και κάνει redeploy μέσω Vercel.

## Constraints

- **Tech stack:** Next.js 15 (App Router) + TypeScript, Tailwind CSS, shadcn/ui — επιλέχθηκε από τον owner
- **Deploy:** Vercel με `output: 'export'` (zero backend) — προϋπόθεση για το cost (free tier) και τη φιλοσοφία no-ops
- **Γλώσσα UI:** Ελληνικά — στοχευμένο κοινό
- **Mobile-first:** ~90% κινητό από Facebook
- **Στυλ:** minimal, λευκό background, Inter/Geist typography. Όχι gradients, όχι emoji στο UI, όχι bling
- **Storage:** μόνο localStorage (key: `marios-shop-cart`) — όχι cookies, όχι backend persistence
- **Privacy:** Vercel Analytics είναι aggregate-only — όχι PII tracking

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 15 + static export (όχι Astro/Vite) | App Router familiarity, shadcn/ui ecosystem, Vercel deploy out-of-the-box | — Pending |
| `inventory.json` ως single source of truth | Zero backend, easy edits, version-controlled inventory | — Pending |
| Cart state: Zustand ή React Context + localStorage | Lightweight, persistence μέσω middleware | — Pending |
| Cart ως drawer/sheet (όχι /cart route) | Mobile-friendly, λιγότερα clicks | — Pending |
| Plain-text "Copy to Messenger" (όχι deep link) | Messenger deep links είναι unreliable σε iOS/Android — clipboard δουλεύει παντού | — Pending |
| Vercel Analytics custom events | Lightweight, αρκετό για το scope (δεν χρειάζεται GA4) | — Pending |
| Badges per variant type (sealed/opened/decant) | Κρίσιμο visual cue για τον αγοραστή — διαφορετικό value prop | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-10 after initialization*
