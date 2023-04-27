import type { FunctionContext, LoaderFunction } from "$live/types.ts";

export type ReqUrl = string;
const reqUrl: LoaderFunction<
  null,
  ReqUrl,
  FunctionContext
> = (
  req,
  _ctx,
) => {
  return { data: req.url };
};

export default reqUrl;
