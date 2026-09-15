import { fail, handleError, ok, readJson } from "@/lib/api";
import { createJob, listJobsForConsumer } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/session";
import { createJobSchema } from "@/lib/validation";

/** GET /api/jobs — the signed-in consumer's own jobs. */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in first", 401);
    if (user.role !== "CONSUMER") return fail("Consumers only", 403);

    return ok(await listJobsForConsumer(user.id));
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/jobs — post a problem. */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in first", 401);
    if (user.role !== "CONSUMER") return fail("Consumers only", 403);

    const input = createJobSchema.parse(await readJson(request));
    return ok(await createJob(user.id, input), 201);
  } catch (error) {
    return handleError(error);
  }
}
