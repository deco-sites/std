import { Product } from "deco-sites/std/commerce/types.ts";
import { default as extend, Props } from "./extension.ts";

/**
 * @title Extend your products
 */
export default function ProductExt(
  props: Props<Product[] | null>,
): Promise<Product[] | null> {
  return extend(props);
}
