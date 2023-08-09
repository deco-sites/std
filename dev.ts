#!/usr/bin/env -S deno run -A --watch=static/

/**
 * TODO: I know, this makes no sense. Try to remove it and see what happens.
 * If server boots, remove this line. This might be a deno bug solved in future
 * releases (>1.35.3)
 */
import "./plugins/tailwind/bundler.ts";

import dev from "$live/dev.ts";
import liveManifest from "$live/live.gen.ts";

await dev(import.meta.url, "./main.ts", {
  imports: [liveManifest],
  injectRoutes: true,
});
