import type { Image as LiveImage } from "deco-sites/std/components/types.ts";
import type { LoaderReturnType } from "deco/types.ts";
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
  title?: string;
  /**
   * @title Title template
   * @description add a %s whenever you want it to be replaced with the category name or search term
   * @default %s | Deco.cx
   */
  titleTemplate?: string;
  description?: string;
  /**
   * @title Title template
   * @description add a %s whenever you want it to be replaced with the category name or search term
   * @default %s | Deco.cx
   */
  descriptionTemplate?: string;
  /** @default website */
  type?: OGType;
  /** @description Recommended: 1200 x 630 px (up to 5MB) */
  image?: LiveImage;
  /** @description Recommended: 16 x 16 px */
  favicon?: LiveImage;
  /** @description Suggested color that browsers should use to customize the display of the page or of the surrounding user interface */
  themeColor?: string;
  /** @title Canonical URL */
  canonical?: string;
  /**
   * @title Disable indexing
   * @description In testing, you can use this to prevent search engines from indexing your site
   */
  noIndexNoFollow?: boolean;

  context?:
    | LoaderReturnType<ProductDetailsPage | null>
    | LoaderReturnType<ProductListingPage | null>;
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
