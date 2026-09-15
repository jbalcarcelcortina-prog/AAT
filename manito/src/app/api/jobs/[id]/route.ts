import { fail, handleError, ok } from "@/lib/api";
import { getJobForConsumer } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

/** GET /api/jobs/:id — one job, owner only. */
export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in first", 401);
    if (user.role !== "CONSUMER") return fail("Consumers only", 403);

    const { id } = await params;
    return ok(await getJobForConsumer(id, user.id));
  } catch (error) {
    return handleError(error);
  }
}
