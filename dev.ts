#!/usr/bin/env -S deno run -A --watch=static/
import dev from "$live/dev.ts";
import liveManifest from "$live/live.gen.ts";
import tailwindCSS from "./tailwindv3.ts";

await tailwindCSS();

await dev(import.meta.url, "./main.ts", {
  imports: [liveManifest],
});
