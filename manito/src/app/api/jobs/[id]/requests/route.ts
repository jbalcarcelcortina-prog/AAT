import { fail, handleError, ok, readJson } from "@/lib/api";
import { requestProvider } from "@/lib/jobs";
import { getCurrentUser } from "@/lib/session";
import { requestProviderSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

/** POST /api/jobs/:id/requests — consumer asks one specific pro. */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in first", 401);
    if (user.role !== "CONSUMER") return fail("Consumers only", 403);

    const { id } = await params;
    const input = requestProviderSchema.parse(await readJson(request));
    const job = await requestProvider(
      id,
      user.id,
      input.providerId,
      input.message,
    );
    return ok(job, 201);
  } catch (error) {
    return handleError(error);
  }
}
