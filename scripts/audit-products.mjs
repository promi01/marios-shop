#!/usr/bin/env node
/**
 * Per-product completeness audit (manual QA aid — not part of the build).
 *
 * Simulates exactly what each product page will render by applying the same
 * enrichment merge the server uses, then checks, for every product:
 *   1. notes summary present
 *   2. olfactory pyramid present (≥1 layer) and EVERY note resolves to a real
 *      photo file that actually exists on disk (no broken <img>)
 *   3. main accords present and EVERY accord label resolves to a fixed color
 *   4. Greek description present
 *
 * Prints a per-product table and exits non-zero if anything is incomplete.
 *
 *   node scripts/audit-products.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');

const inventory = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'inventory.json'), 'utf8'),
);
const enrichment = JSON.parse(
  fs.readFileSync(path.join(root, 'data', 'note-enrichment.json'), 'utf8'),
);

const norm = (s) =>
  s.toLocaleLowerCase('el').normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

// ── Replicate lib/note-images.ts NOTE_MAP matching ──
const noteImgSrc = fs.readFileSync(path.join(root, 'lib', 'note-images.ts'), 'utf8');
const mapBody = noteImgSrc.slice(
  noteImgSrc.indexOf('NOTE_MAP'),
  noteImgSrc.indexOf('];', noteImgSrc.indexOf('NOTE_MAP')),
);
const NOTE_MAP = [];
{
  const re = /\{\s*slug:\s*'([^']+)',\s*keywords:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(mapBody))) {
    NOTE_MAP.push({
      slug: m[1],
      kws: [...m[2].matchAll(/'([^']*)'/g)].map((x) => x[1]),
    });
  }
}
function noteImage(note) {
  const n = norm(note);
  for (const e of NOTE_MAP) if (e.kws.some((k) => n.includes(norm(k)))) return `/notes/${e.slug}.jpg`;
  return null;
}

// ── Replicate lib/accords.ts canonical labels ──
const accSrc = fs.readFileSync(path.join(root, 'lib', 'accords.ts'), 'utf8');
const ACCORD_LABELS = new Set(
  [...accSrc.matchAll(/label:\s*'([^']+)'/g)].map((m) => m[1]),
);

// ── Replicate the server enrich() merge ──
const isEmpty = (v) => !v || String(v).trim() === '';
function enrich(p) {
  const seed = enrichment[p.id];
  if (!seed) return p;
  const m = { ...p };
  for (const f of ['notes', 'top_notes', 'heart_notes', 'base_notes', 'description_gr'])
    if (isEmpty(m[f]) && seed[f]) m[f] = seed[f];
  if ((!m.accords || m.accords.length === 0) && seed.accords?.length) m.accords = seed.accords;
  return m;
}

const parse = (s) => (s ?? '').split(',').map((x) => x.trim()).filter(Boolean);

let failures = 0;
const rows = [];

for (const raw of inventory) {
  const p = enrich(raw);
  const notesOk = !isEmpty(p.notes);
  const descOk = !isEmpty(p.description_gr);

  const pyramidNotes = [...parse(p.top_notes), ...parse(p.heart_notes), ...parse(p.base_notes)];
  const pyramidOk = pyramidNotes.length > 0;
  const brokenPhotos = [];
  let monograms = 0;
  for (const note of pyramidNotes) {
    const src = noteImage(note);
    if (!src) {
      monograms += 1; // legitimate neutral fallback (no broken image)
      continue;
    }
    const file = path.join(root, 'public', src);
    if (!fs.existsSync(file)) brokenPhotos.push(note + ' → ' + src);
  }

  const accords = p.accords ?? [];
  const accordsOk = accords.length > 0;
  const colorlessAccords = accords.filter((a) => !ACCORD_LABELS.has(a.name)).map((a) => a.name);

  const problems = [];
  if (!notesOk) problems.push('no notes');
  if (!pyramidOk) problems.push('no pyramid');
  if (brokenPhotos.length) problems.push('BROKEN PHOTO: ' + brokenPhotos.join('; '));
  if (!accordsOk) problems.push('no accords');
  if (colorlessAccords.length) problems.push('colorless accord: ' + colorlessAccords.join(','));
  if (!descOk) problems.push('no description');

  if (problems.length) failures += 1;
  rows.push({
    id: p.id,
    name: `${raw.brand} ${raw.name}`,
    notes: notesOk ? '✓' : '✗',
    pyramid: pyramidOk ? `✓ ${pyramidNotes.length}n${monograms ? ` (${monograms} mono)` : ''}` : '✗',
    accords: accordsOk ? `✓ ${accords.length}` : '✗',
    desc: descOk ? '✓' : '✗',
    status: problems.length ? '✗ ' + problems.join(' | ') : 'OK',
  });
}

const pad = (s, n) => String(s).padEnd(n);
console.log(
  pad('PRODUCT', 34) + pad('NOTES', 7) + pad('PYRAMID', 16) + pad('ACCORDS', 10) + pad('DESC', 6) + 'STATUS',
);
console.log('-'.repeat(100));
for (const r of rows) {
  console.log(
    pad(r.name.slice(0, 33), 34) + pad(r.notes, 7) + pad(r.pyramid, 16) + pad(r.accords, 10) + pad(r.desc, 6) + r.status,
  );
}
console.log('-'.repeat(100));
console.log(`${rows.length} products • ${rows.length - failures} complete • ${failures} with issues`);
process.exit(failures ? 1 : 0);
