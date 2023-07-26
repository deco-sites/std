import type { FunctionContext, LoaderFunction } from "$live/types.ts";

export type ExtractIDFromParam = string;

export interface Props {
  /**
   * @default slug
   * @description Param name to extract from the Request URL
   */
  param: string;
}

/**
 * @title Extract ID from request parameters
 * @description Set param to slug for routes of type /:slug
 */
const extractIdFromParam: LoaderFunction<
  Props,
  ExtractIDFromParam,
  FunctionContext
> = (_req, ctx) => ({
  data: ctx.params[ctx.state.$live.param || "slug"],
});

export default extractIdFromParam;
