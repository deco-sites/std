import type { Image as LiveImage } from "deco-sites/std/components/types.ts";
import type { LoaderReturnType } from "deco/types.ts";
import type { ProductListingPage } from "../../commerce/types.ts";
import Metatags from "./Metatags.tsx";

export interface Props {
  page: LoaderReturnType<ProductListingPage | null>;
  /**
   * @title Title template
   * @description add a %s whenever you want it to be replaced with the product name, category name or search term
   * @default %s | Deco.cx
   */
  titleTemplate?: string;
  /** @title Page Title override */
  title?: string;
  /**
   * @title Description template
   * @description add a %s whenever you want it to be replaced with the product name, category name or search term
   * @default %s | Deco.cx
   */
  descriptionTemplate?: string;
  /** @title Metatag description override */
  description?: string;
  /** @description Recommended: 16 x 16 px */
  favicon?: LiveImage;
}

const SeoPLP = (props: Props) => <Metatags {...props} context={props.page} />;

export default SeoPLP;
