import type { LoaderFunction } from "$live/types.ts";

import type { ProductDetailsPage } from "../commerce/types.ts";
import { createClient } from "../commerce/vtex/client.ts";
import type { StateVTEX } from "../commerce/vtex/types.ts";
import { withSegment } from "../commerce/vtex/withSegment.ts";
import loader from "../loaders/vtexLegacyProductDetailsPage.ts";

/**
 * @title VTEX Product Page Loader
 * @description Works on routes of type /:slug/p
 */
const legacyProductPageLoader: LoaderFunction<
  null,
  ProductDetailsPage | null,
  StateVTEX
> = withSegment(async (
  req,
  ctx,
) => {
  const { global: { configVTEX }, segment } = ctx.state;
  const vtex = createClient(configVTEX);

  return {
    data: await loader({
      vtexClient: vtex,
      segment: segment!,
      slug: ctx.params.slug,
      reqUrl: req.url,
    }, {
      reqUrl: req.url,
    }),
  };
});

export default legacyProductPageLoader;
