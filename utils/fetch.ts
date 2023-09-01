import { HttpError } from "deco-sites/std/utils/HttpError.ts";

export interface FetchOptions {
  withProxyCache?: boolean;
}

export const fetchSafe = async (
  input: string | Request | URL,
  init?: RequestInit & FetchOptions,
) => {
  const response = await fetch(input, init);

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
