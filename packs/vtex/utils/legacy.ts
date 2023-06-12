import { fetchAPI } from "deco-sites/std/utils/fetchVTEX.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import { slugify } from "deco-sites/std/packs/vtex/utils/slugify.ts";
import type { Segment } from "deco-sites/std/packs/vtex/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type { PageType } from "deco-sites/std/packs/vtex/types.ts";
import type { Seo } from "deco-sites/std/commerce/types.ts";

export const toSegmentParams = (segment: Partial<Segment>) => {
  const params = new URLSearchParams();

  if (segment?.utm_campaign) {
    params.set("utm_campaign", segment.utm_campaign);
  }
  if (segment?.utm_source) {
    params.set("utm_source", segment.utm_source);
  }
  if (segment?.utmi_campaign) {
    params.set("utmi_campaign", segment.utmi_campaign);
  }

  return params;
};

const PAGE_TYPE_TO_MAP_PARAM = {
  Brand: "b",
  Category: "c",
  Department: "c",
  SubCategory: "c",
  Collection: "productClusterIds",
  Cluster: "productClusterIds",
  Search: "ft",
  FullText: null,
  Product: "p",
  NotFound: null,
};

const segmentsFromTerm = (term: string) => term.split("/").filter(Boolean);

export const pageTypesFromPathname = async (
  term: string,
  ctx: Context,
) => {
  const segments = segmentsFromTerm(term);
  const vtex = paths(ctx.configVTEX!);

  const results = await Promise.all(
    segments.map((_, index) =>
      fetchAPI<PageType>(
        vtex.api.catalog_system.pub.portal.pagetype.term(
          segments.slice(0, index + 1).join("/"),
        ),
        { withProxyCache: true },
      )
    ),
  );

  return results.filter((result) => PAGE_TYPE_TO_MAP_PARAM[result.pageType]);
};

export const getMapAndTerm = (
  pageTypes: PageType[],
) => {
  const term = pageTypes
    .map((type, index) =>
      type.url
        ? segmentsFromTerm(
          new URL(`http://${type.url}`).pathname,
        )[index]
        : null
    )
    .filter(Boolean)
    .join("/");

  const map = pageTypes
    .map((type) => PAGE_TYPE_TO_MAP_PARAM[type.pageType])
    .filter(Boolean)
    .join(",");

  return [map, term];
};

export const pageTypesToBreadcrumbList = (
  pages: PageType[],
  baseUrl: string,
) => {
  const filteredPages = pages
    .filter(({ pageType }) =>
      pageType === "Category" || pageType === "Department" ||
      pageType === "SubCategory"
    );

  return filteredPages.map((page, index) => {
    const position = index + 1;
    const slug = filteredPages.slice(0, position).map((x) => slugify(x.name!));

    return ({
      "@type": "ListItem" as const,
      name: page.name!,
      item: new URL(`/${slug.join("/")}`, baseUrl).href,
      position,
    });
  });
};

export const pageTypesToSeo = (pages: PageType[], req: Request): Seo | null => {
  const current = pages.at(-1);

  if (!current) {
    return null;
  }

  const [_, pathname] = current.url?.split(".vtexcommercestable.com.br") ?? [];

  return {
    title: current.title!,
    description: current.metaTagDescription!,
    canonical: new URL(pathname, req.url).href,
  };
};
