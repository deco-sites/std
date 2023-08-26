import type { LoaderFunction } from "deco/types.ts";
import { createClient } from "../commerce/butterCMS/client.ts";
import { toFeaturedPlaces } from "../commerce/butterCMS/transform.ts";
import type {
  BlogSectionPlaces,
  StateButterCMS,
} from "../commerce/butterCMS/types.ts";

/**
 * @title Butter CMS Featured Places Loader
 * @description Useful for listing places
 */
const featuredPlacesLoader: LoaderFunction<
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
    data.fields.sections.find((section) => section.type === "featured_places")!
      .fields;

  return { data: toFeaturedPlaces(section) as BlogSectionPlaces };
};

export default featuredPlacesLoader;
