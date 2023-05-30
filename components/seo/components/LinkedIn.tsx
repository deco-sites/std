import Image from "deco-sites/std/components/Image.tsx";
import { PreviewItens } from "../types.ts";

export default function LinkedIn(props: PreviewItens) {
  const { image, title, path } = props;

  return (
    <div>
      <Image
        src={image}
        alt={title}
        class="w-full h-[210px] sm:h-[273px] w-[400px] sm:w-[552px] object-cover"
        decoding="async"
        loading="lazy"
        width={200}
        height={200}
      />
      <div class="px-4 py-3 bg-linkedin-bg ">
        <p class="text-sm font-thin text-secondary leading-[19px]">
          {title}
        </p>
        <p class="text-xs font-normal text-common leading-[19px]">
          {path}
        </p>
      </div>
    </div>
  );
}
