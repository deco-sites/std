import { Image as LiveImage } from "deco-sites/std/components/types.ts";
import type { LoaderReturnType } from "$live/types.ts";
import type {
  ProductDetailsPage,
  ProductListingPage,
} from "../../commerce/types.ts";

export type OGType = "website" | "article";

export interface Dimensions {
  width: number;
  height: number;
}

export interface Props {
  title: string;
  /**
   * @title Product title template
   * @description add a %s whenever you want it to be replaced with the product name
   * @default %s | Deco.cx
   */
  pdpTitleTemplate: string;
  /**
   * @title Product listing title template
   * @description add a %s whenever you want it to be replaced with the category name or search term
   * @default %s | Deco.cx
   */
  plpTitleTemplate: string;
  description: string;
  /** @default website */
  type: OGType;
  /** @description Recommended: 1200 x 630 px (up to 5MB) */
  image: LiveImage;
  /** @description Recommended: 16 x 16 px */
  favicon: LiveImage;
  /** @description Suggested color that browsers should use to customize the display of the page or of the surrounding user interface */
  themeColor: string;
  /** @title Canonical URL */
  canonical?: string;
  pdp: LoaderReturnType<ProductDetailsPage | null>;
  plp: LoaderReturnType<ProductListingPage | null>;
}

export interface PreviewProps {
  props: Props;
  dimensions: Dimensions;
  path: string;
}

export interface PreviewItens {
  title: string;
  description: string;
  image: LiveImage;
  type: OGType;
  themeColor: string;
  width: number;
  height: number;
  path: string;
}
