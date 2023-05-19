import { context } from "$live/live.ts";
import { ensureFile } from "std/fs/mod.ts";
import { cyan } from "std/fmt/colors.ts";
import postcss, { PluginCreator } from "npm:postcss@8.4.22";
import autoprefixer from "npm:autoprefixer@10.4.14";
import tailwindcss, { Config as TailwindConfig } from "npm:tailwindcss@3.3.1";
import cssnano from "npm:cssnano@6.0.0";
import type { Handlers } from "$fresh/server.ts";

const TO = "./.frsh/tailwind.css";
const FROM = "./tailwind.css";
const DEFAULT_OPTIONS = {
  content: ["./**/*.tsx"],
  theme: {},
};
const DEFAULT_TAILWIND_CSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

let onBundle: undefined | (() => void);
const bundle = context.isDeploy
  ? Promise.resolve()
  : new Promise<void>((r) => onBundle = r);

const dev = async (
  partialConfig: Partial<TailwindConfig> = DEFAULT_OPTIONS,
) => {
  const start = performance.now();
  const config = { ...DEFAULT_OPTIONS, ...partialConfig };

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

  onBundle?.();
};

export const handler: Handlers = {
  GET: async () => {
    await bundle;

    try {
      const [stats, file] = await Promise.all([Deno.lstat(TO), Deno.open(TO)]);

      return new Response(file.readable, {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Type": "text/css; charset=utf-8",
          "Content-Length": `${stats.size}`,
        },
      });
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return new Response(null, { status: 404 });
      }

      return new Response(null, { status: 500 });
    }
  },
};

export default dev;
