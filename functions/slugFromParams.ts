import type { FunctionContext, LoaderFunction } from "$live/types.ts";

export type Slug = string;
export interface Props {
  /**
   * @default slug
   */
  param?: string;
}

/**
 * @title Get slug from request parameters
 * @description Works on routes of type /:slug/
 */
const slugFromRequest: LoaderFunction<
  Props,
  Slug,
  FunctionContext
> = (
  _req,
  ctx,
) => {
  return { data: ctx.params[ctx.state.$live.param ?? "slug"] };
};

export default slugFromRequest;
