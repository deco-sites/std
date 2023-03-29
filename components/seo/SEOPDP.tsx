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
   * @default %s | Fashion Store
   */
  titleTemplate: string;
  /**
   * @title Meta tag description
   * @description If not set, the product description will be used instead
   */
  description?: string;
  themeColor?: string;
}

function SeoPDP({ page, titleTemplate, description, ...baseSeo }: Props) {
  const product = page?.product;
  const breadcrumbList = page?.breadcrumbList;
  const { isVariantOf, ...currentProduct } = product ?? {};

  const title = titleTemplate.replace("%s", product?.name ?? "");
  const desc = description || product?.description;
  const imageUrl = product?.image?.[0]?.url;

  const canonical = breadcrumbList &&
    canonicalFromBreadcrumblist(breadcrumbList);

  return (
    <>
      <SEOBase
        {...baseSeo}
        title={title}
        description={desc}
        imageUrl={imageUrl}
        canonical={canonical}
      />

      <ScriptLDJson {...currentProduct} />
      <ScriptLDJson {...breadcrumbList} />
    </>
  );
}

export default SeoPDP;
