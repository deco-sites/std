import { AnalyticsEvent } from "../types.ts";

/**
 * This function handles all ecommerce analytics events.
 * Add another ecommerce analytics modules here.
 */
export const sendAnalyticsEvent = <T extends AnalyticsEvent>(
  event: T,
) => {
  window.dataLayer && window.dataLayer.push({ ecommerce: null });
  window.dataLayer && window.dataLayer.push({
    event: event.name,
    ecommerce: event.params,
  });

  window.jitsu && window.jitsu("track", "ecommerce", event);
};
