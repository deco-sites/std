import type { Manifest } from "deco-sites/std/live.gen.ts";
import { withFontServer } from "deco-sites/std/utils/withFontServer.ts";

const PATH: `/live/invoke/${keyof Manifest["loaders"]}` =
  "/live/invoke/deco-sites/std/loaders/x/font.ts";
export const toFontServer = (fontFaceSheet: string) =>
  withFontServer(fontFaceSheet, PATH);

export { default } from "deco-sites/std/packs/font/loaders/font.ts";
