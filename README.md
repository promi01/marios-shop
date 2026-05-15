# Marios Shop

Στατικό-στην-εμφάνιση e-shop για το προσωπικό στοκ αρωμάτων του Μάριου.
Στόχος: ένας επισκέπτης από Facebook (κυρίως κινητό) μπορεί σε <30 δευτερόλεπτα να βρει αρώματα, να φτιάξει λίστα παραγγελίας, και να την αντιγράψει για Messenger — χωρίς εγγραφή, χωρίς πληρωμή.

**Νέο (Phase 5):** Admin UI στο `/admin` — προσθήκη / επεξεργασία / διαγραφή προϊόντων με upload φωτογραφιών από κινητό. Δεν χρειάζεται να αγγίξεις κώδικα ή JSON.

## Στοίβα

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (cart state, persist σε localStorage)
- Sonner (toasts)
- Vercel Analytics + Vercel Blob (storage)
- sharp (server-side HEIC→JPG)
- jose (signed admin session cookie)

Dynamic rendering με Edge ISR (60s revalidation) — πρακτικά ίδια ταχύτητα με static.

## Φάκελοι

```
app/                            Next.js App Router
  page.tsx                      Public homepage (catalog)
  product/[id]/page.tsx         Public product detail
  admin/                        Admin UI (auth-gated)
    layout.tsx                  Header με logout / σύνδεσμο νέου προϊόντος
    page.tsx                    Λίστα προϊόντων (edit/delete)
    products/new/page.tsx       Φόρμα νέου προϊόντος
    products/[id]/page.tsx      Φόρμα επεξεργασίας
    login/page.tsx              Login (single password)
    actions.ts                  Server Actions (CRUD + auth)
    upload-action.ts            Image upload action (HEIC → JPG → Blob)
components/                     UI components
  admin/                        Admin-specific (login form, image uploader, etc.)
lib/                            Domain logic
  inventory-server.ts           SERVER: fetch inventory from Blob
  inventory-store.ts            SERVER: write inventory to Blob + revalidate
  inventory-runtime.ts          CLIENT: in-memory snapshot for cart store
  inventory.ts                  Re-exports for client modules
  auth.ts                       Session cookie helpers
middleware.ts                   Gates /admin/** + /api/admin/**
data/inventory.json             Bootstrap inventory (used when Blob empty)
public/products/                Πρώτες 35 φωτογραφίες σε git (Phase 1.5)
                                Νέες φωτο πάνε στο Vercel Blob.
```

## Πώς δουλεύει η αποθήκευση

Δύο πηγές δεδομένων:

1. **Vercel Blob** (production): ένα αρχείο `inventory.json` με όλα τα προϊόντα + ξεχωριστά blobs για κάθε φωτογραφία. Όταν πατάς "Αποθήκευση" στο admin → ξαναγράφεται το JSON blob → η public σελίδα κάνει revalidate.
2. **`data/inventory.json` σε git** (bootstrap): χρησιμοποιείται μόνο αν δεν υπάρχει Blob (πρώτο deploy ή local dev χωρίς Blob token). Από τη στιγμή που θα ανεβάσεις/επεξεργαστείς ένα προϊόν από το admin, το Blob γίνεται η αυθεντία.

Σημαίνει: **δεν χρειάζεται git push για αλλαγές inventory**. Αλλάζεις από το admin → live σε ~60 δευτερόλεπτα.

## Πρώτη φορά setup

### 1. Local dev

```powershell
cp .env.local.example .env.local       # ή αντίγραψε το αρχείο χειροκίνητα
# άνοιξε το .env.local και βάλε δικό σου password + jwt secret
npm install
npm run dev
```

`.env.local` χρειάζεται:
- `ADMIN_PASSWORD` — ο κωδικός που θα γράφεις στο `/admin/login`
- `ADMIN_JWT_SECRET` — τυχαίο 16+ char string για υπογραφή του cookie (δεν τον θυμάσαι ποτέ)
- `BLOB_READ_WRITE_TOKEN` — προαιρετικό για local dev (αν λείπει, το admin θα διαβάζει από local file αλλά **δεν θα μπορεί να σώσει**)

### 2. Deploy στο Vercel

#### Πρώτη φορά

1. Φτιάξε empty repo στο GitHub (π.χ. `marios-shop`)
2. Push τοπικό repo:
   ```powershell
   git remote add origin https://github.com/<USERNAME>/marios-shop.git
   git branch -M main
   git push -u origin main
   ```
