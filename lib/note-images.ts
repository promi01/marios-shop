/**
 * Maps a Greek (or Latin) fragrance-note string to a real ingredient photo
 * hosted under /public/notes/<slug>.jpg.
 *
 * Photos are real, legally-reusable photographs of the actual ingredients
 * (sourced from free commercial-licensed libraries — NOT Fragrantica's
 * copyrighted files). Each note is matched to the closest ingredient by
 * accent-insensitive keyword substring, most-specific-first.
 *
 * Returns the public path (e.g. "/notes/rose.jpg") or null when no ingredient
 * matches — the UI then renders a tasteful neutral monogram tile.
 */

/** Strip Greek/Latin diacritics and lowercase, so "Τριαντάφυλλο" === "τριανταφυλλο". */
function normalize(s: string): string {
  return s
    .toLocaleLowerCase('el')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/**
 * Ordered MOST-SPECIFIC-FIRST. Notes overlap (e.g. "λευκό τριαντάφυλλο" must
 * hit rose before any generic floral), so the first keyword match wins. Generic
 * buckets (citrus / wood / spices / fruit / herbs) come LAST as catch-alls.
 */
const NOTE_MAP: Array<{ slug: string; keywords: string[] }> = [
  // ── Florals (specific) ──
  { slug: 'rose', keywords: ['τριανταφυλλ', 'ροδο', 'rose', 'rosa'] },
  { slug: 'jasmine', keywords: ['γιασεμ', 'jasmine', 'jasmin'] },
  { slug: 'tuberose', keywords: ['τουμπεροζ', 'tuberose'] },
  { slug: 'ylang', keywords: ['ylang', 'ιλαγκ', 'υλανγκ'] },
  { slug: 'lavender', keywords: ['λεβαντα', 'lavender'] },
  { slug: 'neroli', keywords: ['νεραντζ', 'πορτοκαλανθ', 'νεροληυ', 'neroli', 'orange blossom'] },
  // ── Citrus (specific) ──
  { slug: 'bergamot', keywords: ['περγαμοντο', 'μπεργκαμοτ', 'bergamot'] },
  { slug: 'lemon', keywords: ['λεμον', 'lemon'] },
  { slug: 'mandarin', keywords: ['μανταριν', 'mandarin', 'tangerine'] },
  { slug: 'lime', keywords: ['λαιμ', 'lime'] },
  // ── Fruits (specific) ──
  { slug: 'pineapple', keywords: ['ανανα', 'pineapple'] },
  { slug: 'blackcurrant', keywords: ['φραγκοσταφυλ', 'cassis', 'blackcurrant', 'black currant'] },
  { slug: 'apple', keywords: ['μηλο', 'apple'] },
  { slug: 'raspberry', keywords: ['βατομουρ', 'raspberry'] },
  { slug: 'coconut', keywords: ['καρυδα', 'coconut'] },
  { slug: 'pistachio', keywords: ['πισταχ', 'pistachio'] },
  { slug: 'almond', keywords: ['αμυγδαλ', 'almond'] },
  // ── Woods (specific) ──
  { slug: 'patchouli', keywords: ['πατσουλ', 'patchouli'] },
  { slug: 'birch', keywords: ['σημυδα', 'birch'] },
  { slug: 'oakmoss', keywords: ['βρυα', 'βρυο', 'oakmoss'] },
  { slug: 'cedar', keywords: ['κεδρ', 'cedar'] },
  { slug: 'sandalwood', keywords: ['σανδαλ', 'σανταλ', 'sandalwood'] },
  { slug: 'vetiver', keywords: ['βετιβερ', 'vetiver'] },
  { slug: 'cypress', keywords: ['κυπαρισσ', 'cypress'] },
  { slug: 'oud', keywords: ['oud', 'ουντ', 'αγαρ', 'oudh', 'agarwood'] },
  // ── Spices (specific) ──
  { slug: 'pepper', keywords: ['πιπερ', 'pepper'] },
  { slug: 'cardamom', keywords: ['καρδαμ', 'cardamom'] },
  { slug: 'coriander', keywords: ['κολιανδρ', 'coriander'] },
  { slug: 'saffron', keywords: ['σαφραν', 'saffron'] },
  // ── Resins / balsamic ──
  { slug: 'myrrh', keywords: ['σμυρν', 'μυρρα', 'myrrh'] },
  { slug: 'incense', keywords: ['λιβαν', 'θυμιαμ', 'στυρακ', 'μαστιχ', 'ρητιν', 'incense', 'frankincense', 'resin', 'styrax', 'olibanum'] },
  // ── Sweet / gourmand ──
  { slug: 'vanilla', keywords: ['βανιλ', 'vanilla'] },
  { slug: 'tonka', keywords: ['τονκα', 'tonka'] },
  { slug: 'cocoa', keywords: ['κακαο', 'σοκολατ', 'cocoa', 'chocolate'] },
  { slug: 'rum', keywords: ['ρουμ', 'rum'] },
  // ── Musk / amber ──
  { slug: 'musk', keywords: ['μοσχ', 'musk', 'musc'] },
  { slug: 'amber', keywords: ['ambergris', 'αμπρα', 'αμβρα', 'κεχριμπαρ', 'amber', 'αμπερ'] },
  // ── Leather / tobacco ──
  { slug: 'leather', keywords: ['δερμα', 'σουεντ', 'leather', 'suede'] },
  { slug: 'tobacco', keywords: ['καπν', 'ταμπακο', 'tobacco', 'tabac'] },
  // ── Herbs / aromatic ──
  { slug: 'sage', keywords: ['φασκομηλ', 'θυμαρ', 'αρωματικ', 'βοταν', 'μεντα', 'δυοσμ', 'δεντρολιβαν', 'βασιλικ', 'sage', 'thyme', 'mint', 'rosemary', 'basil', 'herb'] },
  // ── Generic buckets (LAST) ──
  { slug: 'citrus', keywords: ['εσπεριδοειδ', 'citrus'] },
  { slug: 'spices', keywords: ['μπαχαρ', 'κανελ', 'τζιντζερ', 'γαρυφαλλ', 'μοσχοκαρυδ', 'spice', 'cinnamon', 'ginger', 'clove'] },
  { slug: 'wood', keywords: ['ξυλ', 'wood', 'guaiac', 'γουαιακ'] },
  { slug: 'fruit', keywords: ['φρουτ', 'ξηρα φρουτ', 'ραβεντ', 'fruit', 'peach', 'plum', 'pear', 'berry'] },
];

export function noteImage(note: string): string | null {
  const n = normalize(note);
  for (const entry of NOTE_MAP) {
    if (entry.keywords.some((k) => n.includes(normalize(k)))) {
      return `/notes/${entry.slug}.jpg`;
    }
  }
  return null;
}

/** First visible character, uppercased — used for the neutral fallback tile. */
export function noteInitial(note: string): string {
  const t = note.trim();
  return t ? t[0].toLocaleUpperCase('el') : '·';
}
