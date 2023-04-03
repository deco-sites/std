import { getCookies, setCookie } from "std/http/mod.ts";

import { Segment } from "../types.ts";

const name = "vtex_segment";

/**
 * Stable serialization.
 *
 * This means that even if the attributes are in a different order, the final segment
 * value will be the same. This improves cache hits
 */
const serialize = ({
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

/**
 * I could not find a way to accurately configure cloudflare to vary with cookies
 * For this reason, I add a cache bursting key on the url params
 */
export const getCacheBurstKey = async (segment: Partial<Segment>) => {
  const serial = serialize(segment);

  const buffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(serial),
  );

  const hex = Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hex;
};

export const withSegment = (
  segment: Partial<Segment>,
  headers: Headers = new Headers(),
) => {
  headers.set("cookie", `${name}=${serialize(segment)}`);

  return headers;
};

export const getSegment = (req: Request): Partial<Segment> => {
  const url = new URL(req.url);
  const cookies = getCookies(req.headers);
  const partial = cookies[name] && JSON.parse(atob(cookies[name]));

  return {
    ...partial,
    utmi_campaign: url.searchParams.get("utmi_campaign") ?? null,
    utm_campaign: url.searchParams.get("utm_campaign") ?? null,
    utm_source: url.searchParams.get("utm_source") ?? null,
  };
};

export const setSegment = (
  segment: Partial<Segment>,
  headers: Headers = new Headers(),
): Headers => {
  setCookie(headers, {
    value: serialize(segment),
    name,
    path: "/",
    secure: true,
    httpOnly: true,
  });

  return headers;
};
