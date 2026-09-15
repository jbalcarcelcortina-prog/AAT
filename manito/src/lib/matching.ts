/**
 * ============================================================================
 *  THE MATCHER  —  this is the piece designed to be thrown away.
 * ============================================================================
 *
 * Everything Manito knows about "which pro should fix this problem" lives in
 * this one file. Nothing else in the app scores or sorts providers; routes and
 * pages call `findMatches()` and render whatever comes back.
 *
 * What it does today (deliberately dumb and fully deterministic):
 *
 *   1. HARD FILTER on trade. A plumber never shows up for an electrical job.
 *   2. SPLIT INTO TIERS by location:
 *        - "direct" — the pro lists the job's neighborhood as a service area.
 *        - "nearby" — the pro works an adjacent neighborhood (see
 *          ADJACENT_AREAS). Shown as a clearly-labelled second group so the
 *          UI never dead-ends on an empty result.
 *   3. SCORE each survivor with a fixed linear weighting and sort descending.
 *      Because every provider inside a tier already matched on trade and
 *      location, the only terms that vary are rating (25 pts), years of
 *      experience (4 pts) and the verified flag (1 pt) — so in practice a tier
 *      is ordered by rating, with experience breaking ties. That is exactly
 *      the "sorted by rating" behaviour the mockup is specified to have, just
 *      expressed as weights that can be re-tuned instead of a hardcoded sort.
 *
 * What it does NOT do, and what a real version would need:
 *   - real distance / travel time instead of neighborhood string equality
 *   - provider availability, calendars, and current workload
 *   - urgency-aware ranking (a HIGH urgency job should prefer whoever can
 *     actually show up today, not whoever has the best rating)
 *   - price expectations, past acceptance rate, response latency
 *   - learning from outcomes: which requests got accepted and completed
 *
 * To replace it: keep the `findMatches` signature, rewrite the body. The rest
 * of the app does not need to change.
 */

