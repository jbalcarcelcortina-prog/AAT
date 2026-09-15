import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { scoreProvider } from "@/lib/matching";
import { toMatchable } from "@/lib/providers";
import type { CreateJobInput } from "@/lib/validation";

/**
 * Job lifecycle rules.
 *
 * OPEN        consumer posted it, nobody contacted yet
 * REQUESTED   consumer sent it to at least one pro, nobody has accepted
 * ACCEPTED    a pro took it (first accept wins; the rest are auto-declined)
 * COMPLETED   consumer marked the work done
 *
 * Every function here re-checks ownership. API routes are reachable directly,
 * not only through our own UI, so "the button was hidden" is not a permission
 * check.
 */

export class JobError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = "JobError";
  }
}

const jobInclude = {
  consumer: { select: { id: true, name: true, email: true, phone: true } },
  acceptedProvider: {
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      categories: { select: { category: true } },
      areas: { select: { area: true } },
    },
  },
  requests: {
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          categories: { select: { category: true } },
          areas: { select: { area: true } },
        },
      },
    },
  },
} satisfies Prisma.JobInclude;

export type JobWithRelations = Prisma.JobGetPayload<{
  include: typeof jobInclude;
}>;

// ---------------------------------------------------------------------------
// Consumer side
// ---------------------------------------------------------------------------

export async function createJob(consumerId: string, input: CreateJobInput) {
  return prisma.job.create({
    data: { ...input, consumerId, status: "OPEN" },
    include: jobInclude,
  });
}

export async function listJobsForConsumer(
  consumerId: string,
): Promise<JobWithRelations[]> {
  return prisma.job.findMany({
    where: { consumerId },
    include: jobInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getJobForConsumer(
  jobId: string,
  consumerId: string,
): Promise<JobWithRelations> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: jobInclude,
  });
  if (!job) throw new JobError("Job not found", 404);
  if (job.consumerId !== consumerId) throw new JobError("Not your job", 403);
  return job;
}

/**
 * Consumer picks one pro off the match list.
 *
 * Several requests can be open at once — that is the point of a marketplace.
 * The job moves to REQUESTED, and the match score is snapshotted so a later
 * version can ask "did the matcher's top pick actually get chosen?".
 */
export async function requestProvider(
  jobId: string,
  consumerId: string,
  providerId: string,
  message?: string,
): Promise<JobWithRelations> {
  const job = await getJobForConsumer(jobId, consumerId);
  if (job.status === "ACCEPTED" || job.status === "COMPLETED") {
    throw new JobError("This job already has a pro on it", 409);
  }

  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      categories: { select: { category: true } },
      areas: { select: { area: true } },
    },
  });
  if (!provider) throw new JobError("Provider not found", 404);

  // Re-run the matcher server-side. The client sends an id, not a score, so a
  // hand-crafted request cannot smuggle in a provider from the wrong trade.
  const match = scoreProvider(
    { category: job.category, area: job.area, urgency: job.urgency },
    toMatchable(provider),
  );
  if (!match) {
    throw new JobError("That pro doesn't cover this trade or area", 400);
  }

  const existing = await prisma.jobRequest.findUnique({
    where: { jobId_providerId: { jobId, providerId } },
  });
  if (existing) throw new JobError("You already requested this pro", 409);

  await prisma.$transaction([
    prisma.jobRequest.create({
      data: {
        jobId,
        providerId,
        status: "PENDING",
        matchScore: match.score,
        message: message?.trim() || null,
      },
    }),
    prisma.job.update({
      where: { id: jobId },
      data: { status: "REQUESTED" },
    }),
  ]);

  return getJobForConsumer(jobId, consumerId);
}

export async function completeJob(
  jobId: string,
  consumerId: string,
): Promise<JobWithRelations> {
  const job = await getJobForConsumer(jobId, consumerId);
  if (job.status !== "ACCEPTED") {
    throw new JobError("Only an accepted job can be completed", 409);
  }
  await prisma.job.update({
    where: { id: jobId },
    data: { status: "COMPLETED" },
  });
  return getJobForConsumer(jobId, consumerId);
}

// ---------------------------------------------------------------------------
// Provider side
// ---------------------------------------------------------------------------

const requestInclude = {
  job: {
    include: { consumer: { select: { id: true, name: true } } },
  },
} satisfies Prisma.JobRequestInclude;

export type RequestWithJob = Prisma.JobRequestGetPayload<{
  include: typeof requestInclude;
}>;

/**
 * The provider inbox.
 *
 * Note that this does not re-filter by trade or area: a request only exists
 * because the matcher already decided this pro fit the job. Filtering again
 * here would silently hide requests whenever a pro edits their service areas.
 */
export async function listRequestsForProvider(
  providerId: string,
): Promise<RequestWithJob[]> {
  return prisma.jobRequest.findMany({
    where: { providerId },
    include: requestInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function listAcceptedJobsForProvider(
  providerId: string,
): Promise<JobWithRelations[]> {
  return prisma.job.findMany({
    where: { acceptedProviderId: providerId },
    include: jobInclude,
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Accept or decline. First accept wins: the job is claimed and every other
 * pending request on that job is auto-declined in the same transaction, so two
 * pros can never both believe they have the work.
 */
export async function respondToRequest(
  requestId: string,
  providerId: string,
  decision: "ACCEPT" | "DECLINE",
): Promise<RequestWithJob> {
  const request = await prisma.jobRequest.findUnique({
    where: { id: requestId },
    include: { job: true },
  });
  if (!request) throw new JobError("Request not found", 404);
  if (request.providerId !== providerId) {
    throw new JobError("Not your request", 403);
  }
  if (request.status !== "PENDING") {
    throw new JobError("You already answered this request", 409);
  }

  const now = new Date();

  if (decision === "DECLINE") {
    await prisma.$transaction(async (tx) => {
      await tx.jobRequest.update({
        where: { id: requestId },
        data: { status: "DECLINED", respondedAt: now },
      });
      // If that was the last open request, the job goes back on the market.
      const stillPending = await tx.jobRequest.count({
        where: { jobId: request.jobId, status: "PENDING" },
      });
      if (stillPending === 0 && request.job.status === "REQUESTED") {
        await tx.job.update({
          where: { id: request.jobId },
          data: { status: "OPEN" },
        });
      }
    });
  } else {
    if (request.job.status === "ACCEPTED" || request.job.status === "COMPLETED") {
      throw new JobError("Another pro already took this job", 409);
    }
    await prisma.$transaction([
      prisma.jobRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED", respondedAt: now },
      }),
      prisma.jobRequest.updateMany({
        where: { jobId: request.jobId, status: "PENDING", id: { not: requestId } },
        data: { status: "DECLINED", respondedAt: now },
      }),
      prisma.job.update({
        where: { id: request.jobId },
        data: { status: "ACCEPTED", acceptedProviderId: providerId },
      }),
    ]);
  }

  return prisma.jobRequest.findUniqueOrThrow({
    where: { id: requestId },
    include: requestInclude,
  });
}
