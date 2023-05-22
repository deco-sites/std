#!/usr/bin/env -S deno run -A --watch=static/
import dev from "$live/dev.ts";
import liveManifest from "$live/live.gen.ts";
import tailwind from "./tailwindv3.ts";

// Start tailwind background process generation
tailwind();

await dev(import.meta.url, "./main.ts", {
  imports: [liveManifest],
});
