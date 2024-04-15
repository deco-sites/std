import { AnalyticsEvent } from "../types.ts";

/**
 * This function handles all ecommerce analytics events.
 * Add another ecommerce analytics modules here.
 */
export const sendAnalyticsEvent = <T extends AnalyticsEvent>(
  event: T,
) => {
  globalThis.window.dataLayer &&
    globalThis.window.dataLayer.push({ ecommerce: null });
  globalThis.window.dataLayer && globalThis.window.dataLayer.push({
    event: event.name,
    ecommerce: event.params,
  });

  // deno-lint-ignore no-explicit-any
  const w = window as unknown as { jitsu: any };

  w.jitsu && w.jitsu("track", "ecommerce", event);
};
