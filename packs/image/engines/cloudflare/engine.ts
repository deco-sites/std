import type { Engine } from "../../engine.ts";

export const engine: Engine = {
  name: `cloudflare`,

  resolve: (params, prefferedMediaType) => {
    const { fit, width, height, quality, src } = params;

    const format = prefferedMediaType?.replace("image/", "");

    return fetch(src, {
      // @ts-expect-error Only available when deployed into cloudflare workers
      cf: {
        image: { format, fit, width, height, quality },
      },
    });
  },

  // is Cloudflare worker
  accepts: () =>
    // deno-lint-ignore no-explicit-any
    typeof caches !== "undefined" && Boolean((caches as any).default),
};
