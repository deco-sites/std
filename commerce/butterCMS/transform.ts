import type { BlogSection, Fields, OmitedFields, Preview } from "./types.ts";

const getFieldValue = ({ ...fields }: OmitedFields) => {
  return Object.values(fields)[0].map((field: Fields) =>
    Object.values(field)[0]
  );
};

export const toFeaturedPosts = ({ title, ...fields }: Fields): BlogSection => {
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
