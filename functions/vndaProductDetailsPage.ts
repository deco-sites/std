import { Account as ConfigVNDA } from "../packs/vnda/accounts/vnda.ts";
import { createClient } from "../commerce/vnda/client.ts";
import { toProduct, useVariant } from "../commerce/vnda/transform.ts";
import type { LiveState } from "$live/types.ts";
import type { LoaderFunction } from "$live/types.ts";
import type { ProductDetailsPage } from "../commerce/types.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const productPageLoader: LoaderFunction<
  null,
  ProductDetailsPage | null,
  LiveState<{ configVNDA: ConfigVNDA }>
> = async (req, ctx) => {
  const url = new URL(req.url);
  const { configVNDA } = ctx.state.global;
  const client = createClient(configVNDA);

  const getResult = await client.product.get({
    id: url.searchParams.get("id")!,
  });

  if (!getResult) {
    return {
      data: null,
      status: 404,
    };
  }

  const product = useVariant(
    toProduct(getResult, {
      url,
      priceCurrency: configVNDA.defaultPriceCurrency || "USD",
    }),
    url.searchParams.get("skuId"),
  );

  return {
    data: {
      "@type": "ProductDetailsPage",
      // TODO: Find out what's the right breadcrumb on vnda
      breadcrumbList: {
        "@type": "BreadcrumbList",
        itemListElement: [],
        numberOfItems: 0,
      },
      product,
    },
  };
};

export default productPageLoader;
