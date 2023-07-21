import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { SelectedFacet, Sort } from "deco-sites/std/packs/vtex/types.ts";
import { getCookies, setCookie } from "std/http/mod.ts";

export const SESSION_COOKIE = "vtex_is_session";
export const ANONYMOUS_COOKIE = "vtex_is_anonymous";

const POLICY_KEY = "trade-policy";
const REGION_KEY = "region-id";
const CHANNEL_KEYS = new Set([POLICY_KEY, REGION_KEY]);

export const withDefaultFacets = (
  allFacets: readonly SelectedFacet[],
  ctx: Context,
) => {
  const { configVTEX } = ctx;
  const { defaultSalesChannel, defaultRegionId } = configVTEX!;
  const facets = allFacets.filter(({ key }) => !CHANNEL_KEYS.has(key));

  const policyFacet = allFacets.find(({ key }) => key === POLICY_KEY) ??
    { key: POLICY_KEY, value: defaultSalesChannel ?? "" };

  const regionFacet = allFacets.find(({ key }) => key === REGION_KEY) ??
    { key: REGION_KEY, value: defaultRegionId ?? "" };

  if (policyFacet !== null) {
    facets.push(policyFacet);
  }

  if (regionFacet !== null) {
    facets.push(regionFacet);
  }

  return facets;
};

export const toPath = (facets: SelectedFacet[]) =>
  facets.map(({ key, value }) => `${key}/${value}`).join("/");

interface Params {
  query: string;
  page: number;
  count: number;
  sort: Sort;
  fuzzy: string;
  locale: string;
  hideUnavailableItems: boolean;
}

export const withDefaultParams = ({
  query = "",
  page = 0,
  count = 12,
  sort = "",
  fuzzy = "auto",
  locale,
  hideUnavailableItems,
}: Partial<Params>, ctx: Context) =>
  new URLSearchParams({
    page: `${page + 1}`,
    count: `${count}`,
    query,
    sort,
    fuzzy,
    locale: locale ?? ctx.configVTEX!.defaultLocale,
    hideUnavailableItems: `${
      hideUnavailableItems ?? ctx.configVTEX!.defaultHideUnavailableItems ??
        false
    }`,
  });

export const getOrSetISCookie = (req: Request, headers: Headers) => {
  const cookies = getCookies(req.headers);

  let anonymous = cookies[ANONYMOUS_COOKIE];
  let session = cookies[SESSION_COOKIE];

  if (!anonymous) {
    anonymous = crypto.randomUUID();

    setCookie(headers, {
      value: anonymous,
      name: ANONYMOUS_COOKIE,
      path: "/",
      secure: true,
      httpOnly: true,
      maxAge: 365 * 24 * 3600,
    });
  }

  if (!session) {
    session = crypto.randomUUID();

    setCookie(headers, {
      value: session,
      name: SESSION_COOKIE,
      path: "/",
      secure: true,
      httpOnly: true,
      maxAge: 30 * 60,
    });
  }

  return {
    anonymous,
    session,
  };
};
