# deco.cx standard blocks library

This repo contains all the [Live.ts](https://github.com/deco-cx/live.ts) blocks built by the community that are officially maintained by the [deco.cx](https://deco.cx) team.

## How we deal with breaking changes

We are committed to avoiding breaking changes at all costs. The product is still early, but nonetheless we prefer to **add** new blocks or new properties whenever possible.

If and when breaking changes occur, they will be signaled with a new Major version on the git tags.

## VTEX Portal Data Layer Compatibility

> :warning: The compatibility layer requires structured data from the SEO/SEOPLP/SEOPDP component to be present on every page.

How to use:
1. add the AddVTEXPortalData at routes/_app.tsx after <props.Component />. Example:
```tsx
// routes/_app.tsx
export default function App(props) {
  return (
    <>
    {/* ... */}
      <props.Component />
      <GTM trackingId={id} /> // or can be Analytics Section, that would be inside <props.Component />
      <AddVTEXPortalData accountName="{{ vtexAccountNameHere }}" type="module" />
    </>
  )
}
```
2. Add the ProductDetailsTemplate at ProductDetails.tsx for routes /:slug/p. Example:
```tsx
// sections/ProductDetails.tsx
export default function ProductDetails({ page }: Props) {
  if (!page) {
    return null;
  }

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb
        itemListElement={breadcrumbList?.itemListElement.slice(0, -1)}
      />
      <ProductDetailsTemplate product={page.product} />
      {/* ... */}
    </>
  );
}
```
3. Add ProductInfo to all rendered products on all pages.
4. Add VTEXPortalDataLayerCompatibility section to PDP if necessary, to add skuJson.

To disable the scripts to work outside partytown, change the all components type property to something different from `text/partytown`, example: `type="module"`.

# Thanks to all contributors!

<a href="https://github.com/deco-sites/std/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=deco-sites/std" />
</a> 