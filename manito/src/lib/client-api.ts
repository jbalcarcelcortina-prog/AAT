/**
 * Thin client-side wrapper around the mock backend.
 *
 * Every route answers with `{ data }` or `{ error, fields }` (see
 * `src/lib/api.ts`), so this normalises both into one result object and the
 * forms never touch `fetch` directly.
 */

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  fields?: Record<string, string>;
}

export async function apiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    const payload = (await response.json().catch(() => ({}))) as {
      data?: T;
      error?: string;
      fields?: Record<string, string>;
    };

    if (!response.ok) {
      return {
        ok: false,
        error: payload.error ?? "Something went wrong. Please try again.",
        fields: payload.fields,
      };
    }
    return { ok: true, data: payload.data };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection." };
  }
}

export function postJson<T>(url: string, body: unknown) {
  return apiRequest<T>(url, { method: "POST", body: JSON.stringify(body) });
}

export function putJson<T>(url: string, body: unknown) {
  return apiRequest<T>(url, { method: "PUT", body: JSON.stringify(body) });
}
