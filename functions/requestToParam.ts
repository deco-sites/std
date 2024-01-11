import type { FunctionContext, LoaderFunction } from "deco/types.ts";
import type { RequestURLParam } from "https://denopkg.com/deco-cx/apps@8a0b1e23cef3f10071d539d2df70bbaf5c2392df/website/functions/requestToParam.ts";

export type { RequestURLParam };
export interface Props {
  /**
   * @default slug
   * @description Param name to extract from the Request URL
   */
  param: string;
}

/**
 * @title Get params from request parameters
 * @description Set param to slug for routes of type /:slug
 */
const requestToParam: LoaderFunction<
  Props,
  RequestURLParam,
  FunctionContext
> = (_req, ctx) => ({
  data: ctx.params[ctx.state.$live.param || "slug"],
});

export default requestToParam;
