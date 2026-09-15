import { fail, handleError, ok } from "@/lib/api";
import { getJobForConsumer } from "@/lib/jobs";
import { getMatchesForJob } from "@/lib/providers";
import { getCurrentUser } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/jobs/:id/matches — ranked pros for one job.
 *
 * Matching is recomputed on every call rather than stored. That is fine at
 * mockup scale and means a provider editing their service areas immediately
 * changes who shows up.
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in first", 401);
    if (user.role !== "CONSUMER") return fail("Consumers only", 403);

    const { id } = await params;
    const job = await getJobForConsumer(id, user.id);
    return ok(await getMatchesForJob(job));
  } catch (error) {
    return handleError(error);
  }
}
