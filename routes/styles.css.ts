import { context } from "$live/live.ts";
import type { Handlers } from "$fresh/server.ts";

export const TO = "./.frsh/tailwind.css";
export const FROM = "./tailwind.css";

export let onBundle: undefined | (() => void);

const bundle = context.isDeploy
  ? Promise.resolve()
  : new Promise<void>((r) => onBundle = r);

export const handler: Handlers = {
  GET: async () => {
    await bundle;

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
