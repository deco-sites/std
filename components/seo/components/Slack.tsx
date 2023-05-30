import Image from "deco-sites/std/components/Image.tsx";
import type { PreviewItens } from "../types.ts";
import { textShortner } from "./helpers/textShortner.tsx";

function SlackArticle(props: PreviewItens) {
  const {
    title,
    description,
    image,
    type,
    width,
    height,
    path,
  } = props;
  const containerMaxLength = 1248;

  return (
    <div class="flex text-[15px] flex-grow max-w-[522px] ">
      <div class="flex flex-col w-[4px]  bg-divider rounded-lg    overflow-hidden box-border mr-3">
      </div>
      <div class="flex flex-col w-[363px] leading-[22px] gap-[4px]">
        <div class="flex">
          <Image
            src="https://github.com/deco-sites/start/blob/main/static/favicon-32x32.png?raw=true"
            alt={title}
            class="object-contain mr-2"
            width={16}
            height={16}
          />
          <h2 class="font-bold">{path}</h2>
        </div>
        <div class="flex flex-grow flex-col gap-[4px] lg:max-h-[600px] mr-2 sm:flex-wrap ">
          <div>
            <h3 class="font-bold text-third  overflow-ellipsis">
              {title}
            </h3>
            <p class="max-h-[250px] max-w-[350px] overflow-ellipsis break-words">
              {textShortner(description, containerMaxLength - title.length)}
            </p>
          </div>
          <Image
            src={image}
            alt={title}
            class="rounded-lg lg:flex-[100px] min-h-[100px] min-w-[100px] w-min"
            width={width}
            height={height}
          />
        </div>
      </div>
    </div>
  );
}

function SlackWebsite(props: PreviewItens) {
  const {
    title,
    description,
    image,
    width,
    height,
    path,
  } = props;
  return (
    <div class="flex  w-[522px] sm:w-[522px]">
      <div class="min-w-[4px] w-[4px] bg-divider 
            rounded-lg    
            box-border 
            ">
      </div>

      <div class="flex flex-col  px-[12px] flex-grow ">
        <div class="flex">
          <Image
            src="https://github.com/deco-sites/start/blob/main/static/favicon-32x32.png?raw=true"
            alt={title}
            class=" object-contain mr-2 "
            width={16}
            height={16}
          />
          <h2 class="font-bold">{path}</h2>
        </div>
        <div class="flex gap-6">
          <div class="flex-grow flex flex-col max-w-[310px] sm:max-w-[450px] flex-shrink">
            <h3 class="font-bold text-third">{title}</h3>
            <p class="break-words">{description}</p>
          </div>
          <Image
            src={image}
            alt={title}
            class="max-h-[80px] max-w-[80px] min-h-[42px] min-w-[42px] w-min object-contain  mt-[5px] rounded-lg"
            width={width}
            height={height}
          />
        </div>
      </div>
    </div>
  );
}

export default function Slack(props: PreviewItens) {
  const { type } = props;

  if (type === "website") {
    return <SlackWebsite {...props} />;
  }

  if (type === "article") {
    return <SlackArticle {...props} />;
  }

  return <div></div>;
}
