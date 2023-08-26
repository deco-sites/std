import type { Plugin } from "$fresh/server.ts";
import { AppManifest } from "deco/mod.ts";
import decoPlugin, { Options } from "deco/plugins/deco.ts";
import * as colors from "std/fmt/colors.ts";
import { plugin as tailwindPlugin } from "./tailwind/mod.ts";

export const plugin = (): Plugin => {
  console.warn(
    colors.brightYellow(
      `deco-sites/std plugin has been deprecated, use default export instead. You must change your dev.ts and main.ts, check out the following examples\ndev.ts: ${
        colors.brightGreen(
          "https://github.com/deco-sites/std/blob/main/dev.ts#L14",
        )
      }\nmain.ts: ${
        colors.brightGreen(
          "https://github.com/deco-sites/std/blob/main/main.ts#L15",
        )
      }`,
    ),
  );
  return ({
    ...tailwindPlugin,
    name: "deco-sites/std",
  });
};

const plugins = <TManifest extends AppManifest = AppManifest>(
  opts?: Options<TManifest>,
): Plugin[] => {
  return [tailwindPlugin, decoPlugin(opts)];
};

export default plugins;
