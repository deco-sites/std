import type { Product } from "deco-sites/std/commerce/types.ts";
import type { Product as ProductLinxImpulse } from "../../types.ts";

import { toProduct } from "deco-sites/std/packs/linximpulse/utils/transform.ts";
import { createClient } from "deco-sites/std/commerce/linxImpulse/client.ts";

export type Position = "top" | "middle" | "bottom";

export type Feature =
  | "MostPopular"
  | "Offers"
  | "New4You"
  | "Push"
  | "HistoryPersonalized"
  | "SimilarItems";

export type Page =
  | "home"
  | "product"
  | "category"
  | "subcategory"
  | "not_found"
  | "search"
  | "landing_page"
  | "other";

interface Display {
  references: string;
  recommendations: ProductLinxImpulse[];
}

interface Shelf {
  id: string;
  title: string;
  name: string;
  feature: Feature;
  impressionUrl: string;
  displays: Display[];
  context: string;
}

interface PagesRecommendationsResponse {
  top: Shelf[];
  middle: Shelf[];
  bottom: Shelf[];
}

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

  const configLinxImpulse = {
    baseUrl: "https://recs.chaordicsystems.com/v0",
  };

  const linximpulse = createClient(configLinxImpulse);

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
    baseUrl: req.url
  };

  const products = shelfs
    .flatMap((shelf) =>
      shelf.displays[0]?.recommendations.map((product) => toProduct(product, product.skus[0], 0, options))
    );

  return products;
};

export default loader;
