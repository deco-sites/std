import { Context } from "deco/deco.ts";
import autoprefixer from "npm:autoprefixer@10.4.14";
import cssnano from "npm:cssnano@6.0.1";
import postcss, { type AcceptedPlugin } from "npm:postcss@8.4.27";
import tailwindcss, { type Config } from "npm:tailwindcss@3.4.1";
import { cyan } from "std/fmt/colors.ts";
import { walk } from "std/fs/walk.ts";
import { globToRegExp, normalizeGlob } from "std/path/glob.ts";
import { extname, join, toFileUrl } from "std/path/mod.ts";

export { type Config } from "npm:tailwindcss@3.4.1";

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
export const loadTailwindConfig = (root: string): Promise<Config> =>
  import(toFileUrl(join(root, "tailwind.config.ts")).href)
    .then((mod) => mod.default)
    .catch(() => DEFAULT_CONFIG);

export const expandConfigContent = async (config: Config, root: string) => {
  if (!Array.isArray(config.content)) {
    console.warn(
      "TailwindCSS config.content is not an array. Skipping deco.cx optimizations and 'files' integration",
    );

    return;
  }

  const content: Config["content"] = [];

  // Expands glob and read file contents. It's faster this way than letting tailwind do this
  for (const c of config.content) {
    if (typeof c !== "string") {
      content.push(c);

      continue;
    }

    const glob = globToRegExp(normalizeGlob(c), {
      globstar: true,
    });

    const walker = walk(root, {
      includeDirs: false,
      includeFiles: true,
      match: [glob],
    });
    const paths: string[] = [];
    for await (const entry of walker) {
      paths.push(entry.path);
    }

    const cs = await Promise.all(paths.map(async (path) => ({
      raw: await Deno.readTextFile(path),
      extension: extname(path).slice(1),
    })));

    for (const c of cs) {
      content.push(c);
    }
  }

  config.content = content;
};

export const bundle = async (
  { from, mode, config }: {
    from: string;
    mode: "dev" | "prod";
    config: Config;
  },
) => {
  const start = performance.now();

  const plugins: AcceptedPlugin[] = [
    tailwindcss(config),
    autoprefixer(),
  ];

  if (mode === "prod") {
    plugins.push(
      cssnano({ preset: ["default", { cssDeclarationSorter: false }] }),
    );
  }

  const processor = postcss(plugins);

  const content = await processor.process(
    await Deno.readTextFile(from).catch((_) => DEFAULT_TAILWIND_CSS),
    { from: undefined },
  );

  console.info(
    ` 🎨 Tailwind css ready in ${
      cyan(`${((performance.now() - start) / 1e3).toFixed(1)}s`)
    }`,
  );

  return content.css;
};
