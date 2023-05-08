import { HttpError } from "./HttpError.ts";

/**
 * proxy.decocache.com does not vary with the vary header. For this, we must add a stable cache burst
 * key to avoid sharing caches with the same cookies etc
 */
const toProxyCache = async (
  input: string | Request | URL,
  init?: RequestInit,
) => {
  const url = typeof input === "string"
    ? new URL(input)
    : input instanceof Request
    ? new URL(input.url)
    : input;

  const proxyUrl = new URL(`https://proxy.decocache.com/${url.href}`);

  const buffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(
      JSON.stringify([...new Headers(init?.headers).entries()]),
    ),
  );

  const hex = Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  proxyUrl.searchParams.append("_decoProxyCB", hex);

  return proxyUrl;
};

export const fetchSafe: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);

  if (response.ok) {
    return response;
  }

  console.error(`${input}\n`, response, `\n`);
  throw new HttpError(response.status, `${input}`);
};

export const fetchAPI = async <T>(
  input: string | Request | URL,
  init?: RequestInit & { withProxyCache?: boolean },
): Promise<T> => {
  const headers = new Headers(init?.headers);

  headers.set("accept", "application/json");

  const url = init?.withProxyCache ? await toProxyCache(input, init) : input;
  const response = await fetchSafe(url, {
    ...init,
    headers,
  });

  return response.json();
};
