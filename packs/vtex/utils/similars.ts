import type { Product } from "deco-sites/std/commerce/types.ts";
import type { Context } from "../accounts/vtex.ts";
import type { Props as OriginalProps } from "../loaders/legacy/relatedProductsLoader.ts";

type Props = Pick<OriginalProps, "hideUnavailableItems">;

export const withIsSimilarTo = async (
  ctx: Context,
  product: Product,
  props?: Props,
) => {
  const id = product.isVariantOf?.productGroupID;

  if (!id) {
    return product;
  }

  const isSimilarTo = await ctx.invoke(
    "deco-sites/std/loaders/vtex/legacy/relatedProductsLoader.ts",
    {
      ...props,
      crossSelling: "similars",
      id: product.isVariantOf!.productGroupID,
    },
  );

  return {
    ...product,
    isSimilarTo: isSimilarTo ?? undefined,
  };
};
