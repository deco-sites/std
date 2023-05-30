import { useMemo } from "preact/hooks";
import WhatsApp from "./WhatsApp.tsx";
import PreviewItem from "./PreviewItem.tsx";
import LinkedIn from "./LinkedIn.tsx";
import Discord from "./Discord.tsx";
import Facebook from "./Facebook.tsx";
import Telegram from "./Telegram.tsx";
import Google from "./Google.tsx";
import Twitter from "./Twitter.tsx";
import Slack from "./Slack.tsx";
import instructions from "./instructions.json" assert { type: "json" };
import type { Props } from "../types.ts";

function PreviewHandler(props: Props) {
  const path = useMemo(() => window.location?.host || "website.com", []);

  return (
    <section class="flex flex-col items-center">
      <header class="px-10 w-full max-w-6xl py-8 text-primary">
        <h1 class="font-semibold text-xl pb-1">Preview</h1>
        <p class="text-base">
          How your website is displayed on search engines and social media
        </p>
      </header>
      <div class="flex flex-col max-w-6xl items-center">
        <div class="flex flex-col items-center gap-8 mb-5 lg:grid lg:grid-cols-2 lg:justify-center">
          <PreviewItem instructions={instructions.google} title="Google">
            <Google {...props} path={path} />
          </PreviewItem>
          <PreviewItem instructions={instructions.linkedin} title="Linkedin">
            <LinkedIn {...props} path={path} />
          </PreviewItem>
          <PreviewItem instructions={instructions.whatsapp} title="Whatsapp">
            <WhatsApp {...props} path={path} />
          </PreviewItem>
          <PreviewItem instructions={instructions.telegram} title="Telegram">
            <Telegram {...props} path={path} />
          </PreviewItem>
          <PreviewItem instructions={instructions.facebook} title="Facebook">
            <Facebook {...props} path={path} />
          </PreviewItem>
          <PreviewItem instructions={instructions.twitter} title="Twitter">
            <Twitter {...props} path={path} />
          </PreviewItem>
          <PreviewItem instructions={instructions.discord} title="Discord">
            <Discord {...props} path={path} />
          </PreviewItem>
          <PreviewItem instructions={instructions.slack} title="Slack">
            <Slack {...props} path={path} />
          </PreviewItem>
        </div>
      </div>
    </section>
  );
}

export default PreviewHandler;
