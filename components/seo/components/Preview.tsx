import { Head } from "$fresh/runtime.ts";
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
import type { PreviewItens, Props } from "../types.ts";

const tailwind = {
  theme: {
    extend: {
      colors: {
        primary: "#2FD180",
        "primary-dark": "#003232",
        "primary-light": "#C5FFE9",
        secondary: "#F5F6F6",
        "divider-blue": "#2E6ED9",
        divider: "#D4DBD7",
        transparent: "transparent",
        "linkedin-bg": "#EFF3F8",
        "facebook-bg": "#F0F2F5",
        "discord-bg": "#EEEFF1",
      },
      textColor: {
        primary: "#2F3031",
        secondary: "#161616",
        third: "#2E6ED9",
        common: "#66736C",
      },
      borderColor: {
        "light-border": "#D4DBD7",
      },
    },
  },
};

const defaultProps: PreviewItens = {
  title: "",
  description: "",
  image: "",
  type: "website",
  themeColor: "",
  width: 120,
  height: 120,
  path: "website.com",
};

function PreviewHandler(props: Props) {
  const path = useMemo(() => window.location?.host, []);

  return (
    <>
      <Head>
        <script id="cdn.tailwindcss.com" src="https://cdn.tailwindcss.com" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              `document.getElementById("cdn.tailwindcss.com").addEventListener('load', () => { tailwind.config = ${
                JSON.stringify(tailwind)
              }})
            `,
          }}
        />
      </Head>
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
              <Google {...defaultProps} {...props} path={path} />
            </PreviewItem>
            <PreviewItem instructions={instructions.linkedin} title="Linkedin">
              <LinkedIn {...defaultProps} {...props} path={path} />
            </PreviewItem>
            <PreviewItem instructions={instructions.whatsapp} title="Whatsapp">
              <WhatsApp {...defaultProps} {...props} path={path} />
            </PreviewItem>
            <PreviewItem instructions={instructions.telegram} title="Telegram">
              <Telegram {...defaultProps} {...props} path={path} />
            </PreviewItem>
            <PreviewItem instructions={instructions.facebook} title="Facebook">
              <Facebook {...defaultProps} {...props} path={path} />
            </PreviewItem>
            <PreviewItem instructions={instructions.twitter} title="Twitter">
              <Twitter {...defaultProps} {...props} path={path} />
            </PreviewItem>
            <PreviewItem instructions={instructions.discord} title="Discord">
              <Discord {...defaultProps} {...props} path={path} />
            </PreviewItem>
            <PreviewItem instructions={instructions.slack} title="Slack">
              <Slack {...defaultProps} {...props} path={path} />
            </PreviewItem>
          </div>
        </div>
      </section>
    </>
  );
}

export default PreviewHandler;
