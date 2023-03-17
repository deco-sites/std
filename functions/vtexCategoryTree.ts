import { LiveState, LoaderFunction } from "$live/types.ts";
import { Categories } from "../commerce/types.ts";
import { ConfigVTEX, createClient } from "../commerce/vtex/client.ts";
import { withISFallback } from "../commerce/vtex/withISFallback.ts";

export interface Props {
  levels?: number; // Make levels optional
  categoriesOrder?: CategoriesOrder[];
}

export interface CategoriesOrder {
  name: string;
  hideCategory?: boolean;
}

const categoryTree: LoaderFunction<Props, Categories[] | null, LiveState<{ configVTEX: ConfigVTEX }>> = withISFallback(async (_, ctx, { levels = 2, categoriesOrder = [] }) => {
  const vtex = createClient(ctx.state.global.configVTEX);
  const categories = await vtex.catalog_system.categoryTree({ categoryLevels: levels });

  const categoriesArray = categories as unknown as Categories[];

  categoriesArray.map((category) => {
    category.name = category.name.toLowerCase().replace(/\s+/g, "-");
  });

  categoriesArray.forEach((category) => {
    category.name = category.name.toLowerCase().replace(/-/g, " ");
  });

  const finalCategories = categoriesArray.filter((category) => !category.hidden);

  if (categoriesOrder.length > 0) {
    const reversedCategoriesOrder = [...categoriesOrder].reverse();

    reversedCategoriesOrder.forEach((category) => {
      const index = finalCategories.findIndex((item) => item.name.toLowerCase().replace(/\s+/g, "-") === category.name.toLowerCase().replace(/\s+/g, "-"));

      if (index !== -1) {
        finalCategories[index].hidden = category.hideCategory;
        const [item] = finalCategories.splice(index, 1);
        finalCategories.unshift(item);
      }
    });
  }

  return {
    data: finalCategories,
  };
});

export default categoryTree;
