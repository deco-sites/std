import type { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";
import { transform } from "deco-sites/std/packs/vtex/utils/future.ts";
import {
  default as base,
  Props,
} from "https://denopkg.com/deco-cx/apps@0.9.0/vtex/handlers/sitemap.ts";

/**
 * @title Sitemap Proxy
 */
export default function SiteMapProxy(props: Props, ctx: Context) {
  return base(props, transform(ctx));
}
