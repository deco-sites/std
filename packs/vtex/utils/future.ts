// deno-lint-ignore-file no-explicit-any
import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import type {
  AppContext,
} from "https://denopkg.com/deco-cx/apps@0.2.5/vtex/mod.ts";

export const transform = (ctx: Context): AppContext =>
  ({
    ...ctx,
    account: ctx.configVTEX!.account,
    publicUrl: ctx.configVTEX!.publicUrl!,
    platform: "vtex",
  }) as any;
