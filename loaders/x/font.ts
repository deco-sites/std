import type { Manifest } from "deco-sites/std/live.gen.ts";

export { default } from "deco-sites/std/packs/font/loaders/font.ts";
export const PATH: `/live/invoke/${keyof Manifest["loaders"]}` =
  "/live/invoke/deco-sites/std/loaders/x/font.ts";
