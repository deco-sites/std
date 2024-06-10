import type { Plugin } from "$fresh/server.ts";
import { Context } from "deco/deco.ts";
import { walk } from "std/fs/walk.ts";
import { join, toFileUrl } from "std/path/mod.ts";
import { bundle, Config, loadTailwindConfig } from "./bundler.ts";
import { resolveDeps } from "./deno.ts";
export type { Config } from "./bundler.ts";

const root: string = Deno.cwd();

const TAILWIND_FILE = "./tailwind.css";

const safe = (cb: () => Promise<Response>) => async () => {
  try {
    return await cb();
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return new Response(null, { status: 404 });
    }

    const errStack = Deno.inspect(error, { colors: false, depth: 100 });
    console.error(`error generating styles`, errStack);
    return new Response(errStack, {
      status: 500,
    });
  }
};

// Magical LRU implementation using JavaScript internals
const LRU = (size: number) => {
  const cache = new Map<string, string>();

  return {
    has: (key: string) => cache.has(key),
    get: (key: string): string | undefined => {
      const value = cache.get(key);

      // Update LRU index
      if (value) {
        cache.set(key, value);
      }

      return value;
    },
    set: (key: string, value: string) => {
      // Housekeep index
      if (cache.size >= size && !cache.has(key)) {
        cache.delete(cache.keys().next().value);
      }
      cache.set(key, value);
    },
  };
};

const lru = LRU(10);

const migration = `
🚀 Upgrade to the Latest TailwindCSS Plugin Version

You're currently using the compatibility mode of the TailwindCSS plugin, follow these steps to seamlessly migrate to the new version:

1. Open your "fresh.config.ts" file and replace its content with the following:
// fresh.config.ts
import { defineConfig } from "$fresh/server.ts";
import plugins from "../std/plugins/mod.ts";
import manifest from "./manifest.gen.ts";
import tailwind from "./tailwind.config.ts";

export default defineConfig({
  plugins: plugins({
    manifest,
    // deno-lint-ignore no-explicit-any
    tailwind: tailwind as any,
  }),
});


2. Remove the existing 'tailwind.css' file from the 'static' directory using the command:
rm static/tailwind.css

👏 That's it! You've successfully migrated to the new version. Thank you for keeping your project up-to-date! 
`;

const withReleaseContent = async (config: Config) => {
  const allTsxFiles = new Map<string, string>();

  // init search graph with local FS
  const roots = new Set<string>();

  for await (
    const entry of walk(Deno.cwd(), {
      includeDirs: false,
      includeFiles: true,
    })
  ) {
    if (entry.path.endsWith(".tsx") || entry.path.includes("/apps/")) {
      roots.add(toFileUrl(entry.path).href);
    }
  }

  const start = performance.now();
  await resolveDeps([...roots.values()], allTsxFiles);
  const duration = (performance.now() - start).toFixed(0);

  console.log(
    ` 🔍 TailwindCSS resolved ${allTsxFiles.size} dependencies in ${duration}ms`,
  );

  return {
    ...config,
    content: [...allTsxFiles.values()].map((content) => ({
      raw: content,
      extension: "tsx",
    })),
  };
};

/**
 * Since Deno Deploy does not allow dynamic import, importing the config file
 * automatically is not yet possible.
 *
 * Pass the config directly to use the new dynamic features. Pass undefined
 * if you wish to have the old behavior
 */
export const plugin = (config?: Config & { verbose?: boolean }): Plugin => {
  const routes: Plugin["routes"] = [];

  if (!config) {
    console.warn(migration);
  }

  return {
    name: "deco-tailwind",
    routes,
    configResolved: (fresh) => {
      const TO = join(fresh.staticDir, TAILWIND_FILE);
      const isDev = fresh.dev || Deno.env.get("DECO_PREVIEW");
      const mode = isDev ? "dev" : "prod";

      // Set the default revision CSS so we don't have to rebuild what CI has built
      const getCSSEager = () =>
        Deno.readTextFile(TO).catch(() =>
          `Missing TailwindCSS file in production. Make sure you are building the file on the CI`
        );

      const getCSSLazy = async () => {
        const ctx = Context.active();
        const revision = await ctx.release?.revision() || "";

        if (!lru.has(revision) && config) {
          const css = await bundle({
            from: TAILWIND_FILE,
            mode,
            config: await withReleaseContent(config),
          });

          lru.set(revision, css);
        }

        return lru.get(revision)!;
      };

      const getCSS = mode === "prod" ? getCSSEager : getCSSLazy;

      routes.push({
        path: "/styles.css",
        handler: safe(async () =>
          new Response(await getCSS(), {
            headers: {
              "Cache-Control": "public, max-age=31536000, immutable",
              "Content-Type": "text/css; charset=utf-8",
            },
          })
        ),
      });
    },
    // Compatibility mode. Only runs when config is not set directly
    buildStart: async ({ staticDir }) => {
      const css = await bundle({
        from: TAILWIND_FILE,
        mode: "prod",
        config: config || await loadTailwindConfig(root),
      });
      await Deno.writeTextFile(join(staticDir, TAILWIND_FILE), css);
    },
  };
};
