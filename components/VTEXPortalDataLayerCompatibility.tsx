import { Product } from "deco-sites/std/commerce/types.ts";
import { Head } from "$fresh/runtime.ts";

// deno-lint-ignore no-explicit-any
function addVTEXPortalDataSnippet(accountName: any) {
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
  if (breadcrumbSD) {
    const department = breadcrumbSD?.itemListElement?.[0];
    props.pageDepartment = department?.name || null;
    if (props.pageDepartment) {
      props.pageCategory = "Category";
      const category = breadcrumbSD?.itemListElement
        ?.[breadcrumbSD?.itemListElement.length - 1];
      props.categoryName = category?.name;
    } else {
      props.pageCategory = new URL(window.location.href).pathname.split("/")
        .filter(Boolean).join(" ");
    }
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(props);
}

export function AddVTEXPortalData({ accountName }: { accountName: string }) {
  return (
    <script
      id="datalayer-portal-compat"
      dangerouslySetInnerHTML={{
        __html: `(${addVTEXPortalDataSnippet.toString()})('${accountName}')`,
      }}
    />
  );
}

export function ProductDetailsTemplate({ product }: { product: Product }) {
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
    <Head>
      <script
        data-id="vtex-portal-compat"
        data-datalayer={JSON.stringify(template)}
      >
      </script>
    </Head>
  );
}

// How to use:
// 1. add the AddVTEXPortalData at routes/_app.tsx before <props.Component />
// 2. add the ProductDetailsTemplate at ProductDetails.tsx for routes /:slug/p
