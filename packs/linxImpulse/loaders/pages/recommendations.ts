import type { Product } from "deco-sites/std/commerce/types.ts";
import type {
  Feature,
  Page,
  PagesRecommendationsResponse,
  Position,
} from "deco-sites/std/packs/linxImpulse/types.ts";

import {
  toProduct,
  toProductLinxImpulse,
  toRequestHeader,
} from "deco-sites/std/packs/linxImpulse/utils/transform.ts";
import { paths } from "deco-sites/std/packs/linxImpulse/utils/path.ts";
import type { Context } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.server.ts";

export interface Props {
  /**
   * @title Position
   */
  position: Position;

  /**
   * @title Feature
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
  ctx: Context,
): Promise<Product[] | null> => {
  const { configLinxImpulse: config } = ctx;
  const { position, feature, page } = props;

  const linxImpulse = paths(config!);
  const requestHeaders = toRequestHeader(config!);

  const recommendationsResponse = await fetchAPI<PagesRecommendationsResponse>(
    `${
      linxImpulse.pages.recommendations.name(
        page || "other",
      )
    }`,
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
};

export default loader;
