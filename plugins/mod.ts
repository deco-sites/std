import type { Plugin } from "$fresh/server.ts";
import { plugin as tailwindPlugin } from "./tailwind/mod.ts";

export const plugin = (): Plugin => ({
  ...tailwindPlugin,
  name: "deco-sites/std",
});
