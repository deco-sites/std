import type { ComponentFunc } from "$live/engine/block.ts";

/**
 * @title The canonical props of a component.
 */
export type CanonicalProps<T> = T & {
  Layout: ComponentFunc<T>;
};

/**
 * The default implementation of a canonical component.
 * @param the canonical props
 */
export function Canonical<TProps>(
  props: CanonicalProps<TProps>,
) {
  const { Layout } = props;
  return <Layout {...props} />;
}
