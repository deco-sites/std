import type { Handlers, Plugin } from "$fresh/server.ts";
import { Context, context } from "deco/deco.ts";
import { createWorker } from "../../utils/worker.ts";
import { watcher } from "./bundler.ts";
import { ensureFile } from "std/fs/mod.ts";

export const TO = "./static/tailwind.css";
export const FROM = "./tailwind.css";

let bundle: undefined | Promise<void>;

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

  const css = await worker.bundle({ from: FROM });

  await ensureFile(TO);
  await Deno.writeTextFile(TO, css, { create: true });

  worker.dispose();
};

export const handler: Handlers = {
  GET: async () => {
    bundle = context.isDeploy
      ? Promise.resolve()
      : !bundle
      ? generate()
      : bundle;

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

const styles = new WeakMap();

export const dynamic: Handlers = {
  GET: async () => {
    try {
      const active = Context.active();
      const state = await active.release?.state({ forceFresh: true });

      if (!state) {
        return new Response(null, { status: 404 });
      }

      if (!styles.has(state)) {
        const { process, setChangedContent } = await watcher({ from: FROM });

        setChangedContent([{
          content: JSON.stringify(state),
          extension: "json",
        }]);

        const css = await process();
        styles.set(state, css);
      }

      return new Response(styles.get(state), {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Type": "text/css; charset=utf-8",
        },
      });
    } catch (error) {
      console.error(error);

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
    {
      path: "/styles/:revision/main.css",
      handler: dynamic,
    },
  ],
};
