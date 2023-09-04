import type { LoaderFunction } from "deco/types.ts";
import { createClient } from "../commerce/butterCMS/client.ts";
import { toFeaturedPlaces } from "../commerce/butterCMS/transform.ts";
import type {
  BlogSectionPlaces,
  StateButterCMS,
} from "../commerce/butterCMS/types.ts";

/**
 * @title Butter CMS Featured Brands Loader
 * @description Useful for list featured blog's brands.
 */
const featuredBrandsLoader: LoaderFunction<
  null,
  BlogSectionPlaces,
  StateButterCMS
> = async (
  _req,
  ctx,
) => {
  const { global: { configButterCMS } } = ctx.state;
  const client = createClient(configButterCMS);

  const { data } = await client.pages();

  const section =
    data.fields.sections.find((section) => section.type === "featured_brands")!
      .fields;

  return { data: toFeaturedPlaces(section) as BlogSectionPlaces };
};

export default featuredBrandsLoader;
