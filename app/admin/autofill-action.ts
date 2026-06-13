'use server';

import Anthropic from '@anthropic-ai/sdk';
import { ACCORD_LABELS } from '@/lib/accords';

/**
 * AI autofill for fragrance metadata (admin product form).
 *
 * Input: brand + name (what the owner typed).
 * Output: line/collection, summary notes, olfactory pyramid (top/heart/base),
 * and a short Greek sales description.
 *
 * Provider selection (first configured wins):
 *   1. GEMINI_API_KEY    — Google Gemini free tier. No credit card, no
 *                          charges possible. ~1,500 free requests/day.
 *   2. ANTHROPIC_API_KEY — Claude API (paid, ~<$0.01/call). Optional.
 *
 * Both providers are forced into structured JSON via a shared schema, and
 * both are instructed to return known=false instead of inventing notes for
 * fragrances they can't confidently identify.
 */

export interface AutofillResult {
  data?: {
    line: string;
    notes: string;
    top_notes: string;
    heart_notes: string;
    base_notes: string;
    description_gr: string;
    accords: Array<{ name: string; intensity: number }>;
  };
  error?: string;
}

interface AutofillPayload {
  known: boolean;
  line: string;
  notes: string;
  top_notes: string;
  heart_notes: string;
  base_notes: string;
  description_gr: string;
  accords: Array<{ name: string; intensity: number }>;
}

const SYSTEM_PROMPT =
  'You are a fragrance database assistant. You return factual data about real, commercially released fragrances. ' +
  'If you are not confident the exact fragrance exists or you do not reliably know its note pyramid, set "known" to false ' +
  'and leave the note fields as empty strings — never invent notes. All note names and the description must be in Greek ' +
  '(but keep internationally-used terms like "oud", "vetiver", "musk" as commonly written in Greek fragrance communities).';

const FIELD_DESCRIPTIONS = {
  known:
    'true if you are confident this fragrance exists and you know its composition; false if unsure',
  line: "Collection or line name, e.g. 'Private Blend', 'Replica', 'La Collection Privée'. Empty string if none/unknown.",
  notes:
    'Short summary of 3-5 signature notes in Greek, comma-separated, lowercase. E.g. "καπνός, βανίλια, κακάο, μπαχαρικά"',
  top_notes:
    'Top notes (νότες κορυφής) in Greek, comma-separated, lowercase. Empty string if unknown.',
  heart_notes:
    'Heart/middle notes (νότες καρδιάς) in Greek, comma-separated, lowercase. Empty string if unknown.',
  base_notes:
    'Base notes (νότες βάσης) in Greek, comma-separated, lowercase. Empty string if unknown.',
  description_gr:
    '1-2 sentence sales description in Greek. Style: knowledgeable fragrance enthusiast, warm but not flowery. No emoji.',
  accords:
    'Main accords (κύριες συγχορδίες) of the fragrance, like Fragrantica\'s colored bars, sorted strongest-first (top 6-9). ' +
    'Each is {name, intensity} where intensity is 0-100 (the strongest accord should be ~90-100). ' +
    'The name MUST be EXACTLY one of these Greek labels (do not invent others, do not translate): ' +
    ACCORD_LABELS +
    '. Empty array if unknown.',
};

