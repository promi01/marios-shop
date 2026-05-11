# Requirements: Marios Shop

**Defined:** 2026-05-10
**Core Value:** Visitor από Facebook (mostly mobile) μπορεί σε <30s να βρει αρώματα, να φτιάξει λίστα, και να την αντιγράψει για Messenger — χωρίς εγγραφή, χωρίς πληρωμή.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Next.js 15 (App Router) + TypeScript project που buildάρει με `output: 'export'` σε static files *(Plan 01-01)*
- [x] **FOUND-02**: Tailwind CSS + shadcn/ui εγκατεστημένα και functional *(Plan 01-01)*
- [x] **FOUND-03**: TypeScript types ορισμένα για το inventory schema (Product, Variant, VariantType, CartItem) *(Plan 01-01)*
- [x] **FOUND-04**: Inventory διαβάζεται από `/data/inventory.json` σε build time (typed import ή loader) *(Plan 01-01)*
- [ ] **FOUND-05**: Project deployable στο Vercel ως static site με προεπισκόπηση και production URL

### Inventory & Data

- [x] **INV-01**: `inventory.json` schema υποστηρίζει: `id`, `brand`, `name`, `line`, `image`, `image_fallback_url`, `notes`, `description_gr`, `variants[]` *(Plan 01-01)*
- [x] **INV-02**: Variants schema υποστηρίζει: `id`, `type` (sealed/opened/decant), `size_ml`, `price`, `stock`, optional `fill_pct` *(Plan 01-01)*
- [ ] **INV-03**: Component που resolve-άρει image: αν λείπει το τοπικό path πέφτει σε `image_fallback_url`
- [ ] **INV-04**: Validation κατά το build: όλα τα products έχουν τουλάχιστον 1 variant, όλα τα variant ids unique μέσα στο product
- [ ] **INV-05**: Sample inventory.json με ≥3 πραγματικά products για development/testing

### Catalog (Homepage)

- [x] **CAT-01**: Homepage `/` με hero banner ("Marios Shop" wordmark + tagline "Επιλεγμένα αρώματα από τη συλλογή μου")
- [x] **CAT-02**: Responsive product grid: 1 column mobile, 2 tablet, 3 small desktop, 4 large desktop
- [x] **CAT-03**: Product card εμφανίζει image, brand, name, lowest price από available variants, badges per variant type
- [ ] **CAT-04**: Φίλτρο τύπου variant: sealed / opened / decant (multi-select chips)
- [ ] **CAT-05**: Φίλτρο brand: dropdown ή multi-select με όλα τα brands του inventory
- [ ] **CAT-06**: Search by text: matches σε brand, name, notes (debounced)
- [ ] **CAT-07**: Sort: brand A→Z, price asc, price desc, recently added (default)
- [ ] **CAT-08**: Empty state όταν τα φίλτρα δεν επιστρέφουν αποτελέσματα ("Δεν βρέθηκαν αρώματα")
- [x] **CAT-09**: Sticky cart button bottom-right με badge counter (συνολικά τεμάχια) *(Plan 01-04)*

### Product Detail

- [x] **PROD-01**: Σελίδα `/product/[id]` (statically generated για κάθε product στο inventory) *(Plan 01-03)*
- [x] **PROD-02**: Μεγάλη φωτογραφία προϊόντος με image fallback support *(Plan 01-03)*
- [x] **PROD-03**: Brand, name, line, notes, description_gr εμφανίζονται καθαρά *(Plan 01-03)*
- [x] **PROD-04**: Λίστα variants, καθένα με size_ml, price, type badge, stock indicator, "Προσθήκη" κουμπί *(Plan 01-03)*
- [ ] **PROD-05**: Variant με `stock===0` εμφανίζεται greyed out με "Εξαντλήθηκε" αντί κουμπιού
- [ ] **PROD-06**: Stock indicator: αν `stock <= 2` δείχνει "Τελευταία τεμάχια"
- [ ] **PROD-07**: Για `opened` variants εμφανίζεται το `fill_pct` (π.χ. "Γέμιση: 85%")
- [x] **PROD-08**: Back link/button στο catalog *(Plan 01-03)*
- [ ] **PROD-09**: 404 page για άγνωστα product ids

### Cart

