import { LoaderFunction } from "$live/types.ts";
import { HttpError } from "../../utils/HttpError.ts";

const message = `
// ****************************************************************************
// WARNING!
// ****************************************************************************

Intelligent Search is NOT installed in your VTEX account. You can either:

  * Install Intelligent Search API in your VTEX account by typing \`vtex install vtex.intelligent-search-api\`
  * Use the VTEX Legacy Search API provided by Deco by using the vtexLegacy*.ts loaders. To use these loaders, go to your Deco admin and change the loaders

// ****************************************************************************
`;

export const withISFallback = <Props, Data, State>(
  loader: LoaderFunction<Props, Data, State>,
): LoaderFunction<Props, Data | null, State> =>
async (req, ctx, props) => {
  try {
    return await loader(req, ctx, props);
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) {
      console.warn(message);

      return {
        data: null,
        status: 404,
      };
    }

    throw err;
  }
};
