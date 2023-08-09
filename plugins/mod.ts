import type { Plugin } from "$fresh/server.ts";
import decoPlugin from "$live/plugins/deco.ts";
import { plugin as tailwindPlugin } from "./tailwind/mod.ts";

export const plugin = (): Plugin => ({
  ...tailwindPlugin,
  name: "deco-sites/std",
});

const plugins = (): Plugin[] => {
  return [plugin(), decoPlugin()];
};

export default plugins;
