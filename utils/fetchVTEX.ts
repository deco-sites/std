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

  const QS_TO_REMOVE_PLUS = ["utm_campaign"];

  QS_TO_REMOVE_PLUS.forEach((qsToSanatize) => {
    if (url.searchParams.has(qsToSanatize)) {
      const searchParams = url.searchParams;
      const testParamValues = searchParams.getAll(qsToSanatize);
      const updatedTestParamValues = testParamValues.map((paramValue) =>
        paramValue.replace(/\+/g, "").replaceAll(" ", "")
      );
      searchParams.delete(qsToSanatize);
      updatedTestParamValues.forEach((updatedValue) =>
        searchParams.append(qsToSanatize, updatedValue)
      );
    }
  });

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
