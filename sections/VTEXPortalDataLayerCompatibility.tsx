import {
  ProductSKUJson,
  ProductSKUJsonProps as Props,
} from "deco-sites/std/components/VTEXPortalDataLayerCompatibility.tsx";
import type { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";
import { paths } from "deco-sites/std/packs/vtex/utils/paths.ts";
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { getSegment } from "deco-sites/std/packs/vtex/utils/segment.ts";
import { toSegmentParams } from "deco-sites/std/packs/vtex/utils/legacy.ts";
import { fetchAPI } from "deco-sites/std/utils/fetchVTEX.ts";
import type { LegacyProduct } from "deco-sites/std/packs/vtex/types.ts";
import { withSegmentCookie } from "deco-sites/std/packs/vtex/utils/segment.ts";

/**
 * @description Useful if any analytics uses de skuJson from VTEX.
 */
export default function VTEXPortalDataLayerCompatibility({ product }: Props) {
  return <ProductSKUJson product={product} />;
}

export interface LoaderProps {
  slug: RequestURLParam;
}

export async function loader(props: LoaderProps, req: Request, ctx: Context) {
  const { configVTEX: config } = ctx;
  const { slug } = props;
  const segment = getSegment(req);
  const params = toSegmentParams(segment);
  const search = paths(config!).api.catalog_system.pub.products.search;

  const [product] = await fetchAPI<LegacyProduct[]>(
    `${search.term(`${slug}/p`)}?${params}`,
    {
      withProxyCache: true,
      headers: withSegmentCookie(segment),
    },
  );

  return { product };
}
