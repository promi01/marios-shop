'use server';

import Anthropic from '@anthropic-ai/sdk';

/**
 * AI autofill for fragrance metadata (admin product form).
 *
 * Input: brand + name (what the owner typed).
 * Output: line/collection, summary notes, olfactory pyramid (top/heart/base),
 * and a short Greek sales description — via the Claude API with structured
 * JSON output so the response always parses.
 *
 * Fragrance note data is widely known public information; no scraping of
 * Fragrantica (Cloudflare-blocked + copyrighted) is involved. The model is
 * instructed to leave fields empty rather than guess for obscure fragrances,
 * and the admin UI tells the owner to review before saving.
 *
 * Requires ANTHROPIC_API_KEY (Vercel env var). Cost per call is well under
 * $0.01 — a few hundred input/output tokens.
 */

export interface AutofillResult {
  data?: {
    line: string;
    notes: string;
    top_notes: string;
    heart_notes: string;
    base_notes: string;
    description_gr: string;
  };
  error?: string;
}

const OUTPUT_SCHEMA = {
  type: 'object' as const,
  properties: {
    known: {
      type: 'boolean' as const,
      description:
        'true if you are confident this fragrance exists and you know its composition; false if unsure',
    },
    line: {
      type: 'string' as const,
      description:
        "Collection or line name, e.g. 'Private Blend', 'Replica', 'La Collection Privée'. Empty string if none/unknown.",
    },
    notes: {
      type: 'string' as const,
      description:
        'Short summary of 3-5 signature notes in Greek, comma-separated, lowercase. E.g. "καπνός, βανίλια, κακάο, μπαχαρικά"',
    },
    top_notes: {
      type: 'string' as const,
      description:
        'Top notes (νότες κορυφής) in Greek, comma-separated, lowercase. Empty string if unknown.',
    },
    heart_notes: {
      type: 'string' as const,
      description:
        'Heart/middle notes (νότες καρδιάς) in Greek, comma-separated, lowercase. Empty string if unknown.',
    },
    base_notes: {
      type: 'string' as const,
      description:
        'Base notes (νότες βάσης) in Greek, comma-separated, lowercase. Empty string if unknown.',
    },
    description_gr: {
      type: 'string' as const,
      description:
        '1-2 sentence sales description in Greek. Style: knowledgeable fragrance enthusiast, warm but not flowery. No emoji.',
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
  ],
  additionalProperties: false as const,
};

export async function autofillFragranceAction(formData: FormData): Promise<AutofillResult> {
  const brand = String(formData.get('brand') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();

  if (!brand || !name) {
    return { error: 'Συμπλήρωσε πρώτα Brand και Όνομα' };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: 'Δεν έχει ρυθμιστεί το AI autofill (λείπει το ANTHROPIC_API_KEY)' };
  }

  try {
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4000,
      system:
        'You are a fragrance database assistant. You return factual data about real, commercially released fragrances. ' +
        'If you are not confident the exact fragrance exists or you do not reliably know its note pyramid, set "known" to false ' +
        'and leave the note fields as empty strings — never invent notes. All note names and the description must be in Greek ' +
        '(but keep internationally-used terms like "oud", "vetiver", "musk" as commonly written in Greek fragrance communities).',
      messages: [
        {
          role: 'user',
          content: `Fragrance: ${brand} — ${name}\n\nReturn the metadata for this fragrance.`,
        },
      ],
      output_config: {
        format: {
          type: 'json_schema',
          schema: OUTPUT_SCHEMA,
        },
      },
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === 'text',
    );
    if (!textBlock) {
      return { error: 'Κενή απάντηση από το AI — δοκίμασε ξανά' };
    }

    const parsed = JSON.parse(textBlock.text) as {
      known: boolean;
      line: string;
      notes: string;
      top_notes: string;
      heart_notes: string;
      base_notes: string;
      description_gr: string;
    };

    if (!parsed.known) {
      return {
        error:
          'Το AI δεν αναγνωρίζει με σιγουριά αυτό το άρωμα — συμπλήρωσε τα στοιχεία χειροκίνητα',
      };
    }

    return {
      data: {
        line: parsed.line,
        notes: parsed.notes,
        top_notes: parsed.top_notes,
        heart_notes: parsed.heart_notes,
        base_notes: parsed.base_notes,
        description_gr: parsed.description_gr,
      },
    };
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return { error: 'Άκυρο ANTHROPIC_API_KEY — έλεγξε το στο Vercel' };
    }
    if (err instanceof Anthropic.RateLimitError) {
      return { error: 'Πολλά αιτήματα — περίμενε λίγο και δοκίμασε ξανά' };
    }
    if (err instanceof Anthropic.APIError) {
      return { error: `Σφάλμα AI (${err.status}) — δοκίμασε ξανά` };
    }
    console.error('[autofill-action] Failed:', err);
    return { error: 'Σφάλμα autofill — δοκίμασε ξανά' };
  }
}