- [x] **CART-01**: Cart state managed με Zustand ή React Context, persist στο localStorage key `marios-shop-cart` *(Plan 01-01 + Plan 01-04 consumer wiring)*
- [x] **CART-02**: Cart item shape: `{ product_id, variant_id, quantity }` *(Plan 01-01 + Plan 01-04 consumer wiring)*
- [x] **CART-03**: Adding to cart αυξάνει quantity αν το variant υπάρχει ήδη, αλλιώς το προσθέτει *(Plan 01-01 + Plan 01-04 consumer wiring)*
- [ ] **CART-04**: Validation: ποτέ `quantity > variant.stock` (clamp στο stock με toast προειδοποίησης)
- [ ] **CART-05**: Cart ανοίγει ως drawer/sheet (όχι ξεχωριστή σελίδα) από οπουδήποτε στο site
- [ ] **CART-06**: Cart drawer εμφανίζει per item: brand, name, variant (type + size), τιμή/τεμάχιο, ποσότητα, sub-total
- [ ] **CART-07**: User μπορεί να αλλάξει ποσότητα μέσα στο drawer (+/- buttons, με stock clamp)
- [ ] **CART-08**: User μπορεί να αφαιρέσει item από drawer
- [x] **CART-09**: Drawer footer εμφανίζει σύνολο €, σύνολο τεμαχίων *(Plan 01-04 — sum-of-quantity reducer wired to the StickyCartButton badge; Plan 05 will reuse the same reducer in the drawer footer)*
- [ ] **CART-10**: Κουμπί "Καθαρισμός" αδειάζει το cart (με confirm)
- [x] **CART-11**: Cart hydrate-άρει από localStorage σε mount χωρίς hydration mismatch *(Plan 01-04 — CartHydration flips isHydrated; StickyCartButton badge hidden until isHydrated)*
- [ ] **CART-12**: Stock changes στο inventory.json: items με stock=0 παραμένουν στο cart αλλά flagged ως μη διαθέσιμα

### Copy to Messenger

- [ ] **COPY-01**: Μεγάλο primary κουμπί στο cart drawer: "📋 Αντιγραφή για Messenger"
- [ ] **COPY-02**: Παράγει formatted text σύμφωνα με το spec template (header, numbered items με bullet variants, total footer)
- [ ] **COPY-03**: Format ανά item: `{brand} — {name}` και `{Type localized} {size_ml}ml — {price}€ × {qty} = {subtotal}€`
- [ ] **COPY-04**: Type localization: sealed → "Sealed", opened → "Opened", decant → "Decant" (ή "Σφραγισμένο"/"Ανοιγμένο"/"Decant" — final wording in implementation)
- [ ] **COPY-05**: Footer εμφανίζει σύνολο € και σύνολο τεμαχίων
- [ ] **COPY-06**: Πραγματικό clipboard write με `navigator.clipboard.writeText()` και graceful fallback (textarea trick) για παλιότερα browsers
- [ ] **COPY-07**: Toast "Αντιγράφηκε!" μετά από επιτυχία· error toast αν αποτύχει
- [ ] **COPY-08**: Empty cart: το κουμπί είναι disabled

### UI / Visual System

- [ ] **UI-01**: Λευκό background, Inter ή Geist typography, minimal aesthetic
- [ ] **UI-02**: Variant type badges: sealed=πράσινο "Σφραγισμένο", opened=κίτρινο "Ανοιγμένο", decant=μπλε "Decant"
- [ ] **UI-03**: Mobile-first layout — όλες οι ροές δουλεύουν με ένα χέρι σε κινητό
- [ ] **UI-04**: Δεν χρησιμοποιούνται emoji στο UI εκτός από το ένα 📋 στο copy button (όπως spec)
- [ ] **UI-05**: Δεν χρησιμοποιούνται gradients ή flashy animations
- [x] **UI-06**: Όλα τα user-facing strings στα Ελληνικά
- [x] **UI-07**: Wordmark "Marios Shop" ως text-only logo
- [ ] **UI-08**: Loading και error states σε πιθανές failures (image load, clipboard)
- [ ] **UI-09**: Accessible focus styles, semantic HTML, ARIA where needed

### Analytics

- [ ] **ANL-01**: `@vercel/analytics` εγκατεστημένο και mounted στο root layout
- [ ] **ANL-02**: Custom event `product_viewed` με `product_id` όταν ανοίγει product page
- [ ] **ANL-03**: Custom event `added_to_cart` με `product_id`, `variant_id`, `price`
- [ ] **ANL-04**: Custom event `cart_copied` με `total_value`, `item_count`
- [ ] **ANL-05**: Καμία PII ή ευαίσθητη πληροφορία στα events

### Deploy

- [ ] **DEP-01**: Vercel project linked με auto-deploys από main branch
- [x] **DEP-02**: Build verification: `next build` παράγει `out/` με static files χωρίς server runtime *(Plan 01-01)*
- [ ] **DEP-03**: README με οδηγίες local dev, edit inventory, deploy

## v2 Requirements

