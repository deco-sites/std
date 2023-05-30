import Image from "deco-sites/std/components/Image.tsx";
import { PreviewItens } from "../types.ts";
import { textShortner } from "./helpers/textShortner.tsx";

function TelegramBiggerImage(props: PreviewItens) {
  const { image, title, description, width, height, path } = props;

  return (
    <div class="flex gap-[6px] w-[400px] sm:w-[552px]">
      <div class="border-2 rounded-l-full border-divider-blue">
      </div>
      <div>
        <div class="py-1 bg-white font-semibold">
          <p class="text-xs text-third leading-[19px]">
            {path}
          </p>
          <p class="text-sm  text-secondary leading-[19px] break-words">
            {textShortner(title, 160)}
          </p>
          <p class="font-normal text-sm leading-5 break-words max-w-[380px] sm:max-w-[440px]">
            {title.length < 100 && textShortner(description, 160)}
          </p>
        </div>
        <Image
          src={image}
          alt={title}
          class="rounded-[6px] w-[454px] max-h-[432px] object-fill"
          decoding="async"
          loading="lazy"
          width={width}
          height={height}
        />
      </div>
    </div>
  );
}

function TelegramSmallerImage(props: PreviewItens) {
  const { image, title, description, path } = props;

  return (
    <div class="flex gap-[6px]">
      <div class="flex-grow border-2 rounded-l-full border-divider-blue max-w-[2px]">
      </div>
      <div class="flex flex-grow max-w-[480px] ">
        <div class="py-1 flex-grow bg-white font-semibold">
          <Image
            src={image}
            alt={title}
            class="rounded-[6px] float-right max-h-[55px] ml-1"
            decoding="async"
            loading="lazy"
            width={55}
            height={55}
          />
          <p class="text-xs text-third leading-[19px]">
            {path}
          </p>
          <p class="text-sm  text-secondary leading-[19px]">
            {textShortner(title, 160)}
          </p>
          <p class="font-normal text-sm leading-5 break-words max-w-[400px]">
            {title.length < 100 && textShortner(description, 160)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Telegram(props: PreviewItens) {
  const { width, height } = props;

  if (width === 0) {
    return <div></div>;
  }

  if (width < 300 || height < 300 && width !== 0) {
    return <TelegramSmallerImage {...props} />;
  }

  return <TelegramBiggerImage {...props} />;
}

export default Telegram;
