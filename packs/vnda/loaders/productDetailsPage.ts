import type { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";
import type { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";
import { Context } from "../accounts/vnda.ts";
import { createClient } from "../client.ts";
import { getSEOFromTag, parseSlug, toProduct } from "../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title VNDA - PDP
 * @description Works on routes of type /produto/:slug
 */
async function loader(
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductDetailsPage | null> {
  const url = new URL(req.url);
  const { configVNDA } = ctx;
  const { slug } = props;

  if (!configVNDA || !slug) return null;

  const variantId = url.searchParams.get("skuId") || null;
  const client = createClient(configVNDA);
  const { id } = parseSlug(slug);

  const [maybeProduct, seo] = await Promise.all([
    client.product.get(id),
    client.seo.product(id),
  ]);

  // 404: product not found
  if (!maybeProduct) {
    return null;
  }

  const product = toProduct(maybeProduct, variantId, {
    url,
    priceCurrency: configVNDA.defaultPriceCurrency || "USD",
  });

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
      title: product.name,
      description: product.description || "",
      ...seo?.[0],
    }, req),
  };
}

export default loader;
