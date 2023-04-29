import type {
  BlogSectionPlaces,
  BlogSectionPosts,
  Fields,
  OmitedFields,
  Place,
  Preview,
} from "./types.ts";

const getFieldValue = ({ ...fields }: OmitedFields) => {
  return Object.values(fields)[0].map((field: Fields) =>
    Object.values(field)[0]
  );
};

export const toFeaturedPosts = (
  { title, ...fields }: Fields,
): BlogSectionPosts => {
  const transformedFields = getFieldValue(fields);

  return {
    title,
    posts: transformedFields.map(({
      featured_image,
      featured_image_alt,
      meta: _meta, // unused field
      ...rest
    }: Preview) => ({
      image: featured_image,
      imageAlt: featured_image_alt,
      ...rest,
    })),
  };
};

export const toFeaturedPlaces = (
  { title, ...fields }: Fields,
): BlogSectionPlaces => {
  const transformedFields = getFieldValue(fields);

  return {
    title,
    places: transformedFields.map(({
      catalogue_slug,
      meta: _meta, // unused field
      ...rest
    }: Place) => ({
      slug: catalogue_slug,
      ...rest,
    })),
  };
};
