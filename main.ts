/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

import { $live } from "$live/mod.ts";
import { start } from "$fresh/server.ts";
import { plugin as tailwindPlugin } from "./plugins/tailwind/mod.ts";
import partytownPlugin from "partytown/mod.ts";
import manifest from "./live.gen.ts";
import site from "./site.json" assert { type: "json" };

await start($live(manifest, site), {
  plugins: [
    tailwindPlugin,
    partytownPlugin(),
  ],
});
