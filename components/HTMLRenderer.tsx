import type { ComponentType, JSX } from "preact";
import type { HTML } from "./types.ts";
export type { HTML };

export interface Props {
  html: HTML;
  component?: string;
  as?: keyof JSX.IntrinsicElements | ComponentType;
  class?: string;
}

export default function HTMLRenderer({ as = "div", html }: Props) {
  const Component = as as ComponentType<{
    dangerouslySetInnerHTML: { __html: string };
  }>;

  return <Component dangerouslySetInnerHTML={{ __html: html }} />;
}
