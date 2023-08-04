import { createEngine } from "../remote/engine.ts";

const endpoint = Deno.env.get("DECO_IMAGE_ENDPOINT") ??
  "https://deco-images.deco-cx.workers.dev";

export const engine = createEngine({
  name: "deco",

  accepts: () => true,

  urlFromParams: (params) => {
    const url = new URL(endpoint);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    return url;
  },
});
