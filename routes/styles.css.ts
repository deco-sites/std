import type { Handlers } from "$fresh/server.ts";
import { yellow } from "std/fmt/colors.ts";
import { handler as tailwindHandler } from "../plugins/tailwind/mod.ts";

const msg = `
${yellow("WARNING!")}
Tailwind setup has changed and we now offer it via a Fresh Plugin! This file will be removed in future releases. To migrate

1. Remove routes/styles.css.ts from your routes folder
2. Change main.ts to:

  import tailwindPlugin from "deco-sites/std/plugins/tailwind/mod.ts";

  await start($live(manifest, site), {
    plugins: [
      tailwindPlugin,
    ],
  });

That's it! Thanks for migrating 🎉
`;

export const handler: Handlers = {
  GET: (req, ctx) => {
    console.warn(msg);

    return tailwindHandler.GET!(req, ctx);
  },
};
