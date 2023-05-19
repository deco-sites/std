import { Handlers } from "$fresh/server.ts";
import { context } from "$live/live.ts";
import tailwindCSS from "../tailwindv3.ts";

const config = {};

const styles = new URL("../.frsh/tailwind.css", import.meta.url);

// Generate tailwind CSS style sheet generation promise
const tailwind: Promise<void> = context.isDeploy
  ? Promise.resolve()
  : tailwindCSS(config, { to: styles });

export const handler: Handlers = {
  GET: async () => {
    await tailwind;

    const [stats, file] = await Promise.all([
      Deno.lstat(styles),
      Deno.open(styles),
    ]);

    return new Response(file.readable, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "text/css; charset=utf-8",
        "Content-Length": `${stats.size}`,
      },
    });
  },
};
