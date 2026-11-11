import { handleError, ok, readJson } from "@/lib/api";
import { suggestTrade } from "@/lib/suggest-trade";
import { suggestTradeSchema } from "@/lib/validation";

/**
 * POST /api/suggest-trade — { description } → suggested oficio.
 *
 * Public on purpose. The answer depends only on the text, the same way
 * GET /api/providers exposes the matcher without a session, so the form and
 * a curl check can both call it. Nothing here reads or writes a job.
 */
export async function POST(request: Request) {
  try {
    const input = suggestTradeSchema.parse(await readJson(request));
    return ok(suggestTrade(input.description));
  } catch (error) {
    return handleError(error);
  }
}
