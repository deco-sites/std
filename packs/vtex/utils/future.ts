// deno-lint-ignore-file no-explicit-any
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type {
  AppContext,
} from "https://denopkg.com/deco-cx/apps@8a0b1e23cef3f10071d539d2df70bbaf5c2392df/vtex/mod.ts";
import App from "https://denopkg.com/deco-cx/apps@8a0b1e23cef3f10071d539d2df70bbaf5c2392df/vtex/mod.ts";

export const transform = (ctx: Context): AppContext =>
  ({
    ...ctx,
    ...App({
      account: ctx.configVTEX!.account,
      publicUrl: ctx.configVTEX!.publicUrl!,
      platform: "vtex",
    }).state,
  }) as any;
