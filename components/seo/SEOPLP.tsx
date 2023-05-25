import type { LoaderReturnType } from "$live/types.ts";

import ScriptLDJson from "./ScriptLDJson.tsx";
import SEOBase from "./SEOBase.tsx";
import { canonicalFromBreadcrumblist } from "../../utils/seo.ts";
import type { ProductListingPage } from "../../commerce/types.ts";

export interface Props {
  page: LoaderReturnType<ProductListingPage | null>;
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
}

function SeoPLP(
  { page, titleTemplate, title, description }: Props,
) {
  const { seo, breadcrumb } = page || {};

  const t = title ||
    titleTemplate?.replace("%s", seo?.title || "") ||
    seo?.title;
  const d = description || seo?.description;
  const c = seo?.canonical ||
    (breadcrumb && canonicalFromBreadcrumblist(breadcrumb));

  return (
    <>
      <SEOBase title={t} description={d} canonical={c} />
      <ScriptLDJson {...breadcrumb} />
    </>
  );
}

export default SeoPLP;
