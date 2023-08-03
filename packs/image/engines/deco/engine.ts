import { createEngine } from "../remote/engine.ts";

export const engine = createEngine({
  name: "deco",

  accepts: () => true,

  urlFromParams: (params) => {
    const url = new URL("https://deco-images.deco-cx.workers.dev");

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    return url;
  },
});
