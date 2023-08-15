import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import type { Account } from "./accounts/shopify.ts";

const createShopifyClient = ({
  storeName = "gimenesdevstore",
  storefrontAccessToken = "27c1ac16fe30a0fb6c5d634eeb63bf81",
}: Partial<Account> = {}) => {
  return async <T>(
    query: string,
    fragments: string[] = [],
    variables: Record<string, unknown> = {},
  ) => {
    const finalQuery = [query, ...fragments].join("\n");
    const { data, errors } = await fetchAPI<{ data?: T; errors: unknown[] }>(
      `https://${storeName}.myshopify.com/api/2022-10/graphql.json`,
      {
        method: "POST",
        body: JSON.stringify({
          query: finalQuery,
          variables,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
        },
      },
    );

    if (Array.isArray(errors) && errors.length > 0) {
      console.error(Deno.inspect(errors, { depth: 100, colors: true }));

      throw new Error(
        `Error while running query:\n${finalQuery}\n\n${
          JSON.stringify(variables)
        }`,
      );
    }

    return data;
  };
};

let shopifyClient: ReturnType<typeof createShopifyClient> | undefined;

export const getShopifyClient = (config: Partial<Account> = {}) => {
  if (!shopifyClient) {
    shopifyClient = createShopifyClient(config);
  }

  return shopifyClient;
};
