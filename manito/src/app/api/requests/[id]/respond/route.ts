import { fail, handleError, ok, readJson } from "@/lib/api";
import { respondToRequest } from "@/lib/jobs";
import { getProviderProfileByUserId } from "@/lib/providers";
import { getCurrentUser } from "@/lib/session";
import { respondToRequestSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

/** POST /api/requests/:id/respond — provider accepts or declines. */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in first", 401);
    if (user.role !== "PROVIDER") return fail("Pros only", 403);

    const profile = await getProviderProfileByUserId(user.id);
    if (!profile) return fail("Finish your pro profile first", 400);

    const { id } = await params;
    const { decision } = respondToRequestSchema.parse(await readJson(request));
    return ok(await respondToRequest(id, profile.id, decision));
  } catch (error) {
    return handleError(error);
  }
}
