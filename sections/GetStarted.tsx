import { context } from "$live/live.ts";

export interface Props {
  enableInspectVSCode?: boolean;
}

export default function GetStarted({ enableInspectVSCode }: Props) {
  return (
    <section class="pt-20 pb-32">
      <div class="container mx-auto px-4">
        <div class="flex flex-wrap items-center -m-6">
          <div class="w-full md:w-1/2 p-6">
            <div class="bg-primary p-1 mx-auto max-w-max overflow-hidden rounded-full">
              <img
                class="object-cover rounded-full"
                src="/android-chrome-512x512.png"
                alt=""
              />
            </div>
          </div>
          <div class="w-full md:w-1/2 p-6">
            <div class="md:max-w-lg">
              <h2 class="mb-3 font-bold text-primary-dark text-4xl">
                Welcome to Live!
              </h2>
              <p class="text-lg">
                You can create a new page by visiting it.
              </p>
              <p class="mb-4 text-lg">
                Try any URL in the address bar 👆
              </p>
              {enableInspectVSCode && !context.deploymentId && (
                <p class="mb-8 text-lg border border-dashed border-primary-dark p-4">
                  <span class="italic">PROTIP:</span>{" "}
                  Hit backtick (`) and click on any part of this page to
                  navigate to the code in VSCode automatically. Hit ESC to exit
                  inspect mode.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
