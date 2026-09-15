import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { JobError } from "@/lib/jobs";
import { fieldErrors } from "@/lib/validation";

/**
 * Shared shapes for the mock backend.
 *
 * Every route answers with either `{ data }` or
 * `{ error: string, fields?: Record<string, string> }`, so the client only has
 * to learn one contract. `fields` is what the forms render inline.
 */

export interface ApiError {
  error: string;
  fields?: Record<string, string>;
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(message: string, status = 400, fields?: Record<string, string>) {
  return NextResponse.json<ApiError>({ error: message, fields }, { status });
}

/**
 * Turn whatever a route threw into a sensible response. Validation problems
 * become 400s with per-field messages; ownership and lifecycle problems carry
 * the status the service chose; anything else is a 500 and gets logged.
 */
export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return fail("Please check the highlighted fields", 400, fieldErrors(error));
  }
  if (error instanceof JobError) {
    return fail(error.message, error.status);
  }
  console.error("[api]", error);
  return fail("Something went wrong on our end", 500);
}

/** Parse a JSON body without throwing on an empty or malformed one. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
