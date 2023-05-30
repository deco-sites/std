import Image from "deco-sites/std/components/Image.tsx";
import { PreviewItens } from "../types.ts";
import { textShortner } from "./helpers/textShortner.tsx";

function FacebookBigOpenGraph(props: PreviewItens) {
  const { image, title, description, path, width, height } = props;
  const titleMaxLength = 120;

  return (
    <div class="">
      <Image
        src={image}
        alt={title}
        class="w-full h-[210px] sm:h-[273px] w-[400px] sm:w-[552px] object-cover"
        decoding="async"
        loading="lazy"
        width={width}
        height={height}
      />
      <div class="px-4 py-3 flex flex-col gap-[3px] bg-facebook-bg ">
        <p class="text-xs uppercase font-normal text-common leading-[15px]">
          {path}
        </p>

        <p class="text-base  font-thin text-secondary leading-[19px]  ">
          {textShortner(title, titleMaxLength)}
        </p>
        <p class="text-sm text-common leading-[19px] overflow-ellipsis 
        overflow-hidden max-w-full  whitespace-nowrap
        ">
          {title.length < 100 && description}
        </p>
      </div>
    </div>
  );
}

function FacebookMediumOpenGraph(props: PreviewItens) {
  const { image, title, description, path, width, height } = props;
  const titleMaxLength = 90;
  const descriptionMaxLength = 110;

  return (
    <div class="flex w-full">
      <Image
        src={image}
        alt={title}
        class=" object-cover max-h-[215px] max-w-[139px]"
        decoding="async"
        loading="lazy"
        width={width}
        height={height}
      />
      <div class="px-4 justify-center flex flex-col gap-[3px] bg-facebook-bg ">
        <p class="text-xs uppercase font-normal text-common leading-[15px]">
          {path}
        </p>
        <p class="text-base  font-thin  text-secondary leading-[19px]">
          {textShortner(title, titleMaxLength)}
        </p>
        <p class="text-sm text-common leading-[19px] max-w-[360px] break-words ">
          {textShortner(description, descriptionMaxLength)}
        </p>
      </div>
    </div>
  );
}

function FacebookSmallOpenGraph(props: PreviewItens) {
  const { image, title, description, path } = props;
  const titleMaxLength = 90;
  const descriptionMaxLength = 110;

  return (
    <div class="flex w-full max-w-[522px]">
      <Image
        src={image}
        alt={title}
        class=" object-scale-down"
        decoding="async"
        loading="lazy"
        width={106}
        height={106}
      />
      <div class="px-4 justify-center flex flex-col gap-[3px] bg-facebook-bg max-w-[522px]">
        <p class="text-xs uppercase font-normal text-common leading-[15px]">
          {path}
        </p>
        <p class="text-base  font-thin text-secondary leading-[19px]">
          {textShortner(title, titleMaxLength)}
        </p>
        <p class=" text-sm text-common leading-[19px] max-w-[380px] break-words
        ">
          {textShortner(description, descriptionMaxLength)}
        </p>
      </div>
    </div>
  );
}

function Facebook(props: PreviewItens) {
  const { width, height } = props;

  if (height < 300 && height !== 0) {
    return <FacebookSmallOpenGraph {...props} />;
  }

  if (width > height) {
    return <FacebookBigOpenGraph {...props} />;
  }

  if (height <= 600 && height >= 300 || height > width) {
    return <FacebookMediumOpenGraph {...props} />;
  }

  return <div />;
}

export default Facebook;
