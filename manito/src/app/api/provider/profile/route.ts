import { fail, handleError, ok, readJson } from "@/lib/api";
import {
  getProviderProfileByUserId,
  upsertProviderProfile,
} from "@/lib/providers";
import { getCurrentUser } from "@/lib/session";
import { providerProfileSchema } from "@/lib/validation";

/** GET /api/provider/profile — the signed-in pro's own profile. */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in first", 401);
    if (user.role !== "PROVIDER") return fail("Pros only", 403);

    return ok(await getProviderProfileByUserId(user.id));
  } catch (error) {
    return handleError(error);
  }
}

/** PUT /api/provider/profile — create or replace it. */
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail("Sign in first", 401);
    if (user.role !== "PROVIDER") return fail("Pros only", 403);

    const input = providerProfileSchema.parse(await readJson(request));
    return ok(await upsertProviderProfile(user.id, input));
  } catch (error) {
    return handleError(error);
  }
}
