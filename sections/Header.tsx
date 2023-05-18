import type { ComponentFunc } from "$live/engine/block.ts";
import { Canonical } from "deco-sites/std/commerce/types.tsx";

export type Layout = ComponentFunc<Props>;

export interface Props {
  logo: string;
  Layout: Layout;
}

export default function Header(props: Props) {
  return <Canonical {...props} />;
}
