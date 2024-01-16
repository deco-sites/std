import autoprefixer from "npm:autoprefixer@10.4.14";
import cssnano from "npm:cssnano@6.0.1";
import postcss from "npm:postcss@8.4.27";
import tailwindcss, { type Config } from "npm:tailwindcss@3.4.1";
import processTailwindFeatures from "npm:tailwindcss@3.4.1/lib/processTailwindFeatures.js";
import resolveConfig from "npm:tailwindcss@3.4.1/lib/public/resolve-config.js";
import { cyan } from "std/fmt/colors.ts";
import { join, toFileUrl } from "std/path/mod.ts";
import { globToRegExp, normalizeGlob } from "std/path/glob.ts";
import { walk } from "std/fs/walk.ts";
import { extname } from "std/path/mod.ts";

const DEFAULT_CONFIG: Config = {
  content: ["./**/*.tsx"],
  theme: {},
};

const DEFAULT_TAILWIND_CSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

// Try to recover config from default file, a.k.a tailwind.config.ts
const loadConfig = () =>
  import(toFileUrl(join(Deno.cwd(), "tailwind.config.ts")).href)
    .then((mod) => mod.default)
    .catch(() => DEFAULT_CONFIG);

interface Options {
  from: string;
}

export const bundle = async ({ from }: Options) => {
  const start = performance.now();

  const config = await loadConfig();

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

export const watcher = async ({ from }: Options) => {
  const config = resolveConfig.default(await loadConfig());

  const state = { context: null };

  let changedContent = [];

  const tailwindPlugin = () => ({
    postcssPlugin: "tailwindcss",
    async Once(root, { result }) {
      console.time("Compiling CSS");

      const glob = globToRegExp(normalizeGlob("./**/*.tsx"), {
        globstar: true,
      });
      for await (const entry of walk(Deno.cwd())) {
        if (entry.isFile && glob.test(entry.path)) {
          changedContent.push({
            file: entry.path,
            extension: extname(entry.name).slice(1),
          });
        }
      }

      await processTailwindFeatures.default(({ createContext }) => {
        console.log(changedContent.length);

        state.context = createContext(config, changedContent);

        changedContent = [];

        return () => state.context;
      })(root, result);

      console.timeEnd("Compiling CSS");
    },
  });

  tailwindPlugin.postcss = true;

  const processor = postcss([
    tailwindPlugin,
    autoprefixer(),
    cssnano({ preset: ["default", { cssDeclarationSorter: false }] }),
  ]);

  const css = await Deno.readTextFile(from).catch((_) => DEFAULT_TAILWIND_CSS);

  return {
    process: async () => {
      const start = performance.now();

      const res = await processor.process(css, { from }).then((res) => res.css);

      console.info(
        ` 🎨 Tailwind css ready in ${
          cyan(`${((performance.now() - start) / 1e3).toFixed(1)}s`)
        }`,
      );

      return res;
    },
    setChangedContent: (cc) => {
      changedContent.push(cc);
    },
  };
};
