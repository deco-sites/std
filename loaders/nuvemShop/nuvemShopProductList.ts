import type { NuvemShopSort } from "deco-sites/std/commerce/nuvemShop/types.ts";
import { createClient } from "deco-sites/std/commerce/nuvemShop/client.ts";
import { toProduct } from "deco-sites/std/commerce/nuvemShop/transform.ts";
import type { Product } from "deco-sites/std/commerce/types.ts";
// import type { Context } from "deco-sites/std/commerce/nuvemShop/types.ts";

export interface Props {
  /** @description query to use on search */
  term?: string;

  /** @description total number of items to display */
  limit: number;

  /** @description search sort parameter */
  sort?: NuvemShopSort;

  // /** @description categiory id parameter */
  // categoryId?: number;
}

const loader = async (
  props: Props,
  req: Request,
  // ctx: Context,
): Promise<Product[] | null> => {
  // const { configNuvemShop: config } = ctx;
  const configNuvemShop = {
    userAgent: "My Awsome App (lucis@deco.cx)",
    accessToken: "87d04ece2a751e7334994dbd3d135647967dfe11",
    storeId: "2734114",
  };
  const client = createClient(configNuvemShop);

  const result = await client?.product.search({
    q: props.term || "",
    sort: props.sort || "user",
    per_page: props.limit || 10,
  });

  const products = result?.map((product) => {
    return toProduct(product, new URL(req.url));
  });

  console.log({ products: products?.length });

  return products || [];
};

export default loader;
