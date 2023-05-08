import { signal } from "@preact/signals";
import { Runtime } from "deco-sites/std/runtime.ts";
import type { User } from "deco-sites/std/packs/vtex/loaders/user.ts";

const payload = signal<User | null>(null);
const loading = signal<boolean>(true);

const wrap =
  <T>(fn: (props?: T) => Promise<User | null>) => async (props?: T) => {
    try {
      loading.value = true;
      payload.value = await fn(props);
    } finally {
      loading.value = false;
    }
  };

const refresh = wrap(
  Runtime.create("deco-sites/std/loaders/vtex/user.ts"),
);

// Start fetching the cart on client-side only
if (typeof document !== "undefined") {
  refresh();
}

const state = {
  user: payload,
};

export const useUser = () => state;
