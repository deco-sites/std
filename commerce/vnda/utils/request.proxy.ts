import { ConfigVNDA, Fetcher } from "../types.ts";
import { fetchAPI } from "../../../utils/fetchAPI.ts";

import {
  BASE_URL_PROD,
  BASE_URL_SANDBOX,
  DOMAIN_HEADER,
} from "../constants.ts";

// deno-lint-ignore no-explicit-any
type GenericRequest<T> = (p: Fetcher<any>) => T;
type GenericResult<T> = (params: ConfigVNDA) => T;

export function RequestProxy<T>(request: GenericRequest<T>): GenericResult<T> {
  return (params: ConfigVNDA) => {
    const { domain, authToken, useSandbox } = params;
    const baseUrl = useSandbox ? BASE_URL_SANDBOX : BASE_URL_PROD;

    // deno-lint-ignore no-explicit-any
    const fetcher: Fetcher<any> = (endpoint, method, data) => {
      return fetchAPI(new URL(endpoint, baseUrl).href, {
        body: data ? JSON.stringify(data) : undefined,
        method: method || "GET",
        headers: {
          [DOMAIN_HEADER]: domain,
          accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
    };

    return request(fetcher);
  };
}
