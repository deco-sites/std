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
  const url = new URL(req.url);
  const { configNuvemShop: config } = ctx;
  // const configNuvemShop = {
  //   userAgent: "My Awsome App (lucis@deco.cx)",
  //   accessToken: "87d04ece2a751e7334994dbd3d135647967dfe11",
  //   storeId: "2734114",
  // };
  console.log(ctx);
  const client = createClient(config);

  const productResult = await client?.product.get(
    parseInt(url.searchParams.get("id")! || props.slug),
  );

  if (!productResult) {
    return null;
  }

  const product = toProduct(productResult);

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
