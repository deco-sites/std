/**
 * WARNING: DO NOT USE ANY TWIND FUNCTIONS in here otherwise the
 * vscode-twind-intellisense plugin may stop working. To overcome
 * this issue, use animations and keyframes intead of twind's animation
 * function.
 */
import type { Options } from "$fresh/plugins/twind.ts";

/** @type {import('$fresh/plugins/twind').Options} */
const options: Omit<Options, "selfURL"> = {
  theme: {
    extend: {},
  },
};

export default options;
