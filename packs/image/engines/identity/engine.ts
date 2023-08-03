import { createEngine as createRemoteEngine } from "../remote/engine.ts";

export const engine = createRemoteEngine({
  name: "identity",
  accepts: () => true,
  urlFromParams: ({ src }) => new URL(src),
});
