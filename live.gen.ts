// DO NOT EDIT. This file is generated by deco.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import { DecoManifest } from "$live/types.ts";
import * as $0 from "./functions/butterCMSPosts.ts";
import * as $1 from "./functions/vtexConfig.ts";
import * as $2 from "./functions/vtexProductListingPage.ts";
import * as $3 from "./functions/vndaProductList.ts";
import * as $4 from "./functions/butterCMSAds.ts";
import * as $5 from "./functions/butterCMSPostDetail.ts";
import * as $6 from "./functions/vndaProductDetailsPage.ts";
import * as $7 from "./functions/vtexLegacyProductDetailsPage.ts";
import * as $8 from "./functions/segment.ts";
import * as $9 from "./functions/vtexSuggestions.ts";
import * as $10 from "./functions/vtexNavbar.ts";
import * as $11 from "./functions/butterCMSPlaces.ts";
import * as $12 from "./functions/vtexWishlist.ts";
import * as $13 from "./functions/vtexClient.ts";
import * as $14 from "./functions/shopifyProductListingPage.ts";
import * as $15 from "./functions/slugFromParams.ts";
import * as $16 from "./functions/vtexProductList.ts";
import * as $17 from "./functions/butterCMSFeaturedPosts.ts";
import * as $18 from "./functions/occProductDetailsPage.ts";
import * as $19 from "./functions/butterCMSBrands.ts";
import * as $20 from "./functions/vndaProductListingPage.ts";
import * as $21 from "./functions/vtexLegacyProductListingPage.ts";
import * as $22 from "./functions/vtexProductDetailsPage.ts";
import * as $23 from "./functions/vtexLegacyProductList.ts";
import * as $24 from "./functions/butterCMSCategories.ts";
import * as $25 from "./functions/shopifyProductList.ts";
import * as $26 from "./functions/shopifyProductDetailsPage.ts";
import * as $27 from "./functions/vtexLegacyRelatedProductsLoader.ts";
import * as $$0 from "./accounts/vnda.ts";
import * as $$1 from "./accounts/yourViews.ts";
import * as $$2 from "./accounts/vtex.ts";
import * as $$3 from "./accounts/shopify.ts";
import * as $$4 from "./accounts/occ.ts";
import * as $$$0 from "./loaders/vtexLegacyProductDetailsPage.ts";
import * as $$$1 from "./loaders/vtexLegacyRelatedProductsLoader.ts";
import * as $$$$0 from "./routes/404.tsx";
import * as $$$$1 from "./routes/_app.tsx";
import * as $$$$$$$$0 from "./sections/configYourViews.global.tsx";
import * as $$$$$$$$1 from "./sections/configButterCMS.global.tsx";
import * as $$$$$$$$2 from "./sections/SEO.tsx";
import * as $$$$$$$$3 from "./sections/SEOPLP.tsx";
import * as $$$$$$$$4 from "./sections/configOCC.global.tsx";
import * as $$$$$$$$5 from "./sections/Analytics.tsx";
import * as $$$$$$$$6 from "./sections/configShopify.global.tsx";
import * as $$$$$$$$7 from "./sections/configVNDA.global.tsx";
import * as $$$$$$$$8 from "./sections/configVTEX.global.tsx";
import * as $$$$$$$$9 from "./sections/SEOPDP.tsx";
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
import * as i1$2 from "$live/handlers/router.ts";
import * as i1$3 from "$live/handlers/routesSelection.ts";
import * as i1$$0 from "$live/pages/LivePage.tsx";
import * as i1$$$0 from "$live/sections/PageInclude.tsx";
import * as i1$$$1 from "$live/sections/Slot.tsx";
import * as i1$$$2 from "$live/sections/UseSlot.tsx";
import * as i1$$$$0 from "$live/matchers/MatchAlways.ts";
import * as i1$$$$1 from "$live/matchers/MatchDate.ts";
import * as i1$$$$2 from "$live/matchers/MatchEnvironment.ts";
import * as i1$$$$3 from "$live/matchers/MatchMulti.ts";
import * as i1$$$$4 from "$live/matchers/MatchRandom.ts";
import * as i1$$$$5 from "$live/matchers/MatchSite.ts";
import * as i1$$$$6 from "$live/matchers/MatchUserAgent.ts";
import * as i1$$$$$0 from "$live/flags/audience.ts";
import * as i1$$$$$1 from "$live/flags/everyone.ts";

