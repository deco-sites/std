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
  // categoryName: "",
  // categoryId: "",

  if (isProductPage) {
    props.pageCategory = "Product";
    // const productSD = structuredDatas.find((
    //   s,
    // ) => (s["@type"] === "Product")) || {};
    //
    // props.pageDepartment = productSD.additionalProperty.find((p) =>
    //   p.name === "category"
    // ).value;
    // props["productId"] = productSD.productID;
    // props["productReferenceId"] = new URL(window.location.href).pathname.split(
    //   "/",
    // )[1].split("-").pop(); // Isso não é verdade exemplo: https://fashion.deco.site/camisa-masculina-rock/p?skuId=92
    // props["productEans"] = [
    //   productSD.gtin,
    // ];
    // props["skuStocks"] = {
    //   [productSD.sku]: productSD.offers?.offers?.[0]?.inventoryLevel.value,
    // };
    //
    // props["productName"] = productSD.name;
    // props["productBrandName"] = productSD.brand;
    // props["productDepartmentName"] = props.pageDepartment;
    // props["productCategoryName"] = props.additionalProperty.findLast((v) =>
    //   v.name === "category"
    // )?.value;
    //
    // const offer = productSD.offers;
    // props["productListPriceFrom"] = offer.lowPrice;
    // props["productListPriceTo"] = offer.highPrice;
    // props["productPriceFrom"] = offer.lowPrice;
    // props["productPriceTo"] = offer.highPrice;
    //
    // props["productBrandId"] = 930833574;
    // props["productDepartmentId"] = 4010494;
    // props["productCategoryId"] = 4010502;
    // props["sellerId"] = "1";
    // props["sellerIds"] = "1";
    const scriptEl: HTMLScriptElement | null = document.querySelector(
      'script[data-id="vtex-portal-compat"]',
    );
    console.log("scruot", scriptEl?.dataset);
    if (scriptEl) {
      Object.assign(props, JSON.parse(scriptEl.dataset.datalayer || "{}"));
    }
  }

  if (!isProductPage) {
    const breadcrumbSD = structuredDatas.find((
      s,
    ) => (s["@type"] === "BreadcrumbList"));
    props.pageDepartment = breadcrumbSD?.itemListElement?.[0]?.name || ""; // what to do here?;
    if (props.pageDepartment) {
      props.pageCategory = "Category";
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
