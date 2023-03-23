import type { LiveState } from "$live/types.ts";
import type { LoaderFunction } from "$live/types.ts";
import { ConfigVNDA } from "../commerce/vnda/types.ts";
import { createClient } from "../commerce/vnda/client.ts";
import { toProduct, useVariant } from "../commerce/vnda/transform.ts";
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
  try {
    const url = new URL(req.url);
    const { configVNDA } = ctx.state.global;
    const client = createClient(configVNDA);

    const getResult = await client.product.get({
      id: url.searchParams.get("id")!,
    });

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
  } catch (error) {
    console.error(error);

    return {
      data: null,
      status: 404,
    };
  }
};

export default productPageLoader;
