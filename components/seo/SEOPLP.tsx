import type { LoaderReturnType } from "$live/types.ts";

import ScriptLDJson from "./ScriptLDJson.tsx";
import SEOBase from "./SEOBase.tsx";
import { canonicalFromBreadcrumblist } from "../../utils/seo.ts";
import type { ProductListingPage } from "../../commerce/types.ts";

export interface Props {
  page: LoaderReturnType<ProductListingPage | null>;
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  themeColor?: string;
}

function SeoPLP({ page, ...baseSeo }: Props) {
  const breadcrumbList = page?.breadcrumb;
  const canonical = breadcrumbList &&
    canonicalFromBreadcrumblist(breadcrumbList);

  return (
    <>
      <SEOBase canonical={canonical} {...baseSeo} />
      <ScriptLDJson {...breadcrumbList} />
    </>
  );
}

export default SeoPLP;