import {
  ADJACENT_AREAS,
  areaLabel,
  categoryLabel,
  type ServiceArea,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The shape the matcher needs. Intentionally a plain object rather than a
 * Prisma model, so the algorithm can be unit-tested with literals and so
 * swapping the data layer does not touch this file.
 */
export interface MatchableProvider {
  id: string;
  name: string;
  bio: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  hourlyRateMxn: number | null;
  verified: boolean;
  categories: string[];
  areas: string[];
}

export interface MatchCriteria {
  category: string;
  area: string;
  /** Not used by the current scoring pass — see the file header. */
  urgency?: string;
}

export type MatchTier = "direct" | "nearby";

export interface ProviderMatch {
  provider: MatchableProvider;
  /** Higher is better. Only meaningful relative to other matches for the same job. */
  score: number;
  tier: MatchTier;
  /** Short human-readable strings the UI shows as chips on the match card. */
  reasons: string[];
}

export interface MatchResult {
  /** Pros who cover the exact neighborhood. The primary list. */
  direct: ProviderMatch[];
  /** Pros one neighborhood over. Shown as a labelled fallback group. */
  nearby: ProviderMatch[];
}

export interface MatchOptions {
  /** Cap on each tier. Defaults to 10. */
  limit?: number;
  /** Set false to hide the adjacent-neighborhood fallback entirely. */
  includeNearby?: boolean;
}

// ---------------------------------------------------------------------------
// Tuning knobs
// ---------------------------------------------------------------------------

/**
 * Point values for the linear score. Every term is capped, so the maximum
 * possible score is the sum of these weights (minus the nearby/direct
 * difference). Change a number here to change ranking behaviour globally.
 */
export const MATCH_WEIGHTS = {
  /** Required to appear at all, so constant across every result. */
  category: 40,
  /** Provider explicitly serves the job's neighborhood. */
  areaExact: 30,
  /** Provider serves an adjacent neighborhood. */
  areaAdjacent: 12,
  /** Scaled by rating / RATING_SCALE. The dominant variable term. */
  rating: 25,
  /** Scaled by min(years, EXPERIENCE_CAP) / EXPERIENCE_CAP. */
  experience: 4,
  /** Flat bonus for the (mock) verified badge. */
  verified: 1,
} as const;

/** Ratings are stored out of 5. */
export const RATING_SCALE = 5;
/** Years of experience past this point stop adding score. */
export const EXPERIENCE_CAP = 15;

const DEFAULT_LIMIT = 10;

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Score one provider against one job. Exported so it can be unit-tested and so
 * a future version can reuse it to snapshot the score at request time.
 *
 * Returns `null` when the provider is not a candidate at all (wrong trade, or
 * too far away), which keeps the filter and the score in one place.
 */
export function scoreProvider(
  criteria: MatchCriteria,
  provider: MatchableProvider,
  options: MatchOptions = {},
): ProviderMatch | null {
  // 1. Trade is a hard requirement.
  if (!provider.categories.includes(criteria.category)) return null;

  const reasons: string[] = [];
  let score = MATCH_WEIGHTS.category;
  reasons.push(`Works on ${categoryLabel(criteria.category).toLowerCase()}`);

  // 2. Location decides the tier.
  let tier: MatchTier;
  if (provider.areas.includes(criteria.area)) {
    tier = "direct";
    score += MATCH_WEIGHTS.areaExact;
    reasons.push(`Serves ${areaLabel(criteria.area)}`);
  } else if (
    (options.includeNearby ?? true) &&
    servesAdjacentArea(criteria.area, provider.areas)
  ) {
    tier = "nearby";
    score += MATCH_WEIGHTS.areaAdjacent;
    reasons.push(`Works next door to ${areaLabel(criteria.area)}`);
  } else {
    return null;
  }

  // 3. Quality signals. All mock data today.
  score += (clamp(provider.rating, 0, RATING_SCALE) / RATING_SCALE) *
    MATCH_WEIGHTS.rating;
  if (provider.rating >= 4.8) {
    reasons.push("Top rated");
  }

  score += (clamp(provider.yearsExperience, 0, EXPERIENCE_CAP) /
    EXPERIENCE_CAP) * MATCH_WEIGHTS.experience;
  if (provider.yearsExperience >= 10) {
    reasons.push(`${provider.yearsExperience} years experience`);
  }

  if (provider.verified) {
    score += MATCH_WEIGHTS.verified;
    reasons.push("ID verified");
  }

  return { provider, score: round2(score), tier, reasons };
}

/**
 * Rank a pool of providers for one job.
 *
 * The caller is expected to hand in a pool already narrowed by the database
 * (see `src/lib/providers.ts`), but this function re-checks every condition so
 * it is correct on any input — including a plain array in a test.
 */
export function findMatches(
  criteria: MatchCriteria,
  providers: MatchableProvider[],
  options: MatchOptions = {},
): MatchResult {
  const limit = options.limit ?? DEFAULT_LIMIT;

  const scored = providers
    .map((provider) => scoreProvider(criteria, provider, options))
    .filter((match): match is ProviderMatch => match !== null)
    .sort(compareMatches);

  return {
    direct: scored.filter((m) => m.tier === "direct").slice(0, limit),
    nearby: scored.filter((m) => m.tier === "nearby").slice(0, limit),
  };
}

/** Flattened convenience view: direct matches first, then nearby. */
export function flattenMatches(result: MatchResult): ProviderMatch[] {
  return [...result.direct, ...result.nearby];
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/**
 * Deterministic ordering. Score first; the remaining keys exist only so two
 * providers with identical scores never swap places between page loads.
 */
function compareMatches(a: ProviderMatch, b: ProviderMatch): number {
  return (
    b.score - a.score ||
    b.provider.rating - a.provider.rating ||
    b.provider.reviewCount - a.provider.reviewCount ||
    a.provider.name.localeCompare(b.provider.name)
  );
}

function servesAdjacentArea(jobArea: string, providerAreas: string[]): boolean {
  const neighbors = ADJACENT_AREAS[jobArea as ServiceArea] ?? [];
  return providerAreas.some((area) =>
    neighbors.includes(area as ServiceArea),
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
