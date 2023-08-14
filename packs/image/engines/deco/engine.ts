import { createEngine } from "../remote/engine.ts";

const ikid = Deno.env.get("DECO_IK_ID") ?? "decocx";

export const engine = createEngine({
  name: "deco",

  accepts: () => true,

  urlFromParams: (params) => {
    const { src, width, height, quality } = params;

    const tr = [
      width && `w-${width}`,
      height && `h-${height}`,
      quality && `q-${quality}`,
    ].filter(Boolean).join(",");

    return new URL(`https://ik.imagekit.io/${ikid}/tr:${tr}/${src}`);
  },
});
