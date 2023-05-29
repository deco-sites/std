import type { LoaderReturnType } from "$live/types.ts";

import ScriptLDJson from "./ScriptLDJson.tsx";
import SEOBase from "./SEOBase.tsx";
import { canonicalFromBreadcrumblist } from "../../utils/seo.ts";
import type { ProductDetailsPage } from "../../commerce/types.ts";

export interface Props {
  page: LoaderReturnType<ProductDetailsPage | null>;
  /**
   * @title Title template
   * @description add a %s whenever you want it to be replaced with the product name
   * @default %s | Deco.cx
   */
  titleTemplate?: string;
  /** @title Page title override */
  title?: string;
  /** @title Meta tag description override */
  description?: string;
  /** @title Use Description Meta Tag from VTEX Catalog */
  useMetaTagFromCatalog?: boolean;
}

function SeoPDP(
  { page, titleTemplate, title, description, useMetaTagFromCatalog }: Props,
) {
  const product = page?.product;
  const breadcrumbList = page?.breadcrumbList;
  const seo = page?.seo;
  const { isVariantOf, ...currentProduct } = product ?? {};

  const t = title ||
    titleTemplate?.replace("%s", seo?.title || product?.name || "") ||
    seo?.title;

  const productDescription = useMetaTagFromCatalog
    ? page?.product.additionalProperty?.find(({ name }) =>
      name === "metaTagDescription"
    )?.value
    : seo?.description;

  const d = description || productDescription;
  const c = seo?.canonical ||
    (breadcrumbList && canonicalFromBreadcrumblist(breadcrumbList));
  const imageUrl = product?.image?.[0]?.url;

  return (
    <>
      <SEOBase title={t} description={d} imageUrl={imageUrl} canonical={c} />
      <ScriptLDJson {...currentProduct} />
      <ScriptLDJson {...breadcrumbList} />
    </>
  );
}

export default SeoPDP;
