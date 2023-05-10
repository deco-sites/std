// DO NOT EDIT. This file is generated by deco.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import { DecoManifest } from "$live/types.ts";
import * as $0 from "./functions/butterCMSRelatedPosts.ts";
import * as $1 from "./functions/vtexWishlist.ts";
import * as $2 from "./functions/butterCMSFeaturedPosts.ts";
import * as $3 from "./functions/shopifyProductListingPage.ts";
import * as $4 from "./functions/vtexLegacyProductList.ts";
import * as $5 from "./functions/requestToParam.ts";
import * as $6 from "./functions/butterCMSCategories.ts";
import * as $7 from "./functions/vtexProductDetailsPage.ts";
import * as $8 from "./functions/occProductDetailsPage.ts";
import * as $9 from "./functions/shopifyProductList.ts";
import * as $10 from "./functions/butterCMSPage.ts";
import * as $11 from "./functions/vtexProductList.ts";
import * as $12 from "./functions/butterCMSAds.ts";
import * as $13 from "./functions/vtexNavbar.ts";
import * as $14 from "./functions/vndaProductListingPage.ts";
import * as $15 from "./functions/shopifyProductDetailsPage.ts";
import * as $16 from "./functions/vtexLegacyProductDetailsPage.ts";
import * as $17 from "./functions/vtexLegacyProductListingPage.ts";
import * as $18 from "./functions/vndaProductList.ts";
import * as $19 from "./functions/butterCMSBrands.ts";
import * as $20 from "./functions/vtexProductListingPage.ts";
import * as $21 from "./functions/vtexLegacyRelatedProductsLoader.ts";
import * as $22 from "./functions/vtexSuggestions.ts";
import * as $23 from "./functions/butterCMSPostDetail.ts";
import * as $24 from "./functions/butterCMSPlaces.ts";
import * as $25 from "./functions/butterCMSPosts.ts";
import * as $26 from "./functions/vndaProductDetailsPage.ts";
import * as $$0 from "./accounts/vnda.ts";
import * as $$1 from "./accounts/shopify.ts";
import * as $$2 from "./accounts/occ.ts";
import * as $$3 from "./accounts/vtex.ts";
import * as $$4 from "./accounts/yourViews.ts";
import * as $$$0 from "./loaders/vtex/cart.ts";
import * as $$$1 from "./loaders/vtex/user.ts";
import * as $$$2 from "./loaders/vtex/legacy/productListingPage.ts";
import * as $$$3 from "./loaders/vtex/legacy/productList.ts";
import * as $$$4 from "./loaders/vtex/legacy/productDetailsPage.ts";
import * as $$$5 from "./loaders/vtex/legacy/relatedProductsLoader.ts";
import * as $$$6 from "./loaders/vtex/wishlist.ts";
import * as $$$7 from "./loaders/vtex/navbar.ts";
import * as $$$8 from "./loaders/vtex/intelligentSearch/suggestions.ts";
import * as $$$9 from "./loaders/vtex/intelligentSearch/productListingPage.ts";
import * as $$$10 from "./loaders/vtex/intelligentSearch/productList.ts";
import * as $$$11 from "./loaders/vtex/intelligentSearch/productDetailsPage.ts";
import * as $$$$0 from "./routes/404.tsx";
import * as $$$$1 from "./routes/_app.tsx";
import * as $$$$$$$$0 from "./sections/Analytics.tsx";
import * as $$$$$$$$1 from "./sections/SEOPLP.tsx";
import * as $$$$$$$$2 from "./sections/configVNDA.global.tsx";
import * as $$$$$$$$3 from "./sections/SEO.tsx";
import * as $$$$$$$$4 from "./sections/configOCC.global.tsx";
import * as $$$$$$$$5 from "./sections/configShopify.global.tsx";
import * as $$$$$$$$6 from "./sections/SEOPDP.tsx";
import * as $$$$$$$$7 from "./sections/configVTEX.global.tsx";
import * as $$$$$$$$8 from "./sections/configYourViews.global.tsx";
import * as $$$$$$$$9 from "./sections/configButterCMS.global.tsx";
import * as $$$$$$$$$$$0 from "./actions/vtex/cart/updateUser.ts";
import * as $$$$$$$$$$$1 from "./actions/vtex/cart/updateItemPrice.ts";
import * as $$$$$$$$$$$2 from "./actions/vtex/cart/updateCoupons.ts";
import * as $$$$$$$$$$$3 from "./actions/vtex/cart/removeItemAttachment.ts";
import * as $$$$$$$$$$$4 from "./actions/vtex/cart/simulation.ts";
import * as $$$$$$$$$$$5 from "./actions/vtex/cart/updateItems.ts";
import * as $$$$$$$$$$$6 from "./actions/vtex/cart/addItems.ts";
import * as $$$$$$$$$$$7 from "./actions/vtex/cart/removeItems.ts";
import * as $$$$$$$$$$$8 from "./actions/vtex/cart/getInstallment.ts";
import * as $$$$$$$$$$$9 from "./actions/vtex/cart/updateItemAttachment.ts";
import * as $$$$$$$$$$$10 from "./actions/vtex/cart/updateProfile.ts";
import * as $$$$$$$$$$$11 from "./actions/vtex/cart/updateAttachment.ts";
import * as $$$$$$$$$$$12 from "./actions/vtex/wishlist/addItem.ts";
import * as $$$$$$$$$$$13 from "./actions/vtex/wishlist/removeItem.ts";
import * as $live_middleware from "$live/routes/_middleware.ts";
import * as $live_workbench from "$live/routes/live/workbench.ts";
import * as $live_invoke from "$live/routes/live/invoke/index.ts";
import * as $live_editorData from "$live/routes/live/editorData.ts";
import * as $live_inspect from "$live/routes/live/inspect/[...block].ts";
import * as $live_meta from "$live/routes/live/_meta.ts";
import * as $live_previews from "$live/routes/live/previews/[...block].tsx";
import * as $live_catchall from "$live/routes/[...catchall].tsx";
import * as i1$0 from "$live/handlers/devPage.ts";
import * as i1$1 from "$live/handlers/fresh.ts";
import * as i1$2 from "$live/handlers/proxy.ts";
import * as i1$3 from "$live/handlers/router.ts";
import * as i1$4 from "$live/handlers/routesSelection.ts";
import * as i1$$0 from "$live/pages/LivePage.tsx";
import * as i1$$$0 from "$live/sections/PageInclude.tsx";
import * as i1$$$1 from "$live/sections/Slot.tsx";
import * as i1$$$2 from "$live/sections/UseSlot.tsx";
import * as i1$$$$0 from "$live/matchers/MatchAlways.ts";
import * as i1$$$$1 from "$live/matchers/MatchDate.ts";
import * as i1$$$$2 from "$live/matchers/MatchEnvironment.ts";
import * as i1$$$$3 from "$live/matchers/MatchHost.ts";
import * as i1$$$$4 from "$live/matchers/MatchMulti.ts";
import * as i1$$$$5 from "$live/matchers/MatchRandom.ts";
import * as i1$$$$6 from "$live/matchers/MatchSite.ts";
import * as i1$$$$7 from "$live/matchers/MatchUserAgent.ts";
import * as i1$$$$$0 from "$live/flags/audience.ts";
import * as i1$$$$$1 from "$live/flags/everyone.ts";

