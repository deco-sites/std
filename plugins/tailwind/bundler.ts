import autoprefixer from "npm:autoprefixer@10.4.14";
import cssnano from "npm:cssnano@6.0.1";
import postcss, { PluginCreator } from "npm:postcss@8.4.27";
import tailwindcss, { type Config } from "npm:tailwindcss@3.4.1";
import processTailwindFeatures from "npm:tailwindcss@3.4.1/lib/processTailwindFeatures.js";
import resolveConfig from "npm:tailwindcss@3.4.1/lib/public/resolve-config.js";
import { validateConfig } from "npm:tailwindcss@3.4.1/lib/util/validateConfig.js";
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
const loadConfig = () =>
  import(toFileUrl(join(root, "tailwind.config.ts")).href)
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

type Content = { file: string; extension: string } | {
  content: string;
  extension: string;
};

const resolveContent = async (config: Config) => {
  const resolved: Content[] = [];

  const content = Array.isArray(config.content)
    ? config.content
    : config.content.files;

  for (const c of content) {
    if (typeof c === "string") {
      const glob = globToRegExp(normalizeGlob(c), {
        globstar: true,
      });

      for await (const entry of walk(root)) {
        if (entry.isFile && glob.test(entry.path)) {
          resolved.push({
            file: entry.path,
            extension: extname(entry.name).slice(1),
          });
        }
      }
    } else {
      resolved.push({ content: c.raw, extension: c.extension || "html" });
    }
  }

  return resolved;
};

let w: undefined | {
  process: () => Promise<string>;
  setChangedContent: (c: Content[]) => void;
};

export const watcher = async ({ from }: Options) => {
  if (!w) {
    const config = validateConfig(resolveConfig.default(await loadConfig()));

    let queue = Promise.resolve<string>("");
    const initialContent = await resolveContent(config);

    // deno-lint-ignore no-explicit-any
    let context: undefined | any;

    const tailwindPlugin: PluginCreator<void> = () => ({
      postcssPlugin: "tailwindcss",
      async Once(root, { result }) {
        await processTailwindFeatures.default(
          (
            { createContext }: {
              createContext: (c: Config, cc: Content[]) => unknown;
            },
          ) => {
            context ||= createContext(config, initialContent);

            return () => context;
          },
        )(root, result);
      },
    });
    tailwindPlugin.postcss = true;

    const processor = postcss([
      tailwindPlugin,
      autoprefixer(),
      cssnano({ preset: ["default", { cssDeclarationSorter: false }] }),
    ]);

    const css = await Deno.readTextFile(from).catch((_) =>
      DEFAULT_TAILWIND_CSS
    );

    w = {
      setChangedContent: (c: Content[]) => {
        if (!context) {
          return;
        }

        context.changedContent = c;
      },
      process: () => {
        queue = queue.catch(() => null).then(async () => {
          const start = performance.now();

          const sheet = await processor.process(css, { from });

          console.info(
            ` 🎨 Tailwind css ready in ${
              cyan(`${((performance.now() - start) / 1e3).toFixed(1)}s`)
            }`,
          );

          return sheet.css;
        });

        return queue;
      },
    };
  }

  return w;
};
