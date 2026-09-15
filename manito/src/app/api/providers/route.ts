import { handleError, ok } from "@/lib/api";
import { findMatches } from "@/lib/matching";
import { getCandidateProviders } from "@/lib/providers";
import { SERVICE_AREA_VALUES, SERVICE_CATEGORY_VALUES } from "@/lib/constants";

/**
 * GET /api/providers?category=PLUMBING&area=ROMA
 *
 * A public read of the same matcher the consumer flow uses, handy for
 * debugging the ranking without posting a job. Omitting `area` returns every
 * pro in the trade, unranked by location.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category") ?? "";
    const area = url.searchParams.get("area");

    if (!(SERVICE_CATEGORY_VALUES as readonly string[]).includes(category)) {
      return ok({ direct: [], nearby: [] });
    }

    const pool = await getCandidateProviders(category);
    if (!area || !(SERVICE_AREA_VALUES as readonly string[]).includes(area)) {
      return ok({ direct: [], nearby: [], pool });
    }

    return ok(findMatches({ category, area }, pool));
  } catch (error) {
    return handleError(error);
  }
}
