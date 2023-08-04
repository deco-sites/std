import type { FunctionContext, LoaderFunction } from "$live/types.ts";
import type { RequestURLParam } from "./requestToParam.ts";

export type ProductID = string;

export interface Props {
  /**
   * @default slug
   * @description Param name to extract from the Request URL
   */
  slug: RequestURLParam;
}

/**
 * @title Extract ID from request parameters
 * @description Set param to slug for routes of type /:slug
 */
const productIdFromVTEXSlug: LoaderFunction<
  Props,
  ProductID,
  FunctionContext
> = (_req, _ctx, { slug }) => {
  return { data: slug.split("-").at(-1) ?? "" };
};

export default productIdFromVTEXSlug;
