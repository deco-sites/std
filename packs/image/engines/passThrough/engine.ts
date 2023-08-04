import { createEngine as createRemoteEngine } from "../remote/engine.ts";

export const engine = createRemoteEngine({
  name: "pass-through",
  accepts: () => true,
  urlFromParams: ({ src }) => new URL(src),
});
