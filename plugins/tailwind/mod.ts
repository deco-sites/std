import type { Handlers, Plugin } from "$fresh/server.ts";
import { Context } from "deco/deco.ts";
import { bundle } from "./bundler.ts";

export const TO = "./static/tailwind.css";
export const FROM = "./tailwind.css";

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
      if (cache.size >= size) {
        cache.delete(cache.keys().next().value);
      }
      cache.set(key, value);
    },
  };
};

const lru = LRU(10);

export const handler: Handlers = {
  GET: async () => {
    try {
      const revision = await Context.active().release?.revision() || "";

      const css = lru.get(revision) || await bundle({ from: FROM });

      lru.set(revision, css);

      return new Response(css, {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Type": "text/css; charset=utf-8",
        },
      });
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return new Response(null, { status: 404 });
      }

      return new Response(Deno.inspect(error), { status: 500 });
    }
  },
};

export const plugin: Plugin = {
  name: "tailwind",
  routes: [
    {
      path: "/styles.css",
      handler,
    },
  ],
};
