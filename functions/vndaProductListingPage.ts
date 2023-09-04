import { ProductListingPage } from "deco-sites/std/commerce/types.ts";
import { StateVNDA } from "deco-sites/std/packs/vnda/accounts/vnda.ts";
import productListingPageLoader, {
  Props,
} from "deco-sites/std/packs/vnda/loaders/productListingPage.ts";
import type { LoaderFunction } from "deco/types.ts";

const productListingPage: LoaderFunction<
  Props,
  ProductListingPage | null,
  StateVNDA
> = async (req, ctx, props) => {
  const data = await productListingPageLoader(
    { slug: ctx.params.slug, ...props },
    req,
    ctx.state,
  );
  return { data };
};

export default productListingPage;
