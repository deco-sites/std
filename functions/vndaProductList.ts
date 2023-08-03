import productListLoader, {
  Props,
} from "deco-sites/std/packs/vnda/loaders/productList.ts";
import type { LoaderFunction } from "$live/types.ts";
import { Product } from "deco-sites/std/commerce/types.ts";
import { StateVNDA } from "deco-sites/std/packs/vnda/accounts/vnda.ts";

const productList: LoaderFunction<
  Props,
  Product[] | null,
  StateVNDA
> = async (req, ctx, props) => {
  const data = await productListLoader(props, req, ctx.state);
  return { data };
};

export default productList;
