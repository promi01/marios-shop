/**
 * Canonical "main accords" — the fragrance families shown as colored intensity
 * bars (Fragrantica-style). The AI autofill returns a subset of these by their
 * Greek label with a 0-100 intensity; the UI resolves each label to its fixed
 * color here, so colors are stable and meaningful (woody is always brown,
 * citrus always yellow, etc.).
 */

export interface Accord {
  name: string;
  intensity: number;
}

interface AccordDef {
  label: string;
  color: string;
}

/** Fixed label → color. Labels are the exact strings the AI must use. */
export const ACCORD_DEFS: AccordDef[] = [
  { label: 'Φρουτώδες', color: '#E8736A' },
  { label: 'Γλυκό', color: '#F2A3C0' },
  { label: 'Ξυλώδες', color: '#9A6A3A' },
  { label: 'Δερμάτινο', color: '#A88A7D' },
  { label: 'Εσπεριδοειδή', color: '#E4DE57' },
  { label: 'Καπνιστό', color: '#9089A0' },
  { label: 'Μόσχος', color: '#E2D6E2' },
  { label: 'Φρέσκο', color: '#AEDCE4' },
  { label: 'Τροπικό', color: '#F2C25A' },
  { label: 'Βρυώδες', color: '#A6A66A' },
  { label: 'Αρωματικό', color: '#B7C77B' },
  { label: 'Ζεστό μπαχαρικό', color: '#C25B3A' },
  { label: 'Δροσερό μπαχαρικό', color: '#9FC1A0' },
  { label: 'Πουδρένιο', color: '#E6D2DC' },
  { label: 'Άμπερ', color: '#D99A4E' },
  { label: 'Βανίλια', color: '#E6D3A0' },
  { label: 'Ανθικό', color: '#F0B6C8' },
  { label: 'Λευκά άνθη', color: '#E2D6C4' },
  { label: 'Τριαντάφυλλο', color: '#E58F9E' },
  { label: 'Πράσινο', color: '#7FB069' },
  { label: 'Υδάτινο', color: '#6FB7D4' },
  { label: 'Βαλσαμικό', color: '#B07A3E' },
  { label: 'Ζωώδες', color: '#8A5A3C' },
  { label: 'Καπνός', color: '#8F6B2E' },
  { label: 'Gourmand', color: '#C68A5E' },
  { label: 'Γήινο', color: '#7A6A4F' },
];

/** Comma-separated list of allowed labels, embedded in the AI prompt. */
export const ACCORD_LABELS = ACCORD_DEFS.map((a) => a.label).join(', ');

function normalize(s: string): string {
  return s
    .toLocaleLowerCase('el')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

const BY_NORM = new Map(ACCORD_DEFS.map((a) => [normalize(a.label), a]));

const NEUTRAL = '#B4B2A9';

/** Resolve an accord name (AI-returned) to its fixed color; neutral fallback. */
export function accordColor(name: string): string {
  return BY_NORM.get(normalize(name))?.color ?? NEUTRAL;
}

/**
 * True when the fill color is light enough that the centered label should be
 * dark text instead of white. Uses perceived luminance.
 */
export function accordNeedsDarkText(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 150;
}

/**
 * Sort descending by intensity, drop very weak accords, cap the list, and
 * compute each bar's width RELATIVE to the strongest (strongest = 100%),
 * exactly like Fragrantica.
 */
export function prepareAccords(
  accords: Accord[],
  { min = 12, max = 10 }: { min?: number; max?: number } = {},
): Array<Accord & { color: string; widthPct: number; darkText: boolean }> {
  const filtered = accords
    .filter((a) => a && typeof a.intensity === 'number' && a.intensity >= min && a.name)
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, max);
  if (filtered.length === 0) return [];
  const top = filtered[0].intensity || 1;
  return filtered.map((a) => {
    const color = accordColor(a.name);
    return {
      ...a,
      color,
      widthPct: Math.max(30, Math.round((a.intensity / top) * 100)),
      darkText: accordNeedsDarkText(color),
    };
  });
}
