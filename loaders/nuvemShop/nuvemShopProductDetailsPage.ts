import { createClient } from "deco-sites/std/commerce/nuvemShop/client.ts";
import { toProduct } from "deco-sites/std/commerce/nuvemShop/transform.ts";
import type { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";
import type { Context } from "deco-sites/std/commerce/nuvemShop/types.ts";
import type { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";

export interface Props {
  slug: RequestURLParam;
}

const loader = async (
  props: Props,
  req: Request,
  ctx: Context,
): Promise<ProductDetailsPage | null> => {
  const { configNuvemShop: config } = ctx;

  const client = createClient(config);

  // parseInt(url.searchParams.get("id")! || props.slug),
  const nuvemProduct = await client?.product.getBySlug(props.slug);

  if (!nuvemProduct) {
    return null;
  }

  const product = toProduct(nuvemProduct, new URL(req.url));

  return {
    "@type": "ProductDetailsPage",
    // TODO: Find out what's the right breadcrumb on nuvem shop
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    product,
  };
};

export default loader;
