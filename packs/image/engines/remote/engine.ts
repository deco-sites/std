import { HttpError } from "../../../../utils/HttpError.ts";
import type { Engine, Params } from "../../engine.ts";

type ExternalEngine = {
  name: string;
  urlFromParams: (params: Params) => URL;
  accepts: (src: string) => boolean;
};

export const createEngine = (
  external: ExternalEngine,
): Engine => ({
  ...external,

  resolve: async (params, _preferredMediaType, req) => {
    const url = external.urlFromParams(params);

    const response = await fetch(url, { headers: new Headers(req.headers) });

    if (!response.ok) {
      throw new HttpError(502);
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "",
      },
    });
  },
});
