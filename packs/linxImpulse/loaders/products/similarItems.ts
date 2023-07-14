import type { Product } from "deco-sites/std/commerce/types.ts";
import type {
  PagesRecommendationsResponse,
  Position,
  SearchProductsResponse,
} from "deco-sites/std/packs/linxImpulse/types.ts";

import { toProduct } from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { createClient } from "deco-sites/std/commerce/linxImpulse/client.ts";

export interface Props {
  /**
   * @title Product ID
   * @description overides the slug
   */
  productId?: string;

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
): Promise<Product[] | null> => {
  const { position, productId: productIdByLoader } = props;
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId");

  try {
    const linximpulse = createClient();

    const productSlug = url.pathname.split("/")[1].replaceAll("-", " ");
    const { products: productsBySlug } = await linximpulse.product
      .getProductBySlug(productSlug) as SearchProductsResponse;
    const product = productsBySlug.find((product) => {
      return product.skus.some((sku) => sku.sku === skuId);
    });

    const productId = product?.id ?? productIdByLoader;
    if (!productId) return null;

    const recommendationsResponse = await linximpulse.product.similarItems(
      productId,
    ) as PagesRecommendationsResponse;
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
