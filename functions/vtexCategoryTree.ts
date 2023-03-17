import { LiveState, LoaderFunction } from "$live/types.ts";
import { Categories, CategoriesReturn } from "../commerce/types.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";

export interface Props {
  /**
   * @description Number of levels of categories to be returned
   *  @default 2
   */
  levels?: number;
  /**
   * @description Order of the categories to show, if you want to hide a category, just add the name of the category and set the hideCategory to true;
   */
  categoriesOrder?: CategoriesOrder[];
}

export interface CategoriesOrder {
  name: string;
  hideCategory?: boolean;
}

const categoryTree: LoaderFunction<
  Props,
  CategoriesReturn | null,
  LiveState<{ configVTEX: ConfigVTEX }>
> = withISFallback(async (_, ctx, { levels = 2, categoriesOrder = [] }) => {
  const vtex = createClient(ctx.state.global.configVTEX);
  const categories = await vtex.catalog_system.categoryTree({
    categoryLevels: levels,
  });

  const categoriesArray = categories as unknown as Categories[];

  const categoriesIndexed: Record<string, boolean> = categoriesOrder.reduce(
    (categoryIndexed, { name, hideCategory }) => {
      return {
        ...categoryIndexed,
        [name.toLowerCase().replace(/\s+/g, "-")]: Boolean(hideCategory),
      };
    },
    {},
  );

  /*
   Description(lfroes):
   This function work to reverse the order of the categories,
   if you want to hide a category, just add the name of the category and set the hideCategory to true;
  */

  const finalCategories = categoriesArray.filter((category) => {
    const categoryName = category.name.toLowerCase().replace(/\s+/g, "-");
    const hideCategory = categoriesIndexed[categoryName];
    if (hideCategory) {
      category.hidden = true;
    }
    return !hideCategory;
  }).sort((a, b) => {
    const indexA = categoriesOrder.findIndex((category) =>
      category.name.toLowerCase().replace(/\s+/g, "-") ===
        a.name.toLowerCase().replace(/\s+/g, "-")
    );
    const indexB = categoriesOrder.findIndex((category) =>
      category.name.toLowerCase().replace(/\s+/g, "-") ===
        b.name.toLowerCase().replace(/\s+/g, "-")
    );
    return indexA - indexB;
  });

  return {
    data: {
      showCategories: finalCategories,
      allCategories: categoriesArray,
    },
  };
});

export default categoryTree;
