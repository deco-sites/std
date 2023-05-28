import type { Dimensions, PreviewProps, Props } from "../types.ts";
import WhatsApp from "./WhatsApp.tsx";
import PreviewItem from "./PreviewItem.tsx";
import LinkedIn from "./LinkedIn.tsx";
import Discord from "./Discord.tsx";
import { useSignal } from "@preact/signals";
import Facebook from "./Facebook.tsx";
import Telegram from "./Telegram.tsx";
import Google from "./Google.tsx";
import Twitter from "./Twitter.tsx";
import Slack from "./Slack.tsx";
import instructions from "./instructions.json" assert { type: "json" };

export default function PreviewHandler(props: Props) {
  const { image } = props;
  const dimensions = useSignal<Dimensions>({ width: 0, height: 0 });

  const getMeta = async (url: string) => {
    if (typeof document !== "undefined") {
      const img = document.createElement("img");
      img.src = url;
      await img.decode();
      return img;
    }
  };

  const getPath = () => {
    if (typeof document !== "undefined") {
      const path = window.location.host;
      return path;
    }

    return "website.com";
  };

  getMeta(image).then((img) => {
    if (img !== undefined) {
      dimensions.value = {
        width: img.width,
        height: img.naturalHeight,
      };
    }
  });

  const path = getPath();

  return (
    <section class="flex flex-col items-center">
      <header class="px-10 w-full max-w-[1156px] py-8 text-primary">
        <h1 class="font-semibold text-xl pb-1">Preview</h1>
        <p class="text-[15px]">
          How your website is displayed on search engines and social media
        </p>
      </header>
      <div class="flex flex-col max-w-[1156px] items-center">
        <div class="flex flex-col items-center gap-[32px] mb-[20px] lg:(grid grid-cols-2 items-start justify-center)">
          <PreviewItem instructions={instructions.google} title="Google">
            <Google {...{ ...props, ...dimensions.value, path }} />
          </PreviewItem>
          <PreviewItem instructions={instructions.linkedin} title="Linkedin">
            <LinkedIn {...{ ...props, ...dimensions.value, path }} />
          </PreviewItem>
          <PreviewItem instructions={instructions.whatsapp} title="Whatsapp">
            <WhatsApp {...{ ...props, ...dimensions.value, path }} />
          </PreviewItem>
          <PreviewItem instructions={instructions.telegram} title="Telegram">
            <Telegram {...{ ...props, ...dimensions.value, path }} />
          </PreviewItem>
          <PreviewItem instructions={instructions.facebook} title="Facebook">
            <Facebook {...{ ...props, ...dimensions.value, path }} />
          </PreviewItem>
          <PreviewItem instructions={instructions.twitter} title="Twitter">
            <Twitter {...{ ...props, ...dimensions.value, path }} />
          </PreviewItem>
          <PreviewItem instructions={instructions.discord} title="Discord">
            <Discord {...{ ...props, ...dimensions.value, path }} />
          </PreviewItem>
          <PreviewItem instructions={instructions.slack} title="Slack">
            <Slack {...{ ...props, ...dimensions.value, path }} />
          </PreviewItem>
        </div>
      </div>
    </section>
  );
}
