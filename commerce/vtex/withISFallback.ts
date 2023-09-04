import { LoaderFunction } from "deco/types.ts";
import { HttpError } from "../../utils/HttpError.ts";

const message = `
// ****************************************************************************
// WARNING!
// ****************************************************************************

Intelligent Search is NOT installed in your VTEX account. You can either:

  * Install Intelligent Search API in your VTEX account. More info at https://www.deco.cx/docs/en/tutorials/installing-vtex-is
  * Use the VTEX Legacy Search API provided by Deco by using the vtexLegacy*.ts loaders. To learn more about loaders: https://www.deco.cx/docs/en/concepts/loader

// ****************************************************************************
`;

let run = true;

export const withISFallback = <Props, Data, State>(
  loader: LoaderFunction<Props, Data, State>,
): LoaderFunction<Props, Data | null, State> =>
async (req, ctx, props) => {
  try {
    return await loader(req, ctx, props);
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) {
      if (run) {
        run = false;
        console.warn(message);
      }

      return {
        data: null,
        status: 404,
      };
    }

    throw err;
  }
};
