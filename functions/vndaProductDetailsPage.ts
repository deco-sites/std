import productDetailsPageLoader from "deco-sites/std/packs/vnda/loaders/productDetailsPage.ts";
import type { LoaderFunction } from "$live/types.ts";
import { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";
import { StateVNDA } from "deco-sites/std/packs/vnda/accounts/vnda.ts";

const productDetailsPage: LoaderFunction<
  null,
  ProductDetailsPage | null,
  StateVNDA
> = async (req, ctx) => {
  const data = await productDetailsPageLoader(null, req, ctx.state);
  return { data };
};

export default productDetailsPage;
