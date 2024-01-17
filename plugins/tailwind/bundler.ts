import { Context } from "deco/deco.ts";
import autoprefixer from "npm:autoprefixer@10.4.14";
import cssnano from "npm:cssnano@6.0.1";
import postcss from "npm:postcss@8.4.27";
import tailwindcss, { type Config } from "npm:tailwindcss@3.4.1";
import { cyan } from "std/fmt/colors.ts";
import { walk } from "std/fs/walk.ts";
import { globToRegExp, normalizeGlob } from "std/path/glob.ts";
import { extname, join, toFileUrl } from "std/path/mod.ts";

const DEFAULT_CONFIG: Config = {
  content: ["./**/*.tsx"],
  theme: {},
};

const DEFAULT_TAILWIND_CSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

const root = Deno.cwd();

// Try to recover config from default file, a.k.a tailwind.config.ts
const loadConfig = (): Promise<Config> =>
  import(toFileUrl(join(root, "tailwind.config.ts")).href)
    .then((mod) => mod.default)
    .catch(() => DEFAULT_CONFIG);

const setContextContent = async (config: Config) => {
  if (!Array.isArray(config.content)) {
    console.warn(
      "TailwindCSS config.content is not an array. Skipping deco.cx optimizations and 'files' integration",
    );

    return;
  }

  const active = Context.active();
  const state = await active.release?.state({ forceFresh: true });

  const content: Config["content"] = [{
    raw: JSON.stringify(state),
    extension: "json",
  }];

  // Expands glob and read file contents. It's faster this way than letting tailwind do this
  for (const c of config.content) {
    if (typeof c === "string") {
      const glob = globToRegExp(normalizeGlob(c), {
        globstar: true,
      });

      const paths: string[] = [];
      for await (const entry of walk(root)) {
        if (entry.isFile && glob.test(entry.path)) {
          paths.push(entry.path);
        }
      }

      const cs = await Promise.all(paths.map(async (path) => {
        const text = await Deno.readTextFile(path);

        return {
          raw: text,
          extension: extname(path).slice(1),
        };
      }));

      for (const c of cs) {
        content.push(c);
      }
    } else {
      content.push(c);
    }
  }
  console.log({ config });

  config.content = content;
};

export const bundle = async (
  { from }: { from: string },
) => {
  const start = performance.now();

  const config = await loadConfig();

  // Read file contents and merge with it with release
  await setContextContent(config);

  const processor = postcss([
    tailwindcss(config),
    autoprefixer(),
    cssnano({ preset: ["default", { cssDeclarationSorter: false }] }),
  ]);

  const css = await Deno.readTextFile(from).catch((_) => DEFAULT_TAILWIND_CSS);
  const content = await processor.process(css, { from });

  console.info(
    ` 🎨 Tailwind css ready in ${
      cyan(`${((performance.now() - start) / 1e3).toFixed(1)}s`)
    }`,
  );

  return content.css;
};
