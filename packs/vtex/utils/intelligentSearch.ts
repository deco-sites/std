import type { Sort } from "deco-sites/std/packs/vtex/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { SelectedFacet } from "deco-sites/std/packs/vtex/types.ts";

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

  return facets
    .map(({ key, value }) => `${key}/${value}`)
    .join("/");
};

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
      hideUnavailableItems ?? ctx.configVTEX!.defaultHideUnnavailableItems ??
        false
    }`,
  });