const manifest = {
  "functions": {
    "deco-sites/std/functions/butterCMSAds.ts": $12,
    "deco-sites/std/functions/butterCMSBrands.ts": $19,
    "deco-sites/std/functions/butterCMSCategories.ts": $6,
    "deco-sites/std/functions/butterCMSFeaturedPosts.ts": $2,
    "deco-sites/std/functions/butterCMSPage.ts": $10,
    "deco-sites/std/functions/butterCMSPlaces.ts": $24,
    "deco-sites/std/functions/butterCMSPostDetail.ts": $23,
    "deco-sites/std/functions/butterCMSPosts.ts": $25,
    "deco-sites/std/functions/butterCMSRelatedPosts.ts": $0,
    "deco-sites/std/functions/occProductDetailsPage.ts": $8,
    "deco-sites/std/functions/requestToParam.ts": $5,
    "deco-sites/std/functions/shopifyProductDetailsPage.ts": $15,
    "deco-sites/std/functions/shopifyProductList.ts": $9,
    "deco-sites/std/functions/shopifyProductListingPage.ts": $3,
    "deco-sites/std/functions/vndaProductDetailsPage.ts": $26,
    "deco-sites/std/functions/vndaProductList.ts": $18,
    "deco-sites/std/functions/vndaProductListingPage.ts": $14,
    "deco-sites/std/functions/vtexLegacyProductDetailsPage.ts": $16,
    "deco-sites/std/functions/vtexLegacyProductList.ts": $4,
    "deco-sites/std/functions/vtexLegacyProductListingPage.ts": $17,
    "deco-sites/std/functions/vtexLegacyRelatedProductsLoader.ts": $21,
    "deco-sites/std/functions/vtexNavbar.ts": $13,
    "deco-sites/std/functions/vtexProductDetailsPage.ts": $7,
    "deco-sites/std/functions/vtexProductList.ts": $11,
    "deco-sites/std/functions/vtexProductListingPage.ts": $20,
    "deco-sites/std/functions/vtexSuggestions.ts": $22,
    "deco-sites/std/functions/vtexWishlist.ts": $1,
  },
  "accounts": {
    "deco-sites/std/accounts/occ.ts": $$2,
    "deco-sites/std/accounts/shopify.ts": $$1,
    "deco-sites/std/accounts/vnda.ts": $$0,
    "deco-sites/std/accounts/vtex.ts": $$3,
    "deco-sites/std/accounts/yourViews.ts": $$4,
  },
  "loaders": {
    "deco-sites/std/loaders/vtex/cart.ts": $$$0,
    "deco-sites/std/loaders/vtex/intelligentSearch/productDetailsPage.ts":
      $$$11,
    "deco-sites/std/loaders/vtex/intelligentSearch/productList.ts": $$$10,
    "deco-sites/std/loaders/vtex/intelligentSearch/productListingPage.ts": $$$9,
    "deco-sites/std/loaders/vtex/intelligentSearch/suggestions.ts": $$$8,
    "deco-sites/std/loaders/vtex/legacy/productDetailsPage.ts": $$$4,
    "deco-sites/std/loaders/vtex/legacy/productList.ts": $$$3,
    "deco-sites/std/loaders/vtex/legacy/productListingPage.ts": $$$2,
    "deco-sites/std/loaders/vtex/legacy/relatedProductsLoader.ts": $$$5,
    "deco-sites/std/loaders/vtex/navbar.ts": $$$7,
    "deco-sites/std/loaders/vtex/user.ts": $$$1,
    "deco-sites/std/loaders/vtex/wishlist.ts": $$$6,
  },
  "routes": {
    "./routes/_app.tsx": $$$$1,
    "./routes/_middleware.ts": $live_middleware,
    "./routes/[...catchall].tsx": $live_catchall,
    "./routes/404.tsx": $$$$0,
    "./routes/index.tsx": $live_catchall,
    "./routes/live/_meta.ts": $live_meta,
    "./routes/live/editorData.ts": $live_editorData,
    "./routes/live/inspect/[...block].ts": $live_inspect,
    "./routes/live/invoke/index.ts": $live_invoke,
    "./routes/live/previews/[...block].tsx": $live_previews,
    "./routes/live/workbench.ts": $live_workbench,
  },
  "sections": {
    "$live/sections/PageInclude.tsx": i1$$$0,
    "$live/sections/Slot.tsx": i1$$$1,
    "$live/sections/UseSlot.tsx": i1$$$2,
    "deco-sites/std/sections/Analytics.tsx": $$$$$$$$0,
    "deco-sites/std/sections/configButterCMS.global.tsx": $$$$$$$$9,
    "deco-sites/std/sections/configOCC.global.tsx": $$$$$$$$4,
    "deco-sites/std/sections/configShopify.global.tsx": $$$$$$$$5,
    "deco-sites/std/sections/configVNDA.global.tsx": $$$$$$$$2,
    "deco-sites/std/sections/configVTEX.global.tsx": $$$$$$$$7,
    "deco-sites/std/sections/configYourViews.global.tsx": $$$$$$$$8,
    "deco-sites/std/sections/SEO.tsx": $$$$$$$$3,
    "deco-sites/std/sections/SEOPDP.tsx": $$$$$$$$6,
    "deco-sites/std/sections/SEOPLP.tsx": $$$$$$$$1,
  },
  "actions": {
    "deco-sites/std/actions/vtex/cart/addItems.ts": $$$$$$$$$$$6,
    "deco-sites/std/actions/vtex/cart/getInstallment.ts": $$$$$$$$$$$8,
    "deco-sites/std/actions/vtex/cart/removeItemAttachment.ts": $$$$$$$$$$$3,
    "deco-sites/std/actions/vtex/cart/removeItems.ts": $$$$$$$$$$$7,
    "deco-sites/std/actions/vtex/cart/simulation.ts": $$$$$$$$$$$4,
    "deco-sites/std/actions/vtex/cart/updateAttachment.ts": $$$$$$$$$$$11,
    "deco-sites/std/actions/vtex/cart/updateCoupons.ts": $$$$$$$$$$$2,
    "deco-sites/std/actions/vtex/cart/updateItemAttachment.ts": $$$$$$$$$$$9,
    "deco-sites/std/actions/vtex/cart/updateItemPrice.ts": $$$$$$$$$$$1,
    "deco-sites/std/actions/vtex/cart/updateItems.ts": $$$$$$$$$$$5,
    "deco-sites/std/actions/vtex/cart/updateProfile.ts": $$$$$$$$$$$10,
    "deco-sites/std/actions/vtex/cart/updateUser.ts": $$$$$$$$$$$0,
    "deco-sites/std/actions/vtex/wishlist/addItem.ts": $$$$$$$$$$$12,
    "deco-sites/std/actions/vtex/wishlist/removeItem.ts": $$$$$$$$$$$13,
  },
  "handlers": {
    "$live/handlers/devPage.ts": i1$0,
    "$live/handlers/fresh.ts": i1$1,
    "$live/handlers/proxy.ts": i1$2,
    "$live/handlers/router.ts": i1$3,
    "$live/handlers/routesSelection.ts": i1$4,
  },
  "pages": {
    "$live/pages/LivePage.tsx": i1$$0,
  },
  "matchers": {
    "$live/matchers/MatchAlways.ts": i1$$$$0,
    "$live/matchers/MatchDate.ts": i1$$$$1,
    "$live/matchers/MatchEnvironment.ts": i1$$$$2,
    "$live/matchers/MatchHost.ts": i1$$$$3,
    "$live/matchers/MatchMulti.ts": i1$$$$4,
    "$live/matchers/MatchRandom.ts": i1$$$$5,
    "$live/matchers/MatchSite.ts": i1$$$$6,
    "$live/matchers/MatchUserAgent.ts": i1$$$$7,
  },
  "flags": {
    "$live/flags/audience.ts": i1$$$$$0,
    "$live/flags/everyone.ts": i1$$$$$1,
  },
  "islands": {},
  "config": config,
  "baseUrl": import.meta.url,
};

export type Manifest = typeof manifest;

export default manifest satisfies DecoManifest;
