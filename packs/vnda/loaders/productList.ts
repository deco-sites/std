import type { Product } from "deco-sites/std/commerce/types.ts";
import { Context } from "../accounts/vnda.ts";
import { createClient } from "../client.ts";
import { toProduct } from "../utils/transform.ts";

export interface Props {
  /** @description total number of items to display */
  count: number;

  /** @description query to use on search */
  term?: string;

  /** @description search for term anywhere */
  wildcard?: boolean;

  /** @description search sort parameter */
  sort?: "newest" | "oldest" | "lowest_price" | "highest_price";

  /** @description search for products that have certain tag */
  tags?: string[];
}

/**
 * @title VNDA - Search Products
 * @description Use it in Shelves and static Galleries.
 */
const productListLoader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Product[] | null> => {
  const url = new URL(req.url);
  const { configVNDA } = ctx;

  if (!configVNDA) return null;

  const client = createClient(configVNDA);

  const search = await client.product.search({
    term: props?.term,
    wildcard: props?.wildcard,
    sort: props?.sort,
    per_page: props?.count,
    tags: props?.tags,
  });

  return search.results.map((product) =>
    toProduct(product, null, {
      url,
      priceCurrency: configVNDA.defaultPriceCurrency || "USD",
    })
  );
};

export default productListLoader;