3. Πήγαινε [vercel.com/new](https://vercel.com/new) → Login με GitHub → Import το repo
4. **Πριν πατήσεις Deploy:** στο "Environment Variables" section, πρόσθεσε:
   - `ADMIN_PASSWORD` = ο δικός σου κωδικός για το admin
   - `ADMIN_JWT_SECRET` = τρέξε `openssl rand -base64 32` (ή κάνε copy μια τυχαία ακολουθία γραμμάτων/αριθμών 32+ χαρακτήρων)
5. Πάτα **Deploy**
6. Μετά το πρώτο deploy: Vercel dashboard → Project → **Storage** → **Create Database** → **Blob** → Connect → done. Αυτό setupάρει αυτόματα το `BLOB_READ_WRITE_TOKEN`.
7. Trigger νέο deploy (Vercel → Deployments → ⋯ → Redeploy) ώστε το Blob token να ενεργοποιηθεί.
8. Σε ~1 λεπτό παίρνεις URL τύπου `marios-shop-xxx.vercel.app`

#### Κάθε επόμενη φορά

- **Αλλαγή κώδικα/UI** → `git push` → Vercel auto-deploys ~30s
- **Αλλαγή προϊόντων/στοκ/φωτο** → δεν χρειάζεται git, απλώς ανοίγεις `<URL>/admin` και κάνεις τις αλλαγές

## Χρήση του Admin UI

### Login

Άνοιξε `<URL>/admin` (π.χ. `marios-shop.vercel.app/admin`).
Σε redirect-άρει στο `/admin/login`. Βάλε τον κωδικό που όρισες στο `ADMIN_PASSWORD`.

Παραμένεις logged in για 30 ημέρες (cookie). Μπορείς να κάνεις logout από το κουμπί πάνω δεξιά.

### Προσθήκη νέου αρώματος

1. Πάτα **"Προσθήκη νέου αρώματος"** στο dashboard ή **"+ Νέο"** στο header
2. Συμπλήρωσε:
   - **Brand** (π.χ. `Tom Ford`)
   - **Όνομα** (π.χ. `Tobacco Vanille`)
   - **Σειρά / collection** (προαιρετικό, π.χ. `Private Blend`)
   - **Νότες** (προαιρετικό, π.χ. `καπνός, βανίλια, μπαχαρικά`)
   - **Περιγραφή** (προαιρετικό, 1-2 προτάσεις)
3. **Φωτογραφίες:**
   - Πάτα το κουμπί με την κάμερα → ανοίγει επιλογέας
   - Σε κινητό: ανοίγει κατευθείαν η κάμερα (μπορείς να τραβήξεις live)
   - HEIC από iPhone υποστηρίζεται (μετατρέπεται αυτόματα σε JPG στον server)
   - Μπορείς να επιλέξεις πολλές μαζί
   - **Η πρώτη φωτο είναι cover** (αυτή που φαίνεται στο grid). Δες το "Cover" tag.
   - Άλλαξε σειρά με τα βελάκια πάνω/κάτω, διέγραψε με το X
4. **Variants** (μεγέθη / τιμές / stock):
   - Πάτα **"+ Νέο variant"** για κάθε επιπλέον μέγεθος
   - Type: Σφραγισμένο / Ανοιγμένο / Decant
   - Μέγεθος σε ml, Τιμή σε €, Stock σε τεμάχια
   - Για Ανοιγμένο εμφανίζεται και πεδίο "Γέμιση (%)"
5. Πάτα **Αποθήκευση** → επιστρέφει στο dashboard.

### Επεξεργασία υπάρχοντος

Στο dashboard, πάτα **Επεξεργασία** δίπλα στο προϊόν → ίδια φόρμα prefilled. Αλλάζεις ό,τι θες, πατάς Αποθήκευση.

### Διαγραφή προϊόντος

Στο dashboard, πάτα **Διαγραφή** → εμφανίζεται confirm → πάτα ξανά Διαγραφή.
Το προϊόν εξαφανίζεται από το catalog άμεσα και οι φωτογραφίες του διαγράφονται από το Blob (μόνο όσες ανέβασες από το admin — οι αρχικές που είναι σε git μένουν στο public/products/ ως ιστορικό).

### Διαφορά: stock=0 vs Διαγραφή

| Ενέργεια | Πότε | Αποτέλεσμα |
|---|---|---|
| `stock=0` σε variant | Το συγκεκριμένο μέγεθος εξαντλήθηκε προσωρινά | Variant μένει στη σελίδα, δείχνει "Εξαντλήθηκε" αντί για κουμπί |
| Όλα τα variants `stock=0` | Προσωρινά εξαντλημένο | Card στο grid με opacity 50% + badge "Εξαντλήθηκε" |
| **Διαγραφή προϊόντος** | Καταργήθηκε εντελώς, ποτέ ξανά | Εξαφανίζεται από το catalog, διαγράφονται οι φωτο |

## Custom Analytics Events (Phase 4)

Καταγράφονται aggregate-only (no PII) στο Vercel Analytics:

| Event | Trigger | Payload |
|---|---|---|
| `product_viewed` | Άνοιγμα `/product/[id]` | `product_id` |
| `added_to_cart` | Επιτυχής προσθήκη στο cart | `product_id`, `variant_id`, `price` |
| `cart_copied` | Επιτυχής αντιγραφή για Messenger | `total_value`, `item_count` |

## Scripts

```powershell
npm run dev                 # Local dev + auto-reload + inventory validation
npm run build               # Production build
npm run validate:inventory  # Έλεγχος συντακτικού του bootstrap data/inventory.json
npm test                    # Unit tests (clipboard, copy-format)
npm run lint                # ESLint
```

## Troubleshooting

- **`/admin/login` λέει "ADMIN_PASSWORD is not set"** → Δεν έχεις βάλει τις env vars. Στο Vercel: Project → Settings → Environment Variables. Τοπικά: `.env.local`.
- **"Δεν έχει ρυθμιστεί το Vercel Blob" όταν προσπαθώ να σώσω** → Δεν έχεις προσθέσει Blob storage. Project → Storage → Create Database → Blob → Connect.
- **Φωτογραφία δεν ανεβαίνει** → πιθανώς πολύ μεγάλο αρχείο (>25MB). Σπάνιο για κινητό. Δοκίμασε ξανά ή κράτα μικρότερη φωτο.
- **Άλλαξα προϊόν αλλά το βλέπω παλιό στο live site** → Το catalog κάνει cache 60 sec. Είτε περίμενε λίγο, είτε ανανέωσε το `/admin` (revalidate-άρει αυτόματα τις public σελίδες).
- **Ξέχασα τον κωδικό admin** → Άλλαξε το `ADMIN_PASSWORD` στο Vercel → trigger νέο deploy. Όποια active sessions θα συνεχίσουν να δουλεύουν (το JWT secret δεν άλλαξε) μέχρι να κάνεις logout/expire.
