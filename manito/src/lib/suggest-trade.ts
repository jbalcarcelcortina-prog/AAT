/**
 * Keyword classifier: guess the oficio from a problem description.
 *
 * The matcher in `matching.ts` already refuses to show a plumber for an
 * electrical job, but it trusts the trade the customer picked. This file is
 * the step before that. It reads the description (Spanish, Mexico) and
 * suggests one of the trades in `constants.ts`, or nothing.
 *
 * How a suggestion is chosen:
 *
 *   1. Fold accents and case so "Éléctrico" and "electrico" are the same text.
 *   2. Score each trade by the keywords that appear as whole words.
 *   3. A longer hit hides a shorter one it contains ("aire acondicionado"
 *      counts, a bare "aire" would not be listed as well).
 *   4. High confidence only when one trade leads by a clear margin. A tie, or
 *      a score that is only a weak word, comes back as low confidence. A tie
 *      breaks toward whichever trade is listed first in SERVICE_CATEGORIES.
 *      No keyword at all comes back as no suggestion.
 *
 * It is a pure function on a string. Routes and the post-a-problem form call
 * `suggestTrade` and render what it returns.
 */

import {
  categoryOficio,
  SERVICE_CATEGORY_VALUES,
  type ServiceCategory,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TradeConfidence = "high" | "low" | "none";

export interface TradeSuggestion {
  /** Category value stored on a job, or null when we should not suggest. */
  category: ServiceCategory | null;
  /** Spanish oficio, or null when we should not suggest. */
  oficio: string | null;
  /** Dictionary terms that scored for the suggested trade, in text order. */
  keywords: string[];
  confidence: TradeConfidence;
}

interface KeywordRule {
  /** Display form, accents kept. Matching uses the folded form. */
  term: string;
  weight: number;
}

// ---------------------------------------------------------------------------
// Tuning
// ---------------------------------------------------------------------------

/**
 * Point gates for confidence. Change these to make Manito more or less willing
 * to prefill a trade. Weights live next to each keyword below.
 */
export const SUGGEST_THRESHOLDS = {
  /** Below this total, return no suggestion at all. */
  lowScore: 2,
  /** A suggestion must reach this, and lead, before confidence is high. */
  highScore: 4,
  /** Winner must beat the next trade by at least this many points. */
  highMargin: 2,
} as const;

const NONE: TradeSuggestion = {
  category: null,
  oficio: null,
  keywords: [],
  confidence: "none",
};

/**
 * Terms people in CDMX actually write. Weights are relative: a trade's own
 * name outranks a generic noun ("agua", "clima"), and a generic noun alone
 * stays under `highScore` so it can only produce a low-confidence hint.
 *
 * "llave" is intentionally absent — in Spanish it is both a faucet and a key.
 */
const TRADE_KEYWORDS: Record<ServiceCategory, readonly KeywordRule[]> = {
  PLUMBING: [
    { term: "plomero", weight: 6 },
    { term: "plomería", weight: 6 },
    { term: "gotera", weight: 4 },
    { term: "goteras", weight: 4 },
    { term: "fuga", weight: 4 },
    { term: "fugas", weight: 4 },
    { term: "salidero", weight: 4 },
    { term: "tubería", weight: 4 },
    { term: "tuberías", weight: 4 },
    { term: "drenaje", weight: 4 },
    { term: "desagüe", weight: 4 },
    { term: "coladera", weight: 4 },
    { term: "céspol", weight: 4 },
    { term: "lavabo", weight: 4 },
    { term: "tarja", weight: 4 },
    { term: "inodoro", weight: 4 },
    { term: "tinaco", weight: 4 },
    { term: "cisterna", weight: 4 },
    { term: "boiler", weight: 4 },
    { term: "mezcladora", weight: 4 },
    { term: "calentador", weight: 3 },
    { term: "regadera", weight: 3 },
    { term: "gotea", weight: 3 },
    { term: "goteo", weight: 3 },
    { term: "goteando", weight: 3 },
    { term: "atorado", weight: 3 },
    { term: "atorada", weight: 3 },
    { term: "tapado", weight: 3 },
    { term: "tapada", weight: 3 },
    { term: "válvula", weight: 3 },
    { term: "baño", weight: 2 },
    { term: "agua", weight: 2 },
  ],
  ELECTRICAL: [
    { term: "electricista", weight: 6 },
    { term: "electricidad", weight: 5 },
    { term: "eléctrico", weight: 5 },
    { term: "eléctrica", weight: 5 },
    { term: "apagón", weight: 5 },
    { term: "cortocircuito", weight: 5 },
    { term: "corto circuito", weight: 5 },
    { term: "luz", weight: 4 },
    { term: "luces", weight: 4 },
    { term: "foco", weight: 4 },
    { term: "focos", weight: 4 },
    { term: "contacto", weight: 4 },
    { term: "contactos", weight: 4 },
    { term: "enchufe", weight: 4 },
    { term: "enchufes", weight: 4 },
    { term: "apagador", weight: 4 },
    { term: "apagadores", weight: 4 },
    { term: "interruptor", weight: 4 },
    { term: "fusible", weight: 4 },
    { term: "cableado", weight: 4 },
    { term: "voltaje", weight: 4 },
    { term: "chispa", weight: 3 },
    { term: "chispas", weight: 3 },
    { term: "pastilla", weight: 3 },
    { term: "pastillas", weight: 3 },
    { term: "tablero", weight: 3 },
    { term: "quemado", weight: 2 },
    { term: "quemada", weight: 2 },
  ],
  HVAC: [
    { term: "minisplit", weight: 5 },
    { term: "mini split", weight: 5 },
    { term: "aire acondicionado", weight: 5 },
    { term: "climatización", weight: 5 },
    { term: "calefacción", weight: 4 },
    { term: "freón", weight: 4 },
    { term: "no enfría", weight: 3 },
    { term: "ventilación", weight: 3 },
    { term: "clima", weight: 3 },
  ],
  HANDYMAN: [
    { term: "manitas", weight: 6 },
    { term: "tablaroca", weight: 5 },
    { term: "resanar", weight: 4 },
    { term: "taquete", weight: 4 },
    { term: "drywall", weight: 4 },
    { term: "bisagra", weight: 3 },
    { term: "chapa", weight: 3 },
    { term: "repisa", weight: 3 },
    { term: "taladro", weight: 3 },
    { term: "persiana", weight: 3 },
    { term: "colgar", weight: 3 },
    { term: "yeso", weight: 3 },
    { term: "cuadro", weight: 2 },
    { term: "cortina", weight: 2 },
  ],
  APPLIANCE_REPAIR: [
    { term: "lavadora", weight: 5 },
    { term: "secadora", weight: 5 },
    { term: "refrigerador", weight: 5 },
    { term: "microondas", weight: 5 },
    { term: "lavavajillas", weight: 5 },
    { term: "lavaplatos", weight: 5 },
    { term: "electrodoméstico", weight: 5 },
    { term: "electrodomésticos", weight: 5 },
    { term: "estufa", weight: 4 },
    { term: "horno", weight: 4 },
    { term: "refri", weight: 4 },
    { term: "nevera", weight: 4 },
    { term: "congelador", weight: 4 },
    { term: "centrifuga", weight: 3 },
    { term: "centrifugado", weight: 3 },
  ],
};

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

interface PreparedKeyword extends KeywordRule {
  category: ServiceCategory;
  /** Folded, single-spaced, used as the search needle. */
  folded: string;
}

interface Hit {
  category: ServiceCategory;
  term: string;
  weight: number;
  start: number;
  end: number;
}

const PREPARED: readonly PreparedKeyword[] = SERVICE_CATEGORY_VALUES.flatMap(
  (category) =>
    TRADE_KEYWORDS[category].map((rule) => ({
      ...rule,
      category,
      folded: normalizeText(rule.term),
    })),
);

/**
 * Lowercase, strip accents, and turn punctuation into spaces.
 * "¡Se fue la luz!" and "se fue la luz" fold to the same string.
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/ +/g, " ");
}

/**
 * Suggest an oficio for a problem description.
 * Empty input, and text that hits no keyword, both return confidence "none".
 */
export function suggestTrade(description: string): TradeSuggestion {
  const folded = normalizeText(description);
  if (!folded) return NONE;

  const haystack = ` ${folded} `;
  const hits = collectHits(haystack);
  if (hits.length === 0) return NONE;

  const ranked = rank(hits);
  const best = ranked[0];
  if (!best || best.score < SUGGEST_THRESHOLDS.lowScore) return NONE;

  const runnerUp = ranked[1]?.score ?? 0;
  const clearLead =
    best.score >= SUGGEST_THRESHOLDS.highScore &&
    best.score - runnerUp >= SUGGEST_THRESHOLDS.highMargin;

  return {
    category: best.category,
    oficio: categoryOficio(best.category),
    keywords: best.keywords,
    confidence: clearLead ? "high" : "low",
  };
}

/**
 * Whole-word hits only, so "luz" does not fire inside "reluciente".
 * A longer hit on the same trade drops a shorter hit it completely covers.
 */
function collectHits(haystack: string): Hit[] {
  const found: Hit[] = [];

  for (const rule of PREPARED) {
    const needle = ` ${rule.folded} `;
    const start = haystack.indexOf(needle);
    if (start === -1) continue;
    found.push({
      category: rule.category,
      term: rule.term,
      weight: rule.weight,
      start,
      end: start + needle.length,
    });
  }

  found.sort((a, b) => b.end - b.start - (a.end - a.start));
  const kept: Hit[] = [];
  for (const hit of found) {
    const covered = kept.some(
      (other) =>
        other.category === hit.category &&
        other.start <= hit.start &&
        other.end >= hit.end,
    );
    if (!covered) kept.push(hit);
  }
  return kept;
}

interface RankedTrade {
  category: ServiceCategory;
  score: number;
  keywords: string[];
}

function rank(hits: Hit[]): RankedTrade[] {
  const byCategory = new Map<ServiceCategory, Hit[]>();
  for (const hit of hits) {
    const list = byCategory.get(hit.category);
    if (list) list.push(hit);
    else byCategory.set(hit.category, [hit]);
  }

  const order = new Map(SERVICE_CATEGORY_VALUES.map((value, index) => [value, index]));

  return [...byCategory.entries()]
    .map(([category, categoryHits]) => {
      const ordered = [...categoryHits].sort((a, b) => a.start - b.start);
      return {
        category,
        score: ordered.reduce((sum, hit) => sum + hit.weight, 0),
        keywords: ordered.map((hit) => hit.term),
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        (order.get(a.category) ?? 0) - (order.get(b.category) ?? 0),
    );
}
