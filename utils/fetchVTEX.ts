import { FetchOptions } from "./fetch.ts";
import {
  fetchAPI as fetchAPIBase,
  fetchSafe as fetchSafeBase,
} from "./fetch.ts";

const processFetch = async (
  _fetch: (
    input: string | Request | URL,
    init?: RequestInit & FetchOptions,
  ) => ReturnType<typeof fetch>,
  input: string | Request | URL,
  init?: RequestInit & FetchOptions,
) => {
  let url: URL;

  if (typeof input === "string") {
    url = new URL(input);
  } else if (input instanceof URL) {
    url = input;
  } else {
    // is a request... you know what you are doing.
    return await _fetch(input, init);
  }

  if (url.searchParams.has("utm_campaign")) {
    const searchParams = url.searchParams;
    const testParamValues = searchParams.getAll("utm_campaign");
    const updatedTestParamValues = testParamValues.map((paramValue) =>
      paramValue.replace(/\+/g, "").replaceAll(" ", "")
    );
    searchParams.delete("utm_campaign");
    updatedTestParamValues.forEach((updatedValue) =>
      searchParams.append("utm_campaign", updatedValue)
    );
  }
  console.log(url.toString());
  return await _fetch(url.toString(), init);
};

export const fetchSafe = async (
  input: string | Request | URL,
  init?: RequestInit & FetchOptions,
) => {
  return await processFetch(fetchSafeBase, input, init);
};

export const fetchAPI = async <T>(
  input: string | Request | URL,
  init?: RequestInit & FetchOptions,
): Promise<T> => {
  return await processFetch(fetchAPIBase, input, init) as T;
};
