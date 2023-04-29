import type {
  Ad,
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
      meta: _,
      ...rest
    }: Preview) => ({
      image: featured_image,
      imageAlt: featured_image_alt,
      ...rest,
    })),
  };
};

export const toFeaturedAds = (
  { title, ...fields }: Fields,
): BlogSectionPosts => {
  const transformedFields = getFieldValue(fields);

  return {
    title,
    posts: transformedFields.map(({
      image_alt,
      url_slug,
      url_text,
      meta: _,
      ...rest
    }: Ad) => ({
      imageAlt: image_alt,
      slug: url_slug,
      ctaText: url_text,
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
      meta: _,
      ...rest
    }: Place) => ({
      slug: catalogue_slug,
      ...rest,
    })),
  };
};
