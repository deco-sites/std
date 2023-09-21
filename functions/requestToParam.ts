import type { FunctionContext, LoaderFunction } from "deco/types.ts";
import type { RequestURLParam } from "https://denopkg.com/deco-cx/apps@0.9.0/website/functions/requestToParam.ts";

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