function toResult(parsed: AutofillPayload): AutofillResult {
  if (!parsed.known) {
    return {
      error:
        'Το AI δεν αναγνωρίζει με σιγουριά αυτό το άρωμα — συμπλήρωσε τα στοιχεία χειροκίνητα',
    };
  }
  return {
    data: {
      line: parsed.line ?? '',
      notes: parsed.notes ?? '',
      top_notes: parsed.top_notes ?? '',
      heart_notes: parsed.heart_notes ?? '',
      base_notes: parsed.base_notes ?? '',
      description_gr: parsed.description_gr ?? '',
      accords: Array.isArray(parsed.accords)
        ? parsed.accords
            .filter((a) => a && typeof a.name === 'string' && typeof a.intensity === 'number')
            .map((a) => ({ name: a.name, intensity: Math.max(0, Math.min(100, Math.round(a.intensity))) }))
        : [],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Provider: Google Gemini (free tier — preferred)
// ─────────────────────────────────────────────────────────────────────────

// Tried in order; older entries cover accounts where a newer model id is not
// yet enabled on the free tier.
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

const GEMINI_SCHEMA = {
  type: 'OBJECT',
  properties: {
    known: { type: 'BOOLEAN', description: FIELD_DESCRIPTIONS.known },
    line: { type: 'STRING', description: FIELD_DESCRIPTIONS.line },
    notes: { type: 'STRING', description: FIELD_DESCRIPTIONS.notes },
    top_notes: { type: 'STRING', description: FIELD_DESCRIPTIONS.top_notes },
    heart_notes: { type: 'STRING', description: FIELD_DESCRIPTIONS.heart_notes },
    base_notes: { type: 'STRING', description: FIELD_DESCRIPTIONS.base_notes },
    description_gr: { type: 'STRING', description: FIELD_DESCRIPTIONS.description_gr },
    accords: {
      type: 'ARRAY',
      description: FIELD_DESCRIPTIONS.accords,
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING', description: 'Greek accord label from the allowed list' },
          intensity: { type: 'INTEGER', description: 'Intensity 0-100' },
        },
        required: ['name', 'intensity'],
      },
    },
  },
  required: [
    'known',
    'line',
    'notes',
    'top_notes',
    'heart_notes',
    'base_notes',
    'description_gr',
    'accords',
  ],
};

async function callGemini(brand: string, name: string): Promise<AutofillResult> {
  const apiKey = process.env.GEMINI_API_KEY!;
  let lastError = '';

  for (const model of GEMINI_MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Fragrance: ${brand} — ${name}\n\nReturn the metadata for this fragrance.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: GEMINI_SCHEMA,
          },
        }),
      },
    );

    if (res.status === 404) {
      // Model id not available on this account/tier — try the next one.
      lastError = `Μοντέλο ${model} μη διαθέσιμο`;
      continue;
    }
    if (res.status === 400 || res.status === 403) {
      return { error: 'Άκυρο GEMINI_API_KEY — έλεγξέ το στο Vercel' };
    }
    if (res.status === 429) {
      return { error: 'Ξεπεράστηκε το δωρεάν όριο της ημέρας — δοκίμασε αύριο' };
    }
    if (!res.ok) {
      lastError = `Σφάλμα Gemini (${res.status})`;
      continue;
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return { error: 'Κενή απάντηση από το AI — δοκίμασε ξανά' };
    }
    try {
      return toResult(JSON.parse(text) as AutofillPayload);
    } catch {
      return { error: 'Μη αναγνώσιμη απάντηση από το AI — δοκίμασε ξανά' };
    }
  }

  return { error: lastError || 'Σφάλμα Gemini — δοκίμασε ξανά' };
}

// ─────────────────────────────────────────────────────────────────────────
// Provider: Anthropic Claude (optional, paid)
// ─────────────────────────────────────────────────────────────────────────

const CLAUDE_SCHEMA = {
  type: 'object' as const,
  properties: {
    known: { type: 'boolean' as const, description: FIELD_DESCRIPTIONS.known },
    line: { type: 'string' as const, description: FIELD_DESCRIPTIONS.line },
    notes: { type: 'string' as const, description: FIELD_DESCRIPTIONS.notes },
    top_notes: { type: 'string' as const, description: FIELD_DESCRIPTIONS.top_notes },
    heart_notes: { type: 'string' as const, description: FIELD_DESCRIPTIONS.heart_notes },
    base_notes: { type: 'string' as const, description: FIELD_DESCRIPTIONS.base_notes },
    description_gr: {
      type: 'string' as const,
      description: FIELD_DESCRIPTIONS.description_gr,
    },
    accords: {
      type: 'array' as const,
      description: FIELD_DESCRIPTIONS.accords,
      items: {
        type: 'object' as const,
        properties: {
          name: { type: 'string' as const, description: 'Greek accord label from the allowed list' },
          intensity: { type: 'integer' as const, description: 'Intensity 0-100' },
        },
        required: ['name', 'intensity'],
        additionalProperties: false as const,
      },
    },
  },
  required: [
    'known',
    'line',
    'notes',
    'top_notes',
    'heart_notes',
    'base_notes',
    'description_gr',
    'accords',
  ],
  additionalProperties: false as const,
};

async function callClaude(brand: string, name: string): Promise<AutofillResult> {
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Fragrance: ${brand} — ${name}\n\nReturn the metadata for this fragrance.`,
        },
      ],
      output_config: {
        format: { type: 'json_schema', schema: CLAUDE_SCHEMA },
      },
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === 'text',
    );
    if (!textBlock) {
      return { error: 'Κενή απάντηση από το AI — δοκίμασε ξανά' };
    }
    return toResult(JSON.parse(textBlock.text) as AutofillPayload);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return { error: 'Άκυρο ANTHROPIC_API_KEY — έλεγξέ το στο Vercel' };
    }
    if (err instanceof Anthropic.RateLimitError) {
      return { error: 'Πολλά αιτήματα — περίμενε λίγο και δοκίμασε ξανά' };
    }
    if (err instanceof Anthropic.APIError) {
      return { error: `Σφάλμα AI (${err.status}) — δοκίμασε ξανά` };
    }
    console.error('[autofill-action] Claude failed:', err);
    return { error: 'Σφάλμα autofill — δοκίμασε ξανά' };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────

export async function autofillFragranceAction(formData: FormData): Promise<AutofillResult> {
  const brand = String(formData.get('brand') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();

  if (!brand || !name) {
    return { error: 'Συμπλήρωσε πρώτα Brand και Όνομα' };
  }

  if (process.env.GEMINI_API_KEY) {
    return callGemini(brand, name);
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return callClaude(brand, name);
  }
  return {
    error:
      'Δεν έχει ρυθμιστεί το AI autofill — πρόσθεσε GEMINI_API_KEY (δωρεάν) στο Vercel',
  };
}
