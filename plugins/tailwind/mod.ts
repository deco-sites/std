import type { Handlers, Plugin } from "$fresh/server.ts";
import { context } from "deco/live.ts";
import { createWorker } from "../../utils/worker.ts";

export const TO = "./static/tailwind.css";
export const FROM = "./tailwind.css";

const generate = async () => {
  /**
   * Here be capybaras! 🐁🐁🐁
   *
   * Tailwind uses a dependency called picocolors. Somehow, this line breaks when running on deno
   * https://github.com/alexeyraspopov/picocolors/blob/6b43e8e83bcfe69ad1391a2bb07239bf11a13bc4/picocolors.js#L4
   *
   * Setting this envvar makes this line not to be run, and thus, solves the issue.
   *
   * TODO: Remove this env var once this issue is fixed
   */
  Deno.env.set("NO_COLOR", "true");

  const worker = await createWorker(new URL("./bundler.ts", import.meta.url), {
    type: "module",
  });

  await worker.bundle({ to: TO, from: FROM });

  worker.dispose();
};

const bundle = context.isDeploy ? Promise.resolve() : generate();

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

export const plugin: Plugin = {
  name: "tailwind",
  routes: [
    {
      path: "/styles.css",
      handler,
    },
  ],
};
