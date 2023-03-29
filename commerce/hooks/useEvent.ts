import { AnalyticsEvent } from "../types.ts";

declare global {
  interface Window {
    // deno-lint-ignore no-explicit-any
    dataLayer: any[];

    jitsu: (fn: "track", type: "ecommerce", params: AnalyticsEvent) => void;
  }
}

/**
 * This function handles all ecommerce analytics events.
 * Add another ecommerce analytics modules here.
 */
export const sendAnalyticsEvent = <T extends AnalyticsEvent>(
  event: T,
) => {
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: event.name,
    ecommerce: event.params,
  });

  window.jitsu?.("track", "ecommerce", event);
};

const state = {
  sendAnalyticsEvent,
};

/**
 * This hook has a sendAnalytics collector.
 */
export const useEvent = <T extends AnalyticsEvent = AnalyticsEvent>(): {
  sendAnalyticsEvent: (e: T) => void;
} => state;