(Θα προστεθούν αργότερα αν προκύψουν: π.χ. προβολή νέων κυκλοφοριών, "wish list", QR code του link, dark mode.)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payments / checkout | Συναλλαγή κλείνει manual μέσω Messenger — εκτός φιλοσοφίας |
| User accounts / login | Δεν υπάρχει concept χρήστη — anonymous browsing only |
| Backend / database | Static export only — όλο το state JSON + localStorage |
| Server-side rendering / API routes | `output: 'export'` requirement |
| Πολυγλωσσία (αγγλικά κλπ) | Στοχευμένο κοινό μιλάει Ελληνικά |
| Reviews / ratings | Προσωπικό στοκ — όχι marketplace |
| Admin UI για inventory edits | Inventory επεξεργάζεται απευθείας το JSON + redeploy |
| Image hosting / CDN integration | `/public/products/` ή external URL αρκούν |
| Image upload UI | Owner κάνει upload χειροκίνητα στο repo |
| Stock auto-decrement μετά από order | Δεν υπάρχει "order" — manual reconciliation από owner |
| Email/SMS notifications | Όλη η επικοινωνία γίνεται στο Messenger |
| Wishlist persistence cross-device | Δεν υπάρχει user account |
| Search analytics / filtering analytics | Vercel Analytics aggregate-only |
| Cookie consent banner | Vercel Analytics δεν χρησιμοποιεί cookies/PII |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete (Plan 01-01) |
| FOUND-02 | Phase 1 | Complete (Plan 01-01) |
| FOUND-03 | Phase 1 | Complete (Plan 01-01) |
| FOUND-04 | Phase 1 | Complete (Plan 01-01) |
| FOUND-05 | Phase 1 | Pending |
| INV-01 | Phase 1 | Complete (Plan 01-01) |
| INV-02 | Phase 1 | Complete (Plan 01-01) |
| INV-03 | Phase 2 | Pending |
| INV-04 | Phase 2 | Pending |
| INV-05 | Phase 1 | Pending |
| CAT-01 | Phase 1 | Complete |
| CAT-02 | Phase 1 | Complete |
| CAT-03 | Phase 1 | Complete |
| CAT-04 | Phase 2 | Pending |
| CAT-05 | Phase 2 | Pending |
| CAT-06 | Phase 2 | Pending |
| CAT-07 | Phase 2 | Pending |
| CAT-08 | Phase 2 | Pending |
| CAT-09 | Phase 1 | Complete (Plan 01-04) |
| PROD-01 | Phase 1 | Complete (Plan 01-03) |
| PROD-02 | Phase 1 | Complete (Plan 01-03) |
| PROD-03 | Phase 1 | Complete (Plan 01-03) |
| PROD-04 | Phase 1 | Complete (Plan 01-03) |
| PROD-05 | Phase 2 | Pending |
| PROD-06 | Phase 2 | Pending |
| PROD-07 | Phase 2 | Pending |
| PROD-08 | Phase 1 | Complete (Plan 01-03) |
| PROD-09 | Phase 2 | Pending |
| CART-01 | Phase 1 | Complete (Plan 01-04) |
| CART-02 | Phase 1 | Complete (Plan 01-04) |
| CART-03 | Phase 1 | Complete (Plan 01-04) |
| CART-04 | Phase 2 | Pending |
| CART-05 | Phase 1 | Pending |
| CART-06 | Phase 1 | Pending |
| CART-07 | Phase 2 | Pending |
| CART-08 | Phase 1 | Pending |
| CART-09 | Phase 1 | Complete (Plan 01-04) |
| CART-10 | Phase 2 | Pending |
| CART-11 | Phase 1 | Complete (Plan 01-04) |
| CART-12 | Phase 2 | Pending |
| COPY-01 | Phase 1 | Pending |
| COPY-02 | Phase 1 | Pending |
| COPY-03 | Phase 1 | Pending |
| COPY-04 | Phase 2 | Pending |
| COPY-05 | Phase 1 | Pending |
| COPY-06 | Phase 1 | Pending |
| COPY-07 | Phase 2 | Pending |
| COPY-08 | Phase 1 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 3 | Pending |
| UI-05 | Phase 3 | Pending |
| UI-06 | Phase 1 | Complete |
| UI-07 | Phase 1 | Complete |
| UI-08 | Phase 3 | Pending |
| UI-09 | Phase 3 | Pending |
| ANL-01 | Phase 4 | Pending |
| ANL-02 | Phase 4 | Pending |
| ANL-03 | Phase 4 | Pending |
| ANL-04 | Phase 4 | Pending |
| ANL-05 | Phase 4 | Pending |
| DEP-01 | Phase 1 | Pending |
| DEP-02 | Phase 1 | Complete (Plan 01-01) |
| DEP-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 65 total
- Mapped to phases: 65 (100%)
- Unmapped: 0

**By phase:**
- Phase 1 (Vertical MVP — Browse, Cart, Copy, Deploy): 35 requirements
- Phase 2 (Inventory Robustness & Discovery): 17 requirements
- Phase 3 (UI Polish, Accessibility & Visual System): 7 requirements
- Phase 4 (Analytics & Deploy Hardening): 6 requirements

---
*Requirements defined: 2026-05-10*
*Last updated: 2026-05-11 after Plan 01-04 completion: CAT-09 + CART-01..03 + CART-09 + CART-11 marked complete (18/65 v1 requirements total: FOUND-01..04, INV-01..02, DEP-02, PROD-01..04, PROD-08, UI-06, UI-07, CAT-01..03, CAT-09, CART-01..03, CART-09, CART-11).*
