import type { Product } from "deco-sites/std/commerce/types.ts";
import type { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";
import type {
  PagesRecommendationsResponse,
  Position,
  SearchProductsResponse,
} from "deco-sites/std/packs/linxImpulse/types.ts";

import {
  toProduct,
  toProductLinxImpulse,
  toRequestHeader,
} from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { paths } from "deco-sites/std/packs/linxImpulse/utils/path.ts";
import type { Context } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.server.ts";
import { HttpError } from "deco-sites/std/utils/HttpError.ts";

export interface Props {
  slug: RequestURLParam;

  /**
   * @title Position
   */
  position: Position;

  /**
   * @title Feature
   */
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
  const { slug, position, feature } = props;
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId");
  const requestHeaders = toRequestHeader(config!);

  try {
    const linxImpulse = paths(config!);
    const productSlug = slug.replaceAll("-", " ");
    const { products: productsBySlug } = await fetchAPI<SearchProductsResponse>(
      `${linxImpulse.product.getProductBySlug.term(productSlug)}`,
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
    let shelfs;

    if (position) {
      shelfs = recommendationsResponse[position];
    }

    if (feature) {
      shelfs = shelfs?.filter((shelf) => shelf.feature === feature);
    }

    if (!shelfs) return null;

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
          return toProduct(product, product.skus[0], 0, options);
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
