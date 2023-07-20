import type { Product } from "deco-sites/std/commerce/types.ts";
import type {
  PagesRecommendationsResponse,
  Position,
  SearchProductsResponse,
} from "deco-sites/std/packs/linxImpulse/types.ts";

import { toProduct } from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { paths } from "deco-sites/std/packs/linxImpulse/utils/path.ts";
import type { Context } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";

export interface Props {
  /**
   * @title Position
   */
  position: Position;
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
  const { position } = props;
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId");

  //temp while we don't have "secretKey"
  const requestHeaders = {
    origin: config?.url ?? "",
    referer: config?.url ?? "",
  };

  try {
    const linxImpulse = paths(config!);
    const productSlug = url.pathname.split("/")[1].replaceAll("-", " ");
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
      `${linxImpulse.product.similarItems.productId(productSlug)}`,
      { headers: requestHeaders },
    );
    let shelfs;

    if (position) {
      shelfs = recommendationsResponse[position];
    }

    shelfs = shelfs?.filter((shelf) => shelf.feature === "SimilarItems");

    if (!shelfs) return null;

    const options = {
      baseUrl: req.url,
    };

    const products = shelfs
      .flatMap((shelf) =>
        shelf.displays[0]?.recommendations.map((product) =>
          toProduct(product, product.skus[0], 0, options)
        )
      );

    return products;
  } catch {
    return null;
  }
};

export default loader;
