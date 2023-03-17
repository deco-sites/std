import { LiveState, LoaderFunction } from "$live/types.ts";
import { Categories } from "../commerce/types.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";

export interface Props {
  /**
   * @description number of categories levels to be returned
   * @default 2
   *
   */
  levels: number;
  /**
   * @description order of categories
   *
   *
   **/
  categoriesOrder: CategoriesOrder[];
}

export interface CategoriesOrder {
  name: string;
  hideCategory?: boolean;
}

// TODO: Optimize this function later

const categoryTree: LoaderFunction<
  Props,
  Categories[] | null,
  LiveState<{ configVTEX: ConfigVTEX }>
> = withISFallback(async (_, ctx, { levels, categoriesOrder }) => {
  const vtex = createClient(ctx.state.global.configVTEX);
  const categories = await vtex.catalog_system.categoryTree({
    categoryLevels: levels,
  });
  console.log(categoriesOrder);

  const categoriesArray = categories as unknown as Array<Categories>;

  categoriesArray.forEach((category) => {
    category.name = category.name.toLowerCase().replace(/\s+/g, "-");
  });

  categoriesOrder.reverse().forEach((category) => {
    const index = categoriesArray.findIndex(
      (item) =>
        item.name.toLowerCase().replace(/\s+/g, "-") ===
        category.name.toLowerCase().replace(/\s+/g, "-")
    );
    if (index !== -1) {
      categoriesArray[index].hidden = category.hideCategory;
      const [item] = categoriesArray.splice(index, 1);
      categoriesArray.unshift(item);
    }
  });

  categoriesArray.forEach((category) => {
    category.name = category.name.replace(/-/g, " ");
  });

  const finalCategories = categoriesArray.filter(
    (category) => !category.hidden
  );

  return {
    data: finalCategories,
  };
});

export default categoryTree;
