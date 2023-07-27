import type { Product } from "deco-sites/std/commerce/types.ts";
import type { ProductID } from "deco-sites/std/functions/productIdFromVTEXSlug.ts";
import type {
  PagesRecommendationsResponse,
  SearchProductsResponse,
  Shelf,
} from "deco-sites/std/packs/linxImpulse/types.ts";

import type { Context } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";
import { paths } from "deco-sites/std/packs/linxImpulse/utils/path.ts";
import {
  toProduct,
  toProductLinxImpulse,
  toRequestHeader,
} from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { HttpError } from "deco-sites/std/utils/HttpError.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";

export interface Props {
  id: ProductID;
  feature: "SimilarItems" | "FrequentlyBoughtTogether";
}

/**
 * @title Linx Impulse - Product SimilarItems
 * @description Use it in Shelves on Product Page
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<Product[] | null> => {
  const { configLinxImpulse: config } = ctx;
  const { id, feature } = props;
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId");
  const requestHeaders = toRequestHeader(config!);
  const linxImpulse = paths(config!);

  try {
    const { products: productsBySlug } = await fetchAPI<SearchProductsResponse>(
      `${linxImpulse.product.getProductBySlug.term(id)}`,
      { headers: requestHeaders },
    );

    const product = productsBySlug.find((product) => {
      return product.skus.some((sku) => sku.sku === skuId);
    });

    if (!product?.id) return null;

    const recommendationsResponse = await fetchAPI<
      PagesRecommendationsResponse
    >(
      `${linxImpulse.product.similarItems.productId(product.id)}`,
      { headers: requestHeaders },
    );

    const checkFeature = (shelf: Shelf) => shelf.feature === feature;
    const topShelfs = recommendationsResponse.top.filter(checkFeature);
    const middleShelfs = recommendationsResponse.middle.filter(checkFeature);
    const bottomShelfs = recommendationsResponse.bottom.filter(checkFeature);
    const shelfs = [...topShelfs, ...middleShelfs, ...bottomShelfs];

    if (!shelfs.length) return null;

    const options = {
      baseUrl: req.url,
    };

    const products = shelfs
      .flatMap((shelf) =>
        shelf.displays[0]?.recommendations.map((productRecommendation) => {
          const product = toProductLinxImpulse(
            productRecommendation,
            productRecommendation.skus[0],
          );
          return toProduct(product, product.skus[0].properties, 0, options);
        })
      );

    return products;
  } catch (err) {
    if (err instanceof HttpError && err.status >= 500) {
      throw err;
    }
    return null;
  }
};

export default loader;
