import type { LoaderFunction } from "$live/types.ts";

import { withSegment } from "../commerce/vtex/withSegment.ts";
import { withUser } from "../commerce/vtex/withUser.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";
import { toProduct } from "../commerce/vtex/transform.ts";
import { createClient } from "../commerce/vtex/client.ts";
import type { StateVTEX } from "../commerce/vtex/types.ts";
import type { ProductListingPage } from "../commerce/types.ts";

export interface Props {
  /**
   * @title Items per page
   * @description Number of products per page to display
   * @default 12
   */
  count: number;
}

/**
 * @title Product list loader
 * @description Usefull for shelves and static galleries.
 */
const vtexWishlistLoader: LoaderFunction<
  Props,
  ProductListingPage | null,
  StateVTEX
> = withUser(withSegment(withISFallback(async (
  req,
  ctx,
  props,
) => {
  const { global: { configVTEX }, segment, user } = ctx.state;
  const { count = 12 } = props;
  const url = new URL(req.url);
  const vtex = createClient(configVTEX);

  if (!user) {
    return { data: null };
  }

  const page = Number(url.searchParams.get("page")) || 0;

  const allProductIds = await vtex.wishlist.get({ email: user })
    .then((list) => list.data.viewList.data.map((p) => p.productId));
  const productIds = allProductIds.slice(page * count, (page + 1) * count);

  // search products on VTEX. Feel free to change any of these parameters
  const { products: vtexProducts } = await vtex.search.products({
    query: `product:${productIds.join(";")}`,
    page: 0,
    count: productIds.length,
    sort: "discount:desc",
    segment,
  });

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = vtexProducts.map((p) =>
    toProduct(p!, p!.items[0], 0, { url, priceCurrency: vtex.currency() })
  );

  const nextPage = allProductIds.length > count
    ? `?page=${page + 1}`
    : undefined;
  const previousPage = page > 0 ? `?page=${page - 1}` : undefined;

  return {
    data: {
      "@type": "ProductListingPage",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [{
          "@type": "ListItem",
          name: "Wishlist",
          item: "/wishlist",
          position: 1,
        }],
        numberOfItems: 1,
      },
      filters: [],
      products,
      pageInfo: {
        currentPage: page,
        nextPage: nextPage,
        previousPage: previousPage,
      },
      sortOptions: [],
    },
  };
})));

export default vtexWishlistLoader;
