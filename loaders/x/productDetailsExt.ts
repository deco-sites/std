import { ProductDetailsPage } from "../../commerce/types.ts";
import { default as extend, Props } from "./extension.ts";

/**
 * @title Extend your products
 */
export default function ProductExt(
  props: Props<ProductDetailsPage | null>,
): Promise<ProductDetailsPage | null> {
  return extend(props);
}
