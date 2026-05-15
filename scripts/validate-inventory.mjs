#!/usr/bin/env node
/**
 * Build-time validation of data/inventory.json (INV-04).
 *
 * Runs as part of `npm run build` and `npm run dev` (via `predev`/`prebuild`
 * hooks in package.json). Exits with non-zero status on any structural error
 * so the build fails fast before producing broken pages.
 *
 * Checks:
 *  1. inventory.json parses as valid JSON and is a top-level array
 *  2. Each product has unique id across the whole file
 *  3. Each product has at least 1 variant
 *  4. Variant ids are unique within a product
 *  5. Required fields present: brand, name, images[], variants[]
 *  6. Variant required fields: id, type ∈ {sealed,opened,decant}, size_ml > 0,
 *     price >= 0, stock >= 0
 *  7. `fill_pct` only allowed on opened variants and must be 1..100
 *  8. All images[] entries are non-empty strings starting with '/'
 *
 * Warnings (non-fatal, printed but build proceeds):
 *  - Local image path references a file that does not exist in public/
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const INVENTORY = path.join(root, 'data', 'inventory.json');
const PUBLIC_DIR = path.join(root, 'public');

const VALID_TYPES = new Set(['sealed', 'opened', 'decant']);

const errors = [];
const warnings = [];

function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

let raw;
try {
  raw = fs.readFileSync(INVENTORY, 'utf8');
} catch (e) {
  console.error(`✗ Cannot read ${INVENTORY}: ${e.message}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error(`✗ inventory.json is not valid JSON: ${e.message}`);
  process.exit(1);
}

if (!Array.isArray(data)) {
  console.error('✗ inventory.json must be a top-level array');
  process.exit(1);
}

const seenProductIds = new Set();

data.forEach((product, idx) => {
  const where = `products[${idx}]`;

  if (!product || typeof product !== 'object') {
    err(`${where} is not an object`);
    return;
  }

  // Required scalar fields
  if (typeof product.id !== 'string' || !product.id) err(`${where}.id missing`);
  if (typeof product.brand !== 'string' || !product.brand) err(`${where}.brand missing`);
  if (typeof product.name !== 'string' || !product.name) err(`${where}.name missing`);

  if (product.id) {
    if (seenProductIds.has(product.id)) {
      err(`Duplicate product id: ${product.id}`);
    }
    seenProductIds.add(product.id);
  }

  // Images
  if (!Array.isArray(product.images)) {
    err(`${where}.images must be an array`);
  } else {
    product.images.forEach((img, i) => {
      if (typeof img !== 'string' || !img.startsWith('/')) {
        err(`${where}.images[${i}] must be a non-empty path starting with /`);
      } else {
        const filePath = path.join(PUBLIC_DIR, img);
        if (!fs.existsSync(filePath)) {
          warn(`${product.id}: image not found in public/: ${img}`);
        }
      }
    });
  }

  // Variants
  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    err(`${where} (${product.id}): must have at least 1 variant`);
    return;
  }

  const seenVariantIds = new Set();
  product.variants.forEach((variant, vIdx) => {
    const vWhere = `${product.id}.variants[${vIdx}]`;

    if (typeof variant.id !== 'string' || !variant.id) err(`${vWhere}.id missing`);
    if (variant.id) {
      if (seenVariantIds.has(variant.id)) {
        err(`Duplicate variant id within ${product.id}: ${variant.id}`);
      }
      seenVariantIds.add(variant.id);
    }

    if (!VALID_TYPES.has(variant.type)) {
      err(`${vWhere}.type must be one of sealed|opened|decant (got ${JSON.stringify(variant.type)})`);
    }

    if (typeof variant.size_ml !== 'number' || variant.size_ml <= 0) {
      err(`${vWhere}.size_ml must be a positive number`);
    }

    if (typeof variant.price !== 'number' || variant.price < 0) {
      err(`${vWhere}.price must be a non-negative number`);
    }

    if (typeof variant.stock !== 'number' || variant.stock < 0 || !Number.isInteger(variant.stock)) {
      err(`${vWhere}.stock must be a non-negative integer`);
    }

    if (variant.fill_pct !== undefined) {
      if (variant.type !== 'opened') {
        err(`${vWhere}.fill_pct only allowed on 'opened' variants`);
      } else if (
        typeof variant.fill_pct !== 'number' ||
        variant.fill_pct < 1 ||
        variant.fill_pct > 100
      ) {
        err(`${vWhere}.fill_pct must be 1..100`);
      }
    }
  });
});

if (warnings.length > 0) {
  console.warn('\n⚠ inventory.json warnings:');
  warnings.forEach((w) => console.warn(`  • ${w}`));
}

if (errors.length > 0) {
  console.error('\n✗ inventory.json validation failed:');
  errors.forEach((e) => console.error(`  • ${e}`));
  process.exit(1);
}

console.log(`✓ inventory.json validated (${data.length} products, ${warnings.length} warnings)`);
