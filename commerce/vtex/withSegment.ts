import { LoaderFunction } from "$live/types.ts";

import { getSegment, setSegment } from "./utils/segment.ts";
import type { StateVTEX } from "./types.ts";

export const withSegment = <Props, Data>(
  loader: LoaderFunction<Props, Data, StateVTEX>,
): LoaderFunction<Props, Data | null, StateVTEX> =>
async (req, ctx, props) => {
  ctx.state = {
    ...ctx.state,
    segment: getSegment(req),
  };

  const response = await loader(req, ctx, props);

  if (ctx.state.segment) {
    setSegment(ctx.state.segment, response.headers);
  }

  return response;
};
