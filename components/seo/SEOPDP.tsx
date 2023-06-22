import Metatags from "./Metatags.tsx";
import type { LoaderReturnType } from "$live/types.ts";
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
  const context = (() => {
    if (props.structuredData?.useDataFromSEO) {
      return {
        ...props.page,
        product: {
          ...props.page?.product,
          name: props.page?.seo?.title,
          description: props.page?.seo?.description,
        },
      } as ProductDetailsPage;
    } else {
      return props.page;
    }
  })();

  return <Metatags {...props} context={context} />;
};

export default SeoPDP;
