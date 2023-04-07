import { LoaderFunction } from "$live/types.ts";
import { getCookies, setCookie } from "std/http/mod.ts";

import { parse, SEGMENT_COOKIE_NAME, serialize } from "./utils/segment.ts";
import type { Segment, StateVTEX } from "./types.ts";

const getSegment = (req: Request): Partial<Segment> => {
  const url = new URL(req.url);
  const cookies = getCookies(req.headers);
  const cookie = cookies[SEGMENT_COOKIE_NAME];
  const partial = cookie && parse(cookie);

  return {
    ...partial,
    utmi_campaign: url.searchParams.get("utmi_campaign") ?? null,
    utm_campaign: url.searchParams.get("utm_campaign") ?? null,
    utm_source: url.searchParams.get("utm_source") ?? null,
  };
};

const setSegment = (
  segment: Partial<Segment>,
  headers: Headers = new Headers(),
): Headers => {
  setCookie(headers, {
    value: serialize(segment),
    name: SEGMENT_COOKIE_NAME,
    path: "/",
    secure: true,
    httpOnly: true,
  });

  return headers;
};

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
