import loader from "deco-sites/std/packs/vtex/loaders/legacy/relatedProductsLoader.ts";
import type { LoaderFunction } from "deco/types.ts";
import type { Product } from "../commerce/types.ts";
import type {
  CrossSellingType,
  StateVTEX,
} from "deco-sites/std/packs/vtex/types.ts";

export interface Props {
  /**
   * @title Related Products
   * @description VTEX Cross Selling API. This loader only works on routes of type /:slug/p
   */
  crossSelling: CrossSellingType;
  /**
   * @description: number of related products
   */
  count?: number;
}

/**
 * @title VTEX Catalog - Related Products (deprecated)
 * @description Works on routes of type /:slug/p
 * @deprecated
 */
// @ts-ignore this should work.
const loaderV0: LoaderFunction<
  Props,
  Product[] | null,
  StateVTEX
> = async (
  req,
  ctx,
  { crossSelling, count },
) => {
  const data = await loader(
    {
      slug: ctx.params.slug,
      crossSelling,
      count,
    },
    req,
    ctx.state,
  );

  return { data, status: data ? 200 : 404 };
};

export default loaderV0;
