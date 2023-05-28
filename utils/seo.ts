import type {
  BreadcrumbList,
  ProductDetailsPage,
  ProductListingPage,
} from "../commerce/types.ts";
import {
  ProductListingSEO,
  ProductSEO,
  Props,
} from "../components/seo/types.ts";

export const canonicalFromBreadcrumblist = (
  { itemListElement }: BreadcrumbList,
) =>
  itemListElement.length > 0
    ? itemListElement.reduce((acc, curr) =>
      acc.position < curr.position ? curr : acc
    ).item
    : undefined;

export function getProductSEO(
  page: ProductDetailsPage | null,
  template: string,
): ProductSEO | null {
  if (!page) return null;

  const product = page.product;
  const breadcrumb = page.breadcrumbList;
  const seo = page.seo;
  const { isVariantOf: _isVariantOf, ...currentProduct } = product ?? {};

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

export function getProductListingSEO(
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

export function handleSEO(
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
