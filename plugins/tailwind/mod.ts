import type { Handlers, Plugin } from "$fresh/server.ts";
import { Context, context } from "deco/deco.ts";
import { join } from "std/path/mod.ts";
import {
  bundle,
  Config,
  expandConfigContent,
  loadTailwindConfig,
} from "./bundler.ts";

export type { Config } from "./bundler.ts";

let mode: "prod" | "dev" = "prod";
const root: string = Deno.cwd();

const FROM = "./tailwind.css";
const TO = () => join(root, "static", FROM);

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

export const handler: Handlers = {
  GET: safe(async () => {
    const [stats, file] = await Promise.all([
      Deno.lstat(TO()),
      Deno.open(TO()),
    ]);

    return new Response(file.readable, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "text/css; charset=utf-8",
        "Content-Length": `${stats.size}`,
      },
    });
  }),
};

const createHandler = async (config: Config): Promise<Handlers> => {
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

  // Reads all files into memory
  await expandConfigContent(config, root);

  return {
    GET: safe(async () => {
      const active = Context.active();
      const revision = await active.release?.revision() || "";

      let css = lru.get(revision);

      if (!css) {
        const state = await active.release?.state({ forceFresh: true });

        const content = Array.isArray(config.content)
          ? [...config.content, {
            raw: JSON.stringify(state),
            extension: "json",
          }]
          : config.content;

        css = await bundle({
          from: FROM,
          mode,
          config: { ...config, content },
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
  };
};

/**
 * Since Deno Deploy does not allow dynamic import, importing the config file
 * automatically is not yet possible.
 *
 * Pass the config directly to use the new dynamic features. Pass undefined
 * if you wish to have the old behavior
 */
export const plugin = (config?: Config): Plugin => {
  const routes: Plugin["routes"] = [];

  const build = async () => {
    const config = await loadTailwindConfig(root);
    const css = await bundle({ from: FROM, mode: "prod", config });
    await Deno.writeTextFile(TO(), css);
  };

  return {
    name: "tailwind",
    routes,
    configResolved: async (fresh) => {
      mode = fresh.dev ? "dev" : "prod";

      // Compatiblity mode on localhost
      if (!context.isDeploy && !config) {
        await build();
      }

      routes.push({
        path: "/styles.css",
        handler: config
          // New dynamic generation
          ? await createHandler(config)
          // Compatiblity mode
          : handler,
      });
    },
    // Compatibility mode. Only runs when config is not set directly
    buildStart: build,
  };
};
