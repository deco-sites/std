import { withLive } from "$live/live.ts";

export const handler = withLive({
  siteId: 538,
  site: "std",
  domains: ["std.deco.site"],
});