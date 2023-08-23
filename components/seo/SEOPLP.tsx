import type { LoaderReturnType } from "$live/types.ts";
import type { Image as LiveImage } from "deco-sites/std/components/types.ts";
import type { ProductListingPage } from "../../commerce/types.ts";
import Metatags from "./Metatags.tsx";

export interface Props {
  page: LoaderReturnType<ProductListingPage | null>;
  /**
   * @title Title template
   * @description add a %s whenever you want it to be replaced with the product name
   * @default %s | Deco.cx
   */
  titleTemplate?: string;
  /** @title Page Title override */
  title?: string;
  /** @title Metatag description override */
  description?: string;
  /** @description Recommended: 16 x 16 px */
  favicon?: LiveImage;
}
export const loader = (
  props: Props,
  req: Request,
): Props & { url: string } => {
  return { ...props, url: req.url };
};

const SeoPLP = (props: Props & { url: string }) => (
  <Metatags {...props} context={props.page} />
);

export default SeoPLP;
