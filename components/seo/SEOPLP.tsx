import type { LoaderReturnType } from "$live/std/types.ts";

import ScriptLDJson from "./ScriptLDJson.tsx";
import SEOBase from "./SEOBase.tsx";
import type { ProductListingPage } from "../../commerce/types.ts";

export interface Props {
  page: LoaderReturnType<ProductListingPage>;
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  themeColor?: string;
}

function SeoPLP({ page, ...baseSeo }: Props) {
  const breadcrumbList = page?.breadcrumb;

  return (
    <>
      <SEOBase {...baseSeo} />
      <ScriptLDJson {...breadcrumbList} />
    </>
  );
}

export default SeoPLP;
