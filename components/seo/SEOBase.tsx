import { Head } from "$fresh/runtime.ts";
import type {
  BreadcrumbList,
  Product,
  ProductDetailsPage,
  ProductListingPage,
} from "../../commerce/types.ts";
import { canonicalFromBreadcrumblist } from "../../utils/seo.ts";
import Preview from "./components/Preview.tsx";
import type { Props } from "./types.ts";
import ScriptLDJson from "./ScriptLDJson.tsx";

interface ProductSEO extends ProductListingSEO {
  currentProduct: Omit<Product, "isVariantOf">;
  imageUrl?: string;
}

interface ProductListingSEO {
  title?: string;
  description?: string;
  canonical?: string;
  breadcrumb: BreadcrumbList;
}

function getProductSEO(
  page: ProductDetailsPage | null,
  template: string,
): ProductSEO | null {
  if (!page) return null;

  const product = page.product;
  const breadcrumb = page.breadcrumbList;
  const seo = page.seo;
  const { isVariantOf, ...currentProduct } = product ?? {};

  const title = template?.replace("%s", seo?.title || product?.name || "") ||
    seo?.title;
  const description = seo?.description;
  const canonical = seo?.canonical ||
    (breadcrumb && canonicalFromBreadcrumblist(breadcrumb));
  const imageUrl = product?.image?.[0]?.url;

  return {
    currentProduct,
    title,
    description,
    canonical,
    imageUrl,
    breadcrumb,
  };
}

function getProductListingSEO(
  page: ProductListingPage | null,
  template: string,
): ProductListingSEO | null {
  if (!page) return null;

  const { seo, breadcrumb } = page;

  const title = template?.replace("%s", seo?.title || "") ||
    seo?.title;
  const description = seo?.description;
  const canonical = seo?.canonical ||
    (breadcrumb && canonicalFromBreadcrumblist(breadcrumb));

  return { title, description, canonical, breadcrumb };
}

function handleSEO(
  props: Omit<Props, "pdpTitleTemplate" | "plpTitleTemplate" | "pdp" | "plp">,
  pdp: ProductSEO | null,
  plp: ProductListingSEO | null,
) {
  return {
    title: pdp?.title || plp?.title || props.title,
    description: pdp?.description || plp?.description || props.description,
    canonical: pdp?.canonical || plp?.canonical || props.canonical,
    image: pdp?.imageUrl || props.image,
    type: props.type,
    themeColor: props.themeColor,
    favicon: props.favicon,
    currentProduct: pdp?.currentProduct,
    breadcrumb: pdp?.breadcrumb ?? plp?.breadcrumb,
  };
}

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
