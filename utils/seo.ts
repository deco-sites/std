import type {
  BreadcrumbList,
  ProductDetailsPage,
  ProductListingPage,
} from "../commerce/types.ts";
import { Props } from "../components/seo/types.ts";

export const canonicalFromBreadcrumblist = (
  { itemListElement }: BreadcrumbList,
) =>
  itemListElement.length > 0
    ? itemListElement.reduce((acc, curr) =>
      acc.position < curr.position ? curr : acc
    ).item
    : undefined;

export function tagsFromProduct(
  page: ProductDetailsPage | null,
  template: string,
) {
  if (!page) return null;

  const { product, breadcrumbList: breadcrumb, seo } = page;

  const title = template?.replace("%s", seo?.title || "") ||
    seo?.title;
  const description = seo?.description;
  const canonical = seo?.canonical ||
    (breadcrumb && canonicalFromBreadcrumblist(breadcrumb));
  const imageUrl = product?.image?.[0]?.url;

  return { title, description, canonical, imageUrl };
}

export function tagsFromListing(
  page: ProductListingPage | null,
  titleTemplate: string,
  descriptionTemplate: string,
) {
  if (!page) return null;

  const { seo, breadcrumb } = page;
  const title = seo?.title && titleTemplate
    ? titleTemplate.replace("%s", seo.title || "")
    : seo?.title;
  const description = seo?.description && descriptionTemplate
    ? descriptionTemplate.replace("%s", seo.description || "")
    : seo?.description;
  const canonical = seo?.canonical ||
    (breadcrumb && canonicalFromBreadcrumblist(breadcrumb));

  return { title, description, canonical, imageUrl: "" };
}

export const handleSEO = (
  props: Props,
  ctx:
    | ReturnType<typeof tagsFromProduct>
    | ReturnType<typeof tagsFromListing>,
) => ({
  title: ctx?.title || props.title,
  image: ctx?.imageUrl || props.image,
  canonical: ctx?.canonical || props.canonical,
  description: (ctx?.description || props.description)?.replace(
    /(<([^>]+)>)/gi,
    "",
  ),
});
