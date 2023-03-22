import { ConfigVNDA, Fetcher, VNDARequest } from "../types.ts";
import { fetchAPI } from "../../../utils/fetchAPI.ts";

import {
  BASE_URL_PROD,
  BASE_URL_SANDBOX,
  DOMAIN_HEADER,
} from "../constants.ts";

export const RequestProxy = (request: VNDARequest) => {
  return (params: ConfigVNDA) => {
    const { domain, authToken, useSandbox } = params;
    const baseUrl = useSandbox ? BASE_URL_SANDBOX : BASE_URL_PROD;

    const fetcher: Fetcher = (endpoint, method, data) => {
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
};