const manifest = {
  "functions": {
    "deco-sites/std/functions/butterCMSAds.ts": $4,
    "deco-sites/std/functions/butterCMSBrands.ts": $19,
    "deco-sites/std/functions/butterCMSCategories.ts": $24,
    "deco-sites/std/functions/butterCMSFeaturedPosts.ts": $17,
    "deco-sites/std/functions/butterCMSPlaces.ts": $11,
    "deco-sites/std/functions/butterCMSPostDetail.ts": $5,
    "deco-sites/std/functions/butterCMSPosts.ts": $0,
    "deco-sites/std/functions/occProductDetailsPage.ts": $18,
    "deco-sites/std/functions/segment.ts": $8,
    "deco-sites/std/functions/shopifyProductDetailsPage.ts": $26,
    "deco-sites/std/functions/shopifyProductList.ts": $25,
    "deco-sites/std/functions/shopifyProductListingPage.ts": $14,
    "deco-sites/std/functions/slugFromParams.ts": $15,
    "deco-sites/std/functions/vndaProductDetailsPage.ts": $6,
    "deco-sites/std/functions/vndaProductList.ts": $3,
    "deco-sites/std/functions/vndaProductListingPage.ts": $20,
    "deco-sites/std/functions/vtexClient.ts": $13,
    "deco-sites/std/functions/vtexConfig.ts": $1,
    "deco-sites/std/functions/vtexLegacyProductDetailsPage.ts": $7,
    "deco-sites/std/functions/vtexLegacyProductList.ts": $23,
    "deco-sites/std/functions/vtexLegacyProductListingPage.ts": $21,
    "deco-sites/std/functions/vtexLegacyRelatedProductsLoader.ts": $27,
    "deco-sites/std/functions/vtexNavbar.ts": $10,
    "deco-sites/std/functions/vtexProductDetailsPage.ts": $22,
    "deco-sites/std/functions/vtexProductList.ts": $16,
    "deco-sites/std/functions/vtexProductListingPage.ts": $2,
    "deco-sites/std/functions/vtexSuggestions.ts": $9,
    "deco-sites/std/functions/vtexWishlist.ts": $12,
  },
  "accounts": {
    "deco-sites/std/accounts/occ.ts": $$4,
    "deco-sites/std/accounts/shopify.ts": $$3,
    "deco-sites/std/accounts/vnda.ts": $$0,
    "deco-sites/std/accounts/vtex.ts": $$2,
    "deco-sites/std/accounts/yourViews.ts": $$1,
  },
  "loaders": {
    "deco-sites/std/loaders/vtexLegacyProductDetailsPage.ts": $$$0,
    "deco-sites/std/loaders/vtexLegacyRelatedProductsLoader.ts": $$$1,
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
    "deco-sites/std/sections/Analytics.tsx": $$$$$$$$5,
    "deco-sites/std/sections/configButterCMS.global.tsx": $$$$$$$$1,
    "deco-sites/std/sections/configOCC.global.tsx": $$$$$$$$4,
    "deco-sites/std/sections/configShopify.global.tsx": $$$$$$$$6,
    "deco-sites/std/sections/configVNDA.global.tsx": $$$$$$$$7,
    "deco-sites/std/sections/configVTEX.global.tsx": $$$$$$$$8,
    "deco-sites/std/sections/configYourViews.global.tsx": $$$$$$$$0,
    "deco-sites/std/sections/SEO.tsx": $$$$$$$$2,
    "deco-sites/std/sections/SEOPDP.tsx": $$$$$$$$9,
    "deco-sites/std/sections/SEOPLP.tsx": $$$$$$$$3,
  },
  "handlers": {
    "$live/handlers/devPage.ts": i1$0,
    "$live/handlers/fresh.ts": i1$1,
    "$live/handlers/router.ts": i1$2,
    "$live/handlers/routesSelection.ts": i1$3,
  },
  "pages": {
    "$live/pages/LivePage.tsx": i1$$0,
  },
  "matchers": {
    "$live/matchers/MatchAlways.ts": i1$$$$0,
    "$live/matchers/MatchDate.ts": i1$$$$1,
    "$live/matchers/MatchEnvironment.ts": i1$$$$2,
    "$live/matchers/MatchMulti.ts": i1$$$$3,
    "$live/matchers/MatchRandom.ts": i1$$$$4,
    "$live/matchers/MatchSite.ts": i1$$$$5,
    "$live/matchers/MatchUserAgent.ts": i1$$$$6,
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
