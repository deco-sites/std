import type { LoaderFunction } from "$live/types.ts";

import { withSegment } from "../commerce/vtex/withSegment.ts";
import { withUser } from "../commerce/vtex/withUser.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";
import { toProduct } from "../commerce/vtex/transform.ts";
import { createClient } from "../commerce/vtex/client.ts";
import type { StateVTEX } from "../commerce/vtex/types.ts";
import type { Product } from "../commerce/types.ts";

/**
 * @title Product list loader
 * @description Usefull for shelves and static galleries.
 */
const vtexWishlistLoader: LoaderFunction<
  unknown,
  Product[] | null,
  StateVTEX
> = withUser(withSegment(withISFallback(async (
  req,
  ctx,
  _,
) => {
  const { global: { configVTEX }, segment, user } = ctx.state;
  const url = new URL(req.url);
  const vtex = createClient(configVTEX);

  if (!user) {
    return { data: null };
  }

  const list = await vtex.wishlist.get({ email: user });

  const productIds = list.data.viewList.data.map((p) => p.productId);

  // search products on VTEX. Feel free to change any of these parameters
  const { products: vtexProducts } = await vtex.search.products({
    query: `product=${productIds.join(":")}`,
    page: 0,
    count: productIds.length,
    sort: "release:desc",
    segment,
  });

  // O(n^2) computation. Maybe a map would help in here, but I guess the number
  // of products is too small to cause any difference
  const sortedProducts = productIds
    .map((productId) =>
      vtexProducts.find((product) => product.productId === productId)
    )
    .filter(Boolean);

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = sortedProducts.map((p) =>
    toProduct(p!, p!.items[0], 0, { url, priceCurrency: vtex.currency() })
  );

  return {
    data: products,
  };
})));

export default vtexWishlistLoader;
