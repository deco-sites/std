import type { LiveState } from "$live/types.ts";
import type { Product } from "../commerce/types.ts";
import type { LoaderFunction } from "$live/types.ts";
import { ConfigVNDA } from "../commerce/vnda/types.ts";
import { createClient } from "../commerce/vnda/client.ts";
import { toProduct } from "../commerce/vnda/transform.ts";

export interface Props {
  /** @description total number of items to display */
  limit: number;

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
 * @title Product list loader
 * @description Usefull for shelves and static galleries.
 */
const productListLoader: LoaderFunction<
  Props,
  Product[] | null,
  LiveState<{ configVNDA: ConfigVNDA }>
> = async (req, ctx, props) => {
  const url = new URL(req.url);
  const { configVNDA } = ctx.state.global;
  const client = createClient(configVNDA);

  const search = await client.product.search({
    term: props?.term,
    wildcard: props?.wildcard,
    sort: props?.sort,
    per_page: props?.limit,
    tags: props?.tags,
  });

  const products = search.results.map((product) => {
    return toProduct(product, {
      url,
      priceCurrency: configVNDA.defaultPriceCurrency || "USD",
    });
  });

  return {
    data: products,
  };
};

export default productListLoader;
