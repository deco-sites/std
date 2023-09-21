import * as fetcher from "https://denopkg.com/deco-cx/apps@0.9.0/utils/fetch.ts";

export interface FetchOptions {
  withProxyCache?: boolean;
}

export const fetchSafe = (
  input: string | Request | URL,
  init?: RequestInit & FetchOptions,
) =>
  fetcher.fetchSafe(input, {
    ...init,
    deco: init?.withProxyCache
      ? {
        cache: "stale-while-revalidate",
      }
      : undefined,
  });

export const fetchAPI = <T>(
  input: string | Request | URL,
  init?: RequestInit & FetchOptions,
): Promise<T> =>
  fetcher.fetchAPI(input, {
    ...init,
    deco: init?.withProxyCache
      ? {
        cache: "stale-while-revalidate",
      }
      : undefined,
  });
