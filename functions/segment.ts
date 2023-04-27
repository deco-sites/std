import type { LoaderFunction } from "$live/types.ts";

import { Segment, StateVTEX } from "../commerce/vtex/types.ts";
import { getSegment } from "../commerce/vtex/withSegment.ts";

/**
 * @title Read the segment.
 */
const segment: LoaderFunction<
  null,
  Partial<Segment>,
  StateVTEX
> = (
  req,
  _ctx,
) => {
  return { data: getSegment(req) };
};

export default segment;
