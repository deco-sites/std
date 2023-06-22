import Metatags from "./Metatags.tsx";
import type { LoaderReturnType } from "$live/types.ts";
import { DEFAULT_CATEGORY_SEPARATOR } from "deco-sites/std/commerce/utils.ts";
import type { ProductDetailsPage } from "../../commerce/types.ts";

export interface Props {
  /**
   * @title Title template
   * @description add a %s whenever you want it to be replaced with the product name
   * @default %s | Deco.cx
   */
  titleTemplate?: string;
  /** @title Page title override */
  title?: string;
  /** @title Meta tag description override */
  description?: string;
  page: LoaderReturnType<ProductDetailsPage | null>;
  structuredData?: {
    useDataFromSEO?: boolean;
  };
}

const SeoPDP = (props: Props) => {
  const context = (function prepareProductForStructuredData() {
    if (!props.page?.product) {
      return props.page;
    }

    const product = props.page?.product;

    // For "Calçados>Masculino>Chinelos & Sandálias", only returns "Chinelos & Sandálias"
    const lastCategory =
      product.category?.split(DEFAULT_CATEGORY_SEPARATOR).reverse()[0];

    return {
      ...props.page,
      product: {
        ...product,
        category: lastCategory,
        ...(props.structuredData?.useDataFromSEO && {
          name: props.page?.seo?.title,
          description: props.page?.seo?.description,
        }),
      },
    } as ProductDetailsPage;
  })();

  return <Metatags {...props} context={context} />;
};

export default SeoPDP;
