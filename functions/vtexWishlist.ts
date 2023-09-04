import productsLoader from "deco-sites/std/packs/vtex/loaders/intelligentSearch/productListingPage.ts";
import wishlistLoader from "deco-sites/std/packs/vtex/loaders/wishlist.ts";
import type { StateVTEX } from "deco-sites/std/packs/vtex/types.ts";
import type { LoaderFunction } from "deco/types.ts";
import type { ProductListingPage } from "../commerce/types.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";

export interface Props {
  /**
   * @title Items per page
   * @description Number of products per page to display
   * @default 12
   */
  count: number;
}

/**
 * @title VTEX - Load Wishlist
 * @description Used with vtex.wish-list app
 * @deprecated true
 */
const loaderV0: LoaderFunction<
  Props,
  ProductListingPage | null,
  StateVTEX
> = withISFallback(async (
  req,
  ctx,
  props,
) => {
  const data = await wishlistLoader(
    props,
    req,
    ctx.state,
  );

  return {
    data: await productsLoader(
      {
        query: `product:${data.map((p) => p.productId).join(";")}`,
        count: props.count,
      },
      req,
      ctx.state,
    ),
  };
});

export default loaderV0;
