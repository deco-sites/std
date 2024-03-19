import type { Plugin } from "$fresh/server.ts";
import { Context } from "deco/deco.ts";
import { join } from "std/path/mod.ts";
import { bundle, Config, loadTailwindConfig } from "./bundler.ts";
import { VFS } from "deco/runtime/fs/mod.ts";

export type { Config } from "./bundler.ts";

const root: string = Deno.cwd();

const FROM = "./tailwind.css";
const TO = join("static", FROM);

const safe = (cb: () => Promise<Response>) => async () => {
  try {
    return await cb();
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return new Response(null, { status: 404 });
    }

    return new Response(Deno.inspect(error, { colors: false, depth: 100 }), {
      status: 500,
    });
  }
};

// Magical LRU implementation using JavaScript internals
const LRU = (size: number) => {
  const cache = new Map<string, string>();

  return {
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

/**
 * Since Deno Deploy does not allow dynamic import, importing the config file
 * automatically is not yet possible.
 *
 * Pass the config directly to use the new dynamic features. Pass undefined
 * if you wish to have the old behavior
 */
export const plugin = (config?: Config): Plugin => {
  const routes: Plugin["routes"] = [];

  if (!config) {
    console.warn(migration);
  }

  return {
    name: "deco-tailwind",
    routes,
    configResolved: async (fresh) => {
      const mode = fresh.dev ? "dev" : "prod";
      const ctx = Context.active();

      const withReleaseContent = (config: Config) => {
        const ctx = Context.active();
        const vfs = ctx.fs;
        if (!vfs || !(vfs instanceof VFS)) {
          return config;
        }

        const allTsxFiles = [];
        for (const [path, file] of Object.entries(vfs.fileSystem)) {
          if (path.endsWith(".tsx") && file.content) {
            allTsxFiles.push(file.content);
          }
        }

        return {
          ...config,
          content: allTsxFiles.map((content) => ({
            raw: content,
            extension: "tsx",
          })),
        };
      };

      const css =
        // We have built on CI
        (await Deno.readTextFile(TO).catch(() => null)) ||
        // We are on localhost
        (await bundle({
          from: FROM,
          mode,
          config: config
            ? withReleaseContent(config)
            : await loadTailwindConfig(root),
        }).catch(() => ""));

      // Set the default revision CSS so we don't have to rebuild what CI has built
      lru.set(await ctx.release?.revision() || "", css);

      routes.push({
        path: "/styles.css",
        handler: safe(async () => {
          const ctx = Context.active();
          const revision = await ctx.release?.revision() || "";

          let css = lru.get(revision);

          // Generate styles dynamically
          if (!css && config) {
            css = await bundle({
              from: FROM,
              mode,
              config: withReleaseContent(config),
            });

            lru.set(revision, css);
          }

          return new Response(css, {
            headers: {
              "Cache-Control": "public, max-age=31536000, immutable",
              "Content-Type": "text/css; charset=utf-8",
            },
          });
        }),
      });
    },
    // Compatibility mode. Only runs when config is not set directly
    buildStart: async () => {
      const css = await bundle({
        from: FROM,
        mode: "prod",
        config: config || await loadTailwindConfig(root),
      });
      await Deno.writeTextFile(TO, css);
    },
  };
};
