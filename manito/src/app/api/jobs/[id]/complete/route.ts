import { fail, handleError, ok } from "@/lib/api";
import { completeJob } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

/** POST /api/jobs/:id/complete — consumer marks the work done. */
export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in first", 401);
    if (user.role !== "CONSUMER") return fail("Consumers only", 403);

    const { id } = await params;
    return ok(await completeJob(id, user.id));
  } catch (error) {
    return handleError(error);
  }
}
