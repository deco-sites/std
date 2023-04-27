import { cyan } from "std/fmt/colors.ts";
import postcss, { PluginCreator } from "npm:postcss@8.4.22";
import autoprefixer from "npm:autoprefixer@10.4.14";
import tailwindcss, { Config as TailwindConfig } from "npm:tailwindcss@3.3.1";
import cssnano from "npm:cssnano@6.0.0";

const FROM = "./tailwind.css";
const TO = "./static/tailwind.css";
const DEFAULT_OPTIONS = {
  content: ["./**/*.tsx"],
  theme: {},
};
const DEFAULT_TAILWIND_CSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

const dev = async (
  partialConfig: Partial<TailwindConfig> = DEFAULT_OPTIONS,
) => {
  const config = { ...DEFAULT_OPTIONS, ...partialConfig };
  const start = performance.now();

  const processor = postcss([
    (tailwindcss as PluginCreator)(config),
    autoprefixer(),
    cssnano({ preset: ["default", { cssDeclarationSorter: false }] }),
  ]);

  const css = await Deno.readTextFile(FROM).catch((_) => DEFAULT_TAILWIND_CSS);
  const content = await processor.process(css, { from: FROM, to: TO });
  await Deno.writeTextFile(TO, content.css);

  console.info(
    `${cyan("TailwindCSS v3")} generation took: ${
      (performance.now() - start).toFixed(0)
    }ms`,
  );
};

export default dev;
