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
    context,
    type,
    themeColor,
    favicon,
    twitterCard,
  } = props;

  const tags = context?.["@type"] === "ProductDetailsPage"
    ? tagsFromProduct(context, titleTemplate)
    : context?.["@type"] === "ProductListingPage"
    ? tagsFromListing(context, titleTemplate)
    : null;

  const { title, description, image, canonical } = handleSEO(props, tags);

  return (
    <>
      <Head>
        {title && (
          <>
            <title>{title}</title>
            <meta property="og:title" content={title} />
          </>
        )}

        {description && (
          <>
            <meta name="description" content={description} />
            <meta property="og:description" content={description} />
          </>
        )}

        {image && (
          <>
            <meta property="og:image" content={image} />
          </>
        )}

        {themeColor && <meta name="theme-color" content={themeColor} />}

        {favicon && <link rel="icon" href={favicon} />}

        {twitterCard && <meta property="twitter:card" content={twitterCard} />}

        {type && <meta property="og:type" content={type} />}

        {canonical && (
          <>
            <meta property="og:url" content={canonical} />
            <link rel="canonical" href={canonical} />
          </>
        )}

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
