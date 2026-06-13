/**
 * Maps a Greek (or Latin) fragrance-note string to a real ingredient photo
 * hosted under /public/notes/<slug>.jpg.
 *
 * Photos are real, legally-reusable photographs of the actual ingredients
 * (sourced from free commercial-licensed libraries — NOT Fragrantica's
 * copyrighted files). Each note is matched to the closest ingredient by
 * accent-insensitive keyword substring, Fragrantica-style.
 *
 * Returns the public path (e.g. "/notes/rose.jpg") or null when no ingredient
 * photo matches — the UI then renders a tasteful neutral monogram tile.
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
 * Ordered most-specific-first: a note may contain overlapping keywords
 * (e.g. "λευκό τριαντάφυλλο" must hit rose before any generic floral entry),
 * so the first match wins.
 */
const NOTE_MAP: Array<{ slug: string; keywords: string[] }> = [
  { slug: 'rose', keywords: ['τριανταφυλλ', 'ροδο', 'rose', 'rosa'] },
  { slug: 'jasmine', keywords: ['γιασεμ', 'jasmine', 'jasmin'] },
  { slug: 'bergamot', keywords: ['περγαμοντο', 'μπεργκαμοτ', 'bergamot'] },
  { slug: 'pineapple', keywords: ['ανανα', 'pineapple'] },
  { slug: 'blackcurrant', keywords: ['φραγκοσταφυλ', 'cassis', 'blackcurrant', 'black currant'] },
  { slug: 'apple', keywords: ['μηλο', 'apple'] },
  { slug: 'patchouli', keywords: ['πατσουλ', 'patchouli'] },
  { slug: 'birch', keywords: ['σημυδα', 'birch'] },
  { slug: 'oakmoss', keywords: ['βρυα', 'βρυο', 'oakmoss', 'βελανιδ μοσ'] },
  { slug: 'vanilla', keywords: ['βανιλ', 'vanilla'] },
  { slug: 'amber', keywords: ['ambergris', 'αμπρα', 'κεχριμπαρ', 'amber', 'αμπερ'] },
  { slug: 'musk', keywords: ['μοσχ', 'musk', 'musc'] },
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
