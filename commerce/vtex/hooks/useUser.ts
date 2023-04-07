import { computed } from "@preact/signals";

import { cart } from "./useCart.ts";

export const user = computed(() => cart.value?.clientProfileData ?? null);

export const useUser = () => user;
