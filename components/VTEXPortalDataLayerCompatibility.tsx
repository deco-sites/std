import { Product } from "deco-sites/std/commerce/types.ts";
import Script from "partytown/Script.tsx";
import { ComponentProps } from "preact";

type ScriptProps = ComponentProps<typeof Script>;

// deno-lint-ignore no-explicit-any
function addVTEXPortalDataSnippet(accountName: any) {
  const url = new URL(window.location.href);
  const isSearchPage = url.pathname.startsWith("/s");
  const structuredDataScripts =
    document.querySelectorAll('script[type="application/ld+json"]') || [];
  // deno-lint-ignore no-explicit-any
  const structuredDatas: Record<string, any>[] = [];
  // deno-lint-ignore no-explicit-any
  structuredDataScripts.forEach((v: any) => {
    structuredDatas.push(JSON.parse(v.text));
  });
  const isProductPage = structuredDatas.some((s) => s["@type"] === "Product");

  // deno-lint-ignore no-explicit-any
  const props: Record<string, any> = {
    pageCategory: "Home",
    pageDepartment: null,
    pageUrl: window.location.href,
    pageTitle: document.title,
    skuStockOutFromShelf: [],
    skuStockOutFromProductDetail: [],
    accountName: `${accountName}`,
    pageFacets: [],
    shelfProductIds: [],
  };

  if (isProductPage) {
    props.pageCategory = "Product";
    const scriptEl: HTMLScriptElement | null = document.querySelector(
      'script[data-id="vtex-portal-compat"]',
    );
    if (scriptEl) {
      Object.assign(props, JSON.parse(scriptEl.dataset.datalayer || "{}"));
    }
  }

  const breadcrumbSD = structuredDatas.find((
    s,
  ) => (s["@type"] === "BreadcrumbList"));
  if (breadcrumbSD && !isSearchPage) {
    const department = breadcrumbSD?.itemListElement?.[0];
    props.pageDepartment = department?.name || null;
    if (props.pageDepartment) {
      !isProductPage && (props.pageCategory = "Category");
      const category = breadcrumbSD?.itemListElement
        ?.[breadcrumbSD?.itemListElement.length - 1];
      // TODO: Corrigir na pDP
      props.categoryName = category?.name;
    } else {
      props.pageCategory = new URL(window.location.href).pathname.split("/")
        .filter(Boolean).join(" ");
    }
  } else if (isSearchPage) {
    props.pageCategory = "InternalSiteSearch";
    props.siteSearchTerm = url.searchParams.get("q");
  }

  document.querySelectorAll("[data-product-id]").forEach(
    (el) => {
      props.shelfProductIds.push((el as HTMLDivElement).dataset.productId);
    },
  );

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.unshift(props);

  if (url.pathname === "/") {
    window.dataLayer.push({ event: "homeView" });
  } else if (props.pageCategory === "Product") {
    window.dataLayer.push({ event: "productView" });
  } else if (props.pageCategory === "Category") {
    window.dataLayer.push({ event: "categoryView" });
  } else if (url.pathname.startsWith("/s")) {
    window.dataLayer.push({ event: "internalSiteSearchView" });
  } else {
    window.dataLayer.push({ event: "otherView" });
  }
}

interface AddVTEXPortalData {
  accountName: string;
}
export function AddVTEXPortalData(
  { accountName, ...props }: ScriptProps & AddVTEXPortalData,
) {
  return (
    <Script
      {...props}
      id="datalayer-portal-compat"
      dangerouslySetInnerHTML={{
        __html: `(${addVTEXPortalDataSnippet.toString()})('${accountName}')`,
      }}
    />
  );
}

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetailsTemplate(
  { product, ...props }: ProductDetailsProps,
) {
  const departament = product.additionalProperty?.find((p) =>
    p.name === "category"
  );
  const category = product.additionalProperty?.findLast((p) =>
    p.name === "category"
  );

  const offers = product.offers?.offers;
  const lowestOffer = offers?.[0]?.priceSpecification;
  const highestOffer = offers?.[offers.length - 1]?.priceSpecification;
  const template = {
    productId: product.isVariantOf?.productGroupID,
    productReferenceId: product.isVariantOf?.model,
    productEans: product.isVariantOf?.hasVariant.map((s) => s.gtin) || [],
    skuStock: product.isVariantOf?.hasVariant.reduce((result, sku) => {
      if (sku.offers?.offers?.[0]?.inventoryLevel.value) {
        // @ts-expect-error nao faz sentido
        result[sku.id!] = sku.offers?.offers?.[0]?.inventoryLevel.value;
      }
      return result;
    }, {} as Record<string, number>),
    productName: product.isVariantOf?.name,
    brand: product.brand,
    brandId: product.brand,
    productDepartmentId: departament?.propertyID,
    productDepartmentName: departament?.value,
    productCategoryId: category?.propertyID,
    productCategoryName: category?.value,
    productListPriceFrom: lowestOffer?.[0]?.price,
    productListPriceTo: highestOffer?.[0]?.price,
    productPriceFrom: lowestOffer?.[1]?.price,
    productPriceTo: highestOffer?.[1]?.price,
    sellerId: offers?.map(({ seller }) => seller)?.[0],
    sellerIds: offers?.map(({ seller }) => seller),
  };

  return (
    <script
      {...props}
      data-id="vtex-portal-compat"
      data-datalayer={JSON.stringify(template)}
    />
  );
}

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  if (!product.isVariantOf?.productGroupID) return null;
  return <script data-product-id={product.isVariantOf?.productGroupID} />;
}

export interface ProductSKUJsonProps {
  product: unknown;
}
export function ProductSKUJson(
  { product, ...props }: ScriptProps & ProductSKUJsonProps,
) {
  return (
    <Script
      {...props}
      dangerouslySetInnerHTML={{
        __html: `var skuJson = ${JSON.stringify(product)}`,
      }}
    />
  );
}
