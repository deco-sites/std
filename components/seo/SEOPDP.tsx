import type { ProductDetailsPage } from "../../commerce/types.ts";
import ScriptLDJson from "./ScriptLDJson.tsx";
import SEOBase from "./SEOBase.tsx";

export interface Props {
  page: ProductDetailsPage | null;
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
  const url = product?.url;

  return (
    <>
      <SEOBase
        {...baseSeo}
        title={title}
        description={desc}
        imageUrl={imageUrl}
        url={url}
      />

      <ScriptLDJson {...currentProduct} />
      <ScriptLDJson {...breadcrumbList} />
    </>
  );
}

export default SeoPDP;
