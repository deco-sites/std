import Metatags from "./Metatags.tsx";
import type { LoaderReturnType } from "$live/types.ts";
import type { ProductDetailsPage } from "../../commerce/types.ts";

export interface Props {
  /**
   * @title Title template
   * @description add a %s whenever you want it to be replaced with the product name
   * @default %s | Deco.cx
   */
  titleTemplate?: string;
  /** @title Page title override */
  title?: string;
  /** @title Meta tag description override */
  description?: string;
  page: LoaderReturnType<ProductDetailsPage | null>;
}

const SeoPDP = (props: Props) => <Metatags {...props} context={props.page} />;

export default SeoPDP;
