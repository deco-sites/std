import autoprefixer from "npm:autoprefixer@10.4.14";
import cssnano from "npm:cssnano@6.0.1";
import postcss from "npm:postcss@8.4.27";
import tailwindcss from "npm:tailwindcss@3.3.3";
import { cyan } from "std/fmt/colors.ts";
import { ensureFile } from "std/fs/mod.ts";
import { join, toFileUrl } from "std/path/mod.ts";

const DEFAULT_OPTIONS = {
  content: ["./**/*.tsx"],
  theme: {},
};

const DEFAULT_TAILWIND_CSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

export const bundle = async ({ to, from }: { to: string; from: string }) => {
  const start = performance.now();

  // Try to recover config from default file, a.k.a tailwind.config.ts
  const config = await import(
    toFileUrl(join(Deno.cwd(), "tailwind.config.ts")).href
  )
    .then((mod) => mod.default)
    .catch((error) => {
      console.error(error);
      return DEFAULT_OPTIONS;
    });

  const processor = postcss([
    // deno-lint-ignore no-explicit-any
    (tailwindcss as any)(config),
    autoprefixer(),
    cssnano({ preset: ["default", { cssDeclarationSorter: false }] }),
  ]);

  const css = await Deno.readTextFile(from).catch((_) => DEFAULT_TAILWIND_CSS);
  const content = await processor.process(css, { from, to });

  await ensureFile(to);
  await Deno.writeTextFile(to, content.css, { create: true });

  console.info(
    ` 🎨 Tailwind css ready in ${
      cyan(`${((performance.now() - start) / 1e3).toFixed(1)}s`)
    }`,
  );
};
