import { createClient } from "deco-sites/std/commerce/nuvemShop/client.ts";
import {
  getBreadCrumbs,
  toProduct,
} from "deco-sites/std/commerce/nuvemShop/transform.ts";
import type { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";
import type { Context } from "deco-sites/std/commerce/nuvemShop/types.ts";
import type { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";

export interface Props {
  slug: RequestURLParam;
}

/** @title NuvemShop - PDP */
const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductDetailsPage | null> => {
  const { configNuvemShop: config } = ctx;
  const client = createClient(config);
  const { url: baseUrl } = req;
  const url = new URL(baseUrl);

  const sku = url.searchParams.get("sku");

  const nuvemProduct = await client?.product.getBySlug(props.slug);

  if (!nuvemProduct) {
    return null;
  }

  const [product] = toProduct(nuvemProduct, new URL(req.url), sku);

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement: getBreadCrumbs(nuvemProduct),
      numberOfItems: nuvemProduct.categories.length + 1,
    },
    product,
  };
};

export default loader;
