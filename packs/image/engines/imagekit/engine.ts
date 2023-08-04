import { createEngine } from "../remote/engine.ts";

export const engine = createEngine({
  name: "imagekit",

  accepts: () => true,

  urlFromParams: ({ src, width, height }) =>
    new URL(
      `https://ik.imagekit.io/decocx/tr:w-${width},h-${height}/${src}`,
    ),
});
