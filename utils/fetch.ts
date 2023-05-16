import { HttpError } from "deco-sites/std/utils/HttpError.ts";
import {
  ExponentialBackoff,
  handleWhen,
  retry,
} from "https://esm.sh/cockatiel@3.1.1?target=es2019";

// this error is thrown by deno deploy when the connection is closed by the server.
// check the discussion at discord: https://discord.com/channels/985687648595243068/1107104244517048320/1107111259813466192
export const CONNECTION_CLOSED_MESSAGE =
  "connection closed before message completed";

const connectionClosedMsg = handleWhen((err) => {
  const isConnectionClosed =
    err?.message?.includes(CONNECTION_CLOSED_MESSAGE) ?? false;
  isConnectionClosed && console.error("retrying...", err);
  return isConnectionClosed;
});

export const retryExceptionOr500 = retry(connectionClosedMsg, {
  maxAttempts: 1,
  backoff: new ExponentialBackoff(),
});

/**
 * fastly.decocache.com does not vary with the vary header. For this, we must add a stable cache burst
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

  const proxyUrl = new URL(`https://fastly.decocache.com/${url.href}`);

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

export interface FetchOptions {
  withProxyCache?: boolean;
}

export const fetchSafe = async (
  input: string | Request | URL,
  init?: RequestInit & FetchOptions,
) => {
  const url = init?.withProxyCache ? await toProxyCache(input, init) : input;

  const response = await retryExceptionOr500.execute(async () =>
    await fetch(url, init)
  );

  if (response.ok) {
    return response;
  }

  console.error(`${input}\n`, response, `\n`);
  throw new HttpError(response.status, `${input}`);
};

export const fetchAPI = async <T>(
  input: string | Request | URL,
  init?: RequestInit & FetchOptions,
): Promise<T> => {
  const headers = new Headers(init?.headers);

  headers.set("accept", "application/json");

  const response = await fetchSafe(input, {
    ...init,
    headers,
  });

  return response.json();
};
