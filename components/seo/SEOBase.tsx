import { Head } from "$fresh/runtime.ts";
import {
  getProductListingSEO,
  getProductSEO,
  handleSEO,
} from "../../utils/seo.ts";
import ScriptLDJson from "./ScriptLDJson.tsx";
import Preview from "./components/Preview.tsx";
import type { Props } from "./types.ts";

function SEOBase({
  pdpTitleTemplate,
  plpTitleTemplate,
  pdp,
  plp,
  ...props
}: Props) {
  const twitterCard = props.type === "website"
    ? "summary"
    : "summary_large_image";

  const {
    title,
    description,
    image,
    type,
    themeColor,
    favicon,
    canonical,
    currentProduct,
    breadcrumb,
  } = handleSEO(
    props,
    getProductSEO(pdp, pdpTitleTemplate),
    getProductListingSEO(plp, plpTitleTemplate),
  );

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* Twitter tags */}
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={image} />
        <meta property="twitter:card" content={twitterCard} />
        {/* OpenGraph tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content={type} />
        <meta property="og:image" content={image} />

        <title>{title}</title>
        <meta name="theme-color" content={themeColor} />
        <meta name="description" content={description} />
        <link rel="icon" href={favicon} />

        {/* Link tags */}
        {canonical && <link rel="canonical" href={canonical} />}
      </Head>
      {pdp && currentProduct ? <ScriptLDJson {...currentProduct} /> : null}
      {(pdp || plp) && breadcrumb ? <ScriptLDJson {...breadcrumb} /> : null}
    </>
  );
}

export { Preview };

export default SEOBase;
