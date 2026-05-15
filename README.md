# Marios Shop

Στατικό e-shop-style site για το προσωπικό στοκ αρωμάτων του Μάριου.
Στόχος: ένας επισκέπτης από Facebook (κυρίως κινητό) μπορεί σε <30 δευτερόλεπτα να βρει αρώματα, να φτιάξει λίστα παραγγελίας, και να την αντιγράψει για Messenger — χωρίς εγγραφή, χωρίς πληρωμή, χωρίς backend.

## Στοίβα

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (cart state, persist σε localStorage)
- Sonner (toast notifications)
- Vercel Analytics (aggregate visitor + custom events)
- Static export (`output: 'export'`) — zero backend, hosted στο Vercel free tier

## Φάκελοι

```
app/                  Next.js App Router (layout, /, /product/[id], 404)
components/           UI components (catalog, cart, product detail, gallery)
components/ui/        shadcn primitives (button, sheet, sonner, badge, card)
lib/                  domain logic (types, inventory, cart-store, catalog-utils, format, analytics)
data/inventory.json   ⭐ ΕΔΩ ΕΠΕΞΕΡΓΑΖΕΣΑΙ ΤΟ ΣΤΟΚ
public/products/      product photos (jpg)
scripts/              build-time inventory validation
```

## Τοπική εκτέλεση

```powershell
npm install
npm run dev
```

Άνοιξε `http://localhost:3000`. Hot reload ενεργό για κάθε αρχείο, συμπεριλαμβανομένου του `data/inventory.json`.

Στο κινητό από το ίδιο WiFi: `http://<ip-του-PC>:3000` (η ΙΡ φαίνεται όταν τρέξεις `npm run dev`).

## Επεξεργασία inventory

Όλο το στοκ ζει σε ένα αρχείο: `data/inventory.json`.

### Schema

```jsonc
{
  "id": "tom-ford-tobacco-vanille",   // slug — δεν αλλάζει ποτέ (URL το χρησιμοποιεί)
  "brand": "Tom Ford",
  "name": "Tobacco Vanille",
  "line": "Private Blend",            // optional — collection/edition name
  "images": [                         // 1-5 paths από /public/products/
    "/products/tom-ford-tobacco-vanille-1.jpg"
  ],
  "notes": "καπνός, βανίλια, μπαχαρικά",
  "description_gr": "Σύντομη περιγραφή στα Ελληνικά (1-2 προτάσεις).",
  "variants": [
    {
      "id": "sealed-50",
      "type": "sealed",               // sealed | opened | decant
      "size_ml": 50,
      "price": 220,                   // ακέραιος ή δεκαδικός — η UI εμφανίζει "220€"
      "stock": 1
    },
    {
      "id": "opened-50",
      "type": "opened",
      "size_ml": 50,
      "price": 160,
      "stock": 1,
      "fill_pct": 85                  // ΜΟΝΟ για opened — εμφανίζεται ως "Γέμιση: 85%"
    },
    {
      "id": "decant-10",
      "type": "decant",
      "size_ml": 10,
      "price": 28,
      "stock": 12
    }
  ]
}
```

### Validation

Κάθε `npm run dev` και `npm run build` τρέχει αυτόματα το `scripts/validate-inventory.mjs`.
Αποτυγχάνει αν:
- Λείπει product id ή variant id
- Διπλό product id (παγκοσμίως) ή variant id (μέσα σε ένα product)
- Variant με `type` εκτός `sealed`/`opened`/`decant`
- Negative `price`/`stock`, μη ακέραιο `stock`
- `fill_pct` σε `sealed`/`decant`, ή `fill_pct` εκτός 1..100
- Image path που δεν αρχίζει με `/`

Warnings (μη blocking):
- Image path που δεν υπάρχει στο `public/`

Τρέξε χειροκίνητα: `npm run validate:inventory`

### Workflow αλλαγής στοκ

1. Άνοιξε `data/inventory.json` σε editor (VSCode, Notepad++, κλπ)
2. Επεξεργάσου `stock`, `price`, `notes`, `description_gr`, ή πρόσθεσε νέα variants
3. Αποθήκευσε — αν τρέχει `npm run dev`, ο dev server κάνει auto-reload
4. **Όταν είσαι έτοιμος να ανεβάσεις** το νέο στοκ στο live site:
   ```powershell
   git add data/inventory.json
   git commit -m "inventory: stock update"
   git push
   ```
   Το Vercel θα κάνει auto-deploy μέσα σε ~30s.

### Προσθήκη νέου αρώματος

1. Πάρε 1-5 φωτογραφίες με κινητό
2. Μεταφόρτωσέ τες στο PC (Drive, email, USB, AirDrop)
3. Convert αν είναι HEIC (το browser δεν τα διαβάζει) — π.χ. online tool ή το script `scripts/`
4. Βάλε τα `.jpg` στο `public/products/`, με όνομα `<slug>-1.jpg`, `<slug>-2.jpg`, κλπ
5. Πρόσθεσε νέο αντικείμενο στο `data/inventory.json`
6. Validate: `npm run validate:inventory`
7. Commit + push

## Deploy στο Vercel

### Πρώτη φορά (μία φορά)

1. Φτιάξε empty repo στο GitHub (π.χ. `marios-shop`)
2. Push τοπικό repo:
   ```powershell
   git remote add origin https://github.com/<username>/marios-shop.git
   git branch -M main
   git push -u origin main
   ```
3. Πήγαινε [vercel.com/new](https://vercel.com/new), κάνε login με GitHub
4. Import το `marios-shop` repo
5. Vercel ανιχνεύει αυτόματα Next.js — κράτα τις defaults
6. Πάτα **Deploy**
7. Σε ~1 λεπτό παίρνεις production URL τύπου `marios-shop-xxx.vercel.app`
8. Μπορείς να αλλάξεις σε custom domain από το Vercel dashboard

### Κάθε επόμενη φορά

Απλώς `git push` — το Vercel κάνει auto-deploy.

Preview deploys φτιάχνονται αυτόματα για κάθε branch εκτός main, αν θες να δοκιμάσεις κάτι πριν το live.

## Custom Analytics Events

Stο production καταγράφονται 3 events (όλα aggregate — ΟΧΙ PII):

| Event | Trigger | Payload |
|---|---|---|
| `product_viewed` | Άνοιγμα `/product/[id]` | `product_id` |
| `added_to_cart` | Επιτυχής προσθήκη στο cart | `product_id`, `variant_id`, `price` |
| `cart_copied` | Επιτυχής αντιγραφή για Messenger | `total_value`, `item_count` |

Visible στο Vercel dashboard → Analytics → Events.

## Scripts

```powershell
npm run dev                 # Local dev server + auto-reload + inventory validation
npm run build               # Production build → out/ (static files)
npm run validate:inventory  # Run inventory validation only
npm test                    # Run vitest unit tests (clipboard, copy-format)
npm run lint                # ESLint
```

## Troubleshooting

- **"port 3000 in use"** — `taskkill /F /IM node.exe` ή ξεκίνα σε άλλο port: `npm run dev -- -p 3001`
- **Build fails στο validate-inventory** — δες το error message, διόρθωσε το JSON, ξανατρέξε
- **Cart δεν επιβιώνει refresh** — έλεγξε ότι ο browser σου δεν είναι σε private/incognito (block-άρει το localStorage)
- **Φωτογραφίες δεν φαίνονται** — βεβαιώσου ότι το path στο JSON ταιριάζει ακριβώς με το όνομα αρχείου στο `public/products/` (case-sensitive σε Linux/Vercel)
