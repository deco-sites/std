import { Segment } from "../types.ts";

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
