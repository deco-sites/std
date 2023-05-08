import {
  pickSku,
  toProductPage,
} from "deco-sites/std/packs/vtex/utils/transform.ts";
import {
  getSegment,
  setSegment,
} from "deco-sites/std/packs/vtex/utils/segment.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import { toSegmentParams } from "deco-sites/std/packs/vtex/utils/legacy.ts";
import type { LegacyProduct } from "deco-sites/std/packs/vtex/types.ts";
import type { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";
import type { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title VTEX product details page - Portal
 * @description Works on routes of type /:slug/p
 */
async function loader(
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductDetailsPage | null> {
  const { configVTEX: config } = ctx;
  const { url: baseUrl } = req;
  const { slug } = props;
  const url = new URL(baseUrl);
  const segment = getSegment(req);
  const params = toSegmentParams(segment);
  const search = paths(config!).api.catalog_system.pub.products.search;
  const skuId = url.searchParams.get("skuId");

  const [product] = await fetchAPI<LegacyProduct[]>(
    `${search.term(`${slug}/p`)}?${params}`,
    { withProxyCache: true },
  );

  // Product not found, return the 404 status code
  if (!product) {
    return null;
  }

  const sku = pickSku(product, skuId?.toString());

  let kitItems: LegacyProduct[] = [];
  if (sku.isKit && sku.kitItems) {
    const p = new URLSearchParams(params);

    sku.kitItems.forEach(({ itemId }) => p.append("fq", `skuId:${itemId}`));

    kitItems = await fetchAPI<LegacyProduct[]>(
      `${search}?${p}`,
      { withProxyCache: true },
    );
  }

  setSegment(segment, ctx.response.headers);

  return toProductPage(product, sku, kitItems, {
    baseUrl,
    priceCurrency: config!.defaultPriceCurrency,
  });
}

export default loader;
