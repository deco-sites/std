import { LoaderContext } from "$live/types.ts";
import { ClientVTEX } from "deco-sites/std/commerce/vtex/client.ts";
import {
  pickSku,
  toProductPage,
} from "deco-sites/std/commerce/vtex/transform.ts";
import { Slug } from "deco-sites/std/functions/slugFromParams.ts";
import type { ProductDetailsPage } from "../commerce/types.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import { Segment } from "../commerce/vtex/types.ts";

export interface Props {
  slug: Slug;
  vtexClient: ClientVTEX;
  segment: Partial<Segment>;
}

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
export default async function legacyProductPageLoader(
  { vtexClient: _vtex, segment, slug }: Props,
  req: Request,
  ctx: LoaderContext<{ configVTEX?: ConfigVTEX }>,
): Promise<ProductDetailsPage | null> {
  const vtex = _vtex ?? createClient(ctx?.configVTEX);
  const url = new URL(req.url);
  const skuId = url.searchParams.get("skuId");

  // search products on VTEX. Feel free to change any of these parameters
  const [product] = await vtex.catalog_system.products.search({
    term: `${slug}/p`,
    segment,
  });

  // Product not found, return the 404 status code
  if (!product) {
    return null;
  }

  const sku = pickSku(product, skuId?.toString());

  const kitItems = sku.isKit
    ? await vtex.catalog_system.products.search({
      fq: sku.kitItems!.map((item) => `skuId:${item.itemId}`),
      segment,
    })
    : [];

  return toProductPage(product, sku, kitItems, {
    url,
    priceCurrency: vtex.currency(),
  });
}
