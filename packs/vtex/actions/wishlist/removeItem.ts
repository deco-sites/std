import { paths } from "../../utils/paths.ts";
import { parseCookie } from "../../utils/vtexId.ts";
import { fetchAPI } from "deco-sites/std/utils/fetchVTEX.ts";
import wishlistLoader from "../../loaders/wishlist.ts";
import type { WishlistItem } from "deco-sites/std/packs/vtex/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

export type Props = { id: string };

const action = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<WishlistItem[]> => {
  const { configVTEX: config } = ctx;
  const { cookie, payload } = parseCookie(req.headers, config!.account);
  const user = payload?.sub;
  const { id } = props;

  if (!user) {
    return [];
  }

  await fetchAPI(
    `${paths(config!).api.io._v.private.graphql.v1}`,
    {
      method: "POST",
      body: JSON.stringify({
        operationName: "RemoveFromList",
        variables: {
          name: "Wishlist",
          shopperId: user,
          id,
        },
        query:
          `mutation RemoveFromList($id: ID!, $shopperId: String!, $name: String) { removeFromList(id: $id, shopperId: $shopperId, name: $name) @context(provider: "vtex.wish-list@1.x") }`,
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
