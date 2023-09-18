import { Head } from "$fresh/runtime.ts";
import {
  handleSEO,
  tagsFromListing,
  tagsFromProduct,
} from "../../utils/seo.ts";
import ScriptLDJson from "./ScriptLDJson.tsx";
import Preview from "./components/Preview.tsx";
import type { Props } from "./types.ts";

function Metatags(props: Props) {
  const {
    titleTemplate = "",
    descriptionTemplate = "",
    context,
    type,
    themeColor,
    favicon,
  } = props;
  const twitterCard = type === "website" ? "summary" : "summary_large_image";

  const tags = context?.["@type"] === "ProductDetailsPage"
    ? tagsFromProduct(context, titleTemplate)
    : context?.["@type"] === "ProductListingPage"
    ? tagsFromListing(context, titleTemplate, descriptionTemplate)
    : null;

  const { title, description, image, canonical } = handleSEO(props, tags);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content={themeColor} />
        <link rel="icon" href={favicon} />

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

        {/* Link tags */}
        {canonical && <link rel="canonical" href={canonical} />}

        {/* No index, no follow */}
        {props?.noIndexNoFollow && (
          <meta name="robots" content="noindex, nofollow" />
        )}
      </Head>
      {context?.["@type"] === "ProductDetailsPage" && (
        <>
          <ScriptLDJson {...{ ...context.product, isVariantOf: [] }} />
          <ScriptLDJson {...context.breadcrumbList} />
        </>
      )}
      {context?.["@type"] === "ProductListingPage" && (
        <ScriptLDJson {...context.breadcrumb} />
      )}
    </>
  );
}

export { Preview };

export default Metatags;
