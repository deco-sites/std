import { createClient } from "deco-sites/std/commerce/linxImpulse/client.ts";
import { toProduct } from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import type { Product } from "deco-sites/std/commerce/types.ts";
import type {
  Feature,
  Page,
  PagesRecommendationsResponse,
  Position,
} from "deco-sites/std/packs/linxImpulse/types.ts";

export interface Props {
  /**
   * @title Position
   */
  position: Position;

  /**
   * @title Feature
   * @description The feature "SimilarItems" is only available on product page.
   */
  feature: Feature;

  /**
   * @title Page
   */
  page: Page;
}

/**
 * @title Linx Impulse - Pages Recomendations
 * @description Use it in Shelves
 */
const loader = async (
  props: Props,
  req: Request,
): Promise<Product[] | null> => {
  const { position, feature, page } = props;

  try {
    const linximpulse = createClient();

    const recommendationsResponse = await linximpulse.pages.recommendations(
      page || "other",
    ) as PagesRecommendationsResponse;
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
