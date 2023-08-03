import { state as storeState } from "./context.ts";

const { user, loading } = storeState;

const state = {
  user,
  loading,
};

export const useUser = () => state;
