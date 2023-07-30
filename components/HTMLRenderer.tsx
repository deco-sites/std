import type { ComponentType, JSX } from "preact";
import type { HTML } from "./types.ts";
export type { HTML };

export interface Props {
  html: HTML;
  component?: string;
  as?: keyof JSX.IntrinsicElements | ComponentType;
  class?: string;
}

export default function HTMLRenderer(
  { as = "div", class: _class, html }: Props,
) {
  const Component = as as ComponentType<{
    class?: string;
    dangerouslySetInnerHTML: { __html: string };
  }>;

  return (
    <Component
      class={_class}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
