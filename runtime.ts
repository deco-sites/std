import { withManifest } from "$live/clients/withManifest.ts";
import type { Manifest } from "deco-sites/std/live.gen.ts";

export const Runtime = withManifest<Manifest>();
