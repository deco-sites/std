import { HttpError } from "./HttpError.ts";

export const fetchAPI = async <T>(
  input: string | Request | URL,
  init?: RequestInit,
): Promise<T> => {
  const headers = new Headers(init?.headers);

  headers.set("accept", "application/json");

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.ok) {
    return response.json();
  }

  console.error(input, response);
  throw new HttpError(response.status, `${input}`);
};
