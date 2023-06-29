import Metatags from "./Metatags.tsx";
import type { LoaderReturnType } from "$live/types.ts";
import type { ProductListingPage } from "../../commerce/types.ts";

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
}

const SeoPLP = (props: Props) => <Metatags {...props} context={props.page} />;

export default SeoPLP;
