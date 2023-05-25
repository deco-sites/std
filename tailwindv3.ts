import { ensureFile } from "std/fs/mod.ts";
import { cyan } from "std/fmt/colors.ts";
import postcss, { PluginCreator } from "npm:postcss@8.4.23";
import autoprefixer from "npm:autoprefixer@10.4.14";
import tailwindcss, { Config as TailwindConfig } from "npm:tailwindcss@3.3.2";
import cssnano from "npm:cssnano@6.0.0";
import { FROM, tailwindBundle, TO } from "./routes/styles.css.ts";

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
  partialConfig?: Partial<TailwindConfig>,
) => {
  const start = performance.now();

  // Try to recover config from default file, a.k.a tailwind.config.ts
  const config = partialConfig
    ? { ...DEFAULT_OPTIONS, ...partialConfig }
    : await import(`${Deno.cwd()}/tailwind.config.ts`)
      .then((mod) => mod.default)
      .catch(() => DEFAULT_OPTIONS);

  const processor = postcss([
    (tailwindcss as PluginCreator)(config),
    autoprefixer(),
    cssnano({ preset: ["default", { cssDeclarationSorter: false }] }),
  ]);

  const css = await Deno.readTextFile(FROM).catch((_) => DEFAULT_TAILWIND_CSS);
  const content = await processor.process(css, { from: FROM, to: TO });

  await ensureFile(TO);
  await Deno.writeTextFile(TO, content.css, { create: true });

  console.info(
    `🎨 Tailwind css ready in ${
      cyan(`${((performance.now() - start) / 1e3).toFixed(1)}s`)
    }`,
  );

  tailwindBundle.resolve();
};

export default dev;
