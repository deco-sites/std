import type {
  NuvemShopSort,
  ProductBaseNuvemShop,
} from "deco-sites/std/commerce/nuvemShop/types.ts";
import { createClient } from "deco-sites/std/commerce/nuvemShop/client.ts";
import { toProduct } from "deco-sites/std/commerce/nuvemShop/transform.ts";
import type { Product } from "deco-sites/std/commerce/types.ts";
import type { Context } from "deco-sites/std/commerce/nuvemShop/types.ts";

export interface Props {
  /** @description query to use on search. if used will break sort */
  term?: string;

  /** @description total number of items to display */
  limit: number;

  /** @description search sort parameter */
  sort?: NuvemShopSort;
}

/** @title NuvemShop - Search Products */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Product[] | null> => {
  const { configNuvemShop: config } = ctx;
  const client = createClient(config);

  let result: ProductBaseNuvemShop[] | undefined;

  try {
    result = await client?.product.search({
      q: props.term || "",
      sort_by: props.sort || "user",
      per_page: props.limit || 10,
    });
  } catch {
    result = [];
  }

  const products = result?.map((product) => {
    return [...toProduct(product, new URL(req.url), null)];
  }).flat();

  return products || [];
};

export default loader;
