import { describe, it, expect } from 'vitest';
import { formatOrderText, type ResolvedItem } from '@/lib/copy-format';

describe('formatOrderText', () => {
  it('matches the UI-SPEC two-item example exactly', () => {
    const items: ResolvedItem[] = [
      {
        brand: 'Tom Ford',
        name: 'Tobacco Vanille',
        typeLabel: 'Σφραγισμένο',
        size_ml: 50,
        price: 180,
        quantity: 1,
      },
      {
        brand: 'Loewe',
        name: 'Bittersweet Oud',
        typeLabel: 'Decant',
        size_ml: 5,
        price: 18,
        quantity: 2,
      },
    ];
    const expected = [
      'Παραγγελία — Marios Shop',
      '',
      '1. Tom Ford — Tobacco Vanille',
      '   Σφραγισμένο 50ml — 180€ × 1 = 180€',
      '',
      '2. Loewe — Bittersweet Oud',
      '   Decant 5ml — 18€ × 2 = 36€',
      '',
      'Σύνολο: 216€ — 3 τεμάχια',
    ].join('\n');
    expect(formatOrderText(items)).toBe(expected);
  });

  it('uses singular τεμάχιο when total quantity is 1', () => {
    const items: ResolvedItem[] = [
      {
        brand: 'Creed',
        name: 'Aventus',
        typeLabel: 'Σφραγισμένο',
        size_ml: 100,
        price: 300,
        quantity: 1,
      },
    ];
    const out = formatOrderText(items);
    expect(out).toContain('Σύνολο: 300€ — 1 τεμάχιο');
    expect(out).not.toContain('1 τεμάχια');
  });

  it('renders decimal prices with two-decimal suffix', () => {
    const items: ResolvedItem[] = [
      {
        brand: 'X',
        name: 'Y',
        typeLabel: 'Decant',
        size_ml: 10,
        price: 17.5,
        quantity: 2,
      },
    ];
    const out = formatOrderText(items);
    expect(out).toContain('17.50€ × 2 = 35€');
    expect(out).toContain('Σύνολο: 35€ — 2 τεμάχια');
  });

  it('never includes fill_pct ("Γέμιση") even for opened type items', () => {
    const items: ResolvedItem[] = [
      {
        brand: 'MFK',
        name: 'BR540',
        typeLabel: 'Ανοιγμένο',
        size_ml: 70,
        price: 200,
        quantity: 1,
      },
    ];
    const out = formatOrderText(items);
    expect(out).not.toContain('Γέμιση');
    expect(out).toContain('Ανοιγμένο 70ml — 200€ × 1 = 200€');
  });

  it('returns "" for an empty list', () => {
    expect(formatOrderText([])).toBe('');
  });
});
