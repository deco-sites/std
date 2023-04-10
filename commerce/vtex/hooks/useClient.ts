import { createClient } from "../../../commerce/vtex/client.ts";

declare global {
  interface Window {
    LIVE: {
      integrations: Record<string, unknown>;
    };
  }
}

window.LIVE = window.LIVE || {};
window.LIVE.integrations = window.LIVE.integrations || {};
window.LIVE.integrations["vtex"] = window.LIVE.integrations["vtex"] ||
  createClient();

export const getClient = () =>
  window.LIVE.integrations["vtex"] as ReturnType<typeof createClient>;
