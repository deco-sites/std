import { PreviewItens } from "../types.ts";
import { textShortner } from "./helpers/textShortner.tsx";

const MAX_DESCRIPTION_LENGTH = 130;

function Google({ title, description, path }: PreviewItens) {
  return (
    <div class="p-6 flex flex-col gap-1 bg-white border border-light-border rounded-lg">
      <p class="text-xs font-normal leading-5">
        {path}
        <span class="text-common ml-2 font-semibold">&#8942;</span>
      </p>
      <p class="text-xl font-thin text-third leading-5  overflow-ellipsis overflow-hidden max-w-sm whitespace-nowrap break-words">
        {title}
      </p>
      <p class="text-xs font-normal text-common leading-5 max-w-sm break-words">
        {description && textShortner(description, MAX_DESCRIPTION_LENGTH)}
      </p>
    </div>
  );
}

export default Google;
