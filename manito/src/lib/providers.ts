import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  findMatches,
  type MatchableProvider,
  type MatchResult,
} from "@/lib/matching";
import type { ProviderProfileInput } from "@/lib/validation";

/**
 * Provider reads and writes. Everything the app knows about fetching pros goes
 * through here, so the matcher never talks to Prisma directly and can stay a
 * pure function over plain objects.
 */

const providerInclude = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  categories: { select: { category: true } },
  areas: { select: { area: true } },
} as const;

export type ProviderRow = Prisma.ProviderProfileGetPayload<{
  include: typeof providerInclude;
}>;

/** Map a database row onto the plain shape the matcher expects. */
export function toMatchable(row: ProviderRow): MatchableProvider {
  return {
    id: row.id,
    name: row.user.name,
    bio: row.bio,
    yearsExperience: row.yearsExperience,
    rating: row.rating,
    reviewCount: row.reviewCount,
    hourlyRateMxn: row.hourlyRateMxn,
    verified: row.verified,
    categories: row.categories.map((c) => c.category),
    areas: row.areas.map((a) => a.area),
  };
}

/**
 * Candidate pool for one job.
 *
 * The database narrows by trade only — an indexed query that stays cheap as the
 * table grows. Location is deliberately left to `src/lib/matching.ts` so that
 * all the "is this pro close enough" logic lives in one swappable file. When
 * the matcher learns about real distance, this query is where a bounding-box
 * or PostGIS filter would be added.
 */
export async function getCandidateProviders(
  category: string,
): Promise<MatchableProvider[]> {
  const rows = await prisma.providerProfile.findMany({
    where: { categories: { some: { category } } },
    include: providerInclude,
    orderBy: { rating: "desc" },
  });
  return rows.map(toMatchable);
}

/** Run the matcher for a job that already exists. */
export async function getMatchesForJob(job: {
  category: string;
  area: string;
  urgency: string;
}): Promise<MatchResult> {
  const pool = await getCandidateProviders(job.category);
  return findMatches(
    { category: job.category, area: job.area, urgency: job.urgency },
    pool,
  );
}

export async function getProviderProfileByUserId(userId: string) {
  return prisma.providerProfile.findUnique({
    where: { userId },
    include: providerInclude,
  });
}

/** Providers sign up before they have a profile; create one on first save. */
export async function upsertProviderProfile(
  userId: string,
  input: ProviderProfileInput,
) {
  const { categories, areas, bio, yearsExperience, hourlyRateMxn } = input;

  return prisma.$transaction(async (tx) => {
    const profile = await tx.providerProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio,
        yearsExperience,
        hourlyRateMxn: hourlyRateMxn ?? null,
      },
      update: {
        bio,
        yearsExperience,
        hourlyRateMxn: hourlyRateMxn ?? null,
      },
    });

    // Replace-in-full rather than diffing: the lists are tiny and this keeps
    // the write obviously correct.
    await tx.providerCategory.deleteMany({ where: { providerId: profile.id } });
    await tx.providerArea.deleteMany({ where: { providerId: profile.id } });
    await tx.providerCategory.createMany({
      data: categories.map((category) => ({ providerId: profile.id, category })),
    });
    await tx.providerArea.createMany({
      data: areas.map((area) => ({ providerId: profile.id, area })),
    });

    return tx.providerProfile.findUniqueOrThrow({
      where: { id: profile.id },
      include: providerInclude,
    });
  });
}
