import { deferred } from "std/async/deferred.ts";
import type { Handlers } from "$fresh/server.ts";

export const TO = "./static/tailwind.css";
export const FROM = "./tailwind.css";

export const tailwindBundle = deferred();
tailwindBundle.resolve();

export const handler: Handlers = {
  GET: async () => {
    await tailwindBundle;

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
