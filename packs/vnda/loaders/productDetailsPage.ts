import { createClient } from "../client.ts";
import { getSEOFromTag, toProduct, useVariant } from "../utils/transform.ts";
import type { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";
import { Context } from "../accounts/vnda.ts";

/**
 * @title VNDA Product Page Loader
 * @description Works on routes of type /produto/:slug
 */
const productPageLoader = async (
  _: null,
  req: Request,
  ctx: Context,
): Promise<ProductDetailsPage | null> => {
  const url = new URL(req.url);
  const { configVNDA } = ctx;

  if (!configVNDA) return null;

  const client = createClient(configVNDA);

  const id = url.pathname.split("-").pop()?.trim() ||
    url.searchParams.get("id");

  const [getResult, seo] = await Promise.all([
    client.product.get({
      id: id!,
    }),
    client.seo.product(id!),
  ]);

  if (!getResult) {
    // fix: 404 afunctions
    return null;
  }

  const product = useVariant(
    toProduct(getResult, {
      url,
      priceCurrency: configVNDA.defaultPriceCurrency || "USD",
    }),
    url.searchParams.get("skuId"),
  );

  return {
    "@type": "ProductDetailsPage",
    // TODO: Find out what's the right breadcrumb on vnda
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    product,
    seo: getSEOFromTag({
      title: getResult.name,
      description: product.description || "",
      ...seo?.[0],
    }, req),
  };
};

export default productPageLoader;
