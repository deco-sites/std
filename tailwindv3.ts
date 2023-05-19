import { ensureFile } from "std/fs/mod.ts";
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
  postCSSConfig?: { from?: string | URL; to?: string | URL },
) => {
  const config = { ...DEFAULT_OPTIONS, ...partialConfig };
  const from = postCSSConfig?.from ?? FROM;
  const to = postCSSConfig?.to ?? TO;

  const processor = postcss([
    (tailwindcss as PluginCreator)(config),
    autoprefixer(),
    cssnano({ preset: ["default", { cssDeclarationSorter: false }] }),
  ]);

  const css = await Deno.readTextFile(from).catch((_) => DEFAULT_TAILWIND_CSS);
  const content = await processor.process(css, { from, to });

  await ensureFile(to).catch(() => console.log({ to }));
  await Deno.writeTextFile(to, content.css, { create: true });
};

export default dev;
