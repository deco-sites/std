import { getCookies, setCookie } from "std/http/mod.ts";
import type { Segment } from "deco-sites/std/packs/vtex/types.ts";

export const SEGMENT_COOKIE_NAME = "vtex_segment";

/**
 * Stable serialization.
 *
 * This means that even if the attributes are in a different order, the final segment
 * value will be the same. This improves cache hits
 */
export const serialize = ({
  campaigns,
  channel,
  priceTables,
  regionId,
  utm_campaign,
  utm_source,
  utmi_campaign,
  currencyCode,
  currencySymbol,
  countryCode,
  cultureInfo,
  channelPrivacy,
}: Partial<Segment>) =>
  btoa(JSON.stringify({
    campaigns,
    channel,
    priceTables,
    regionId,
    utm_campaign,
    utm_source,
    utmi_campaign,
    currencyCode,
    currencySymbol,
    countryCode,
    cultureInfo,
    channelPrivacy,
  }));

export const parse = (cookie: string) => JSON.parse(atob(cookie));

export const getSegment = (req: Request): Partial<Segment> => {
  const url = new URL(req.url);
  const cookies = getCookies(req.headers);
  const cookie = cookies[SEGMENT_COOKIE_NAME];
  const partial = cookie && parse(cookie);

  return {
    ...partial,
    utmi_campaign: url.searchParams.get("utmi_campaign") ??
      partial?.utmi_campaign ?? null,
    utm_campaign: url.searchParams.get("utm_campaign") ??
      partial?.utm_campaign ?? null,
    utm_source: url.searchParams.get("utm_source") ?? partial?.utm_source ??
      null,
  };
};

export const setSegment = (
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

export const withSegmentCookie = (
  segment: Partial<Segment>,
  headers?: Headers,
) => {
  const h = new Headers(headers);

  h.set("cookie", `${SEGMENT_COOKIE_NAME}=${serialize(segment)}`);

  return h;
};
