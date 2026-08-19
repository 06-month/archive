const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** False when the env vars are missing, so the UI can hide itself instead of erroring. */
export const supabaseEnabled = Boolean(url && key);

/** Thin PostgREST caller. `path` is everything after /rest/v1/, e.g. `comments?slug=eq.foo`. */
export async function sb<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key as string,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  }

  return res.status === 204 ? (null as T) : ((await res.json()) as T);
}
