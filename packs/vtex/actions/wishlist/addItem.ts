import { paths } from "../../utils/paths.ts";
import { parseCookie } from "../../utils/vtexId.ts";
import wishlistLoader from "../../loaders/wishlist.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import type { WishlistItem } from "deco-sites/std/packs/vtex/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

export interface Props {
  productId: string;
  sku: string;
}

const action = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<WishlistItem[]> => {
  const { configVTEX: config } = ctx;
  const { cookie, user } = parseCookie(req.headers, config!.account);

  if (!user) {
    return [];
  }

  await fetchAPI(
    `${paths(config!).api.io._v.private.graphql.v1}`,
    {
      method: "POST",
      body: JSON.stringify({
        operationName: "AddToWishlist",
        variables: {
          name: "Wishlist",
          shopperId: user,
          listItem: props,
        },
        query:
          `mutation AddToWishlist($listItem: ListItemInputType!, $shopperId: String!, $name: String!, $public: Boolean) { addToList(listItem: $listItem, shopperId: $shopperId, name: $name, public: $public) @context(provider: "vtex.wish-list@1.x") }`,
      }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        cookie,
      },
    },
  );

  return wishlistLoader({ count: Infinity }, req, ctx);
};

export default action;
