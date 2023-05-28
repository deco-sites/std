import type { ComponentChildren } from "preact";
import Title from "./fragments/Title.tsx";

interface PreviewItemProps {
  title: string;
  children: ComponentChildren;
  instructions: string[];
}

export default function PreviewItem(
  { title, children, instructions }: PreviewItemProps,
) {
  return (
    <div class="w-[400px] flex flex-col h-full gap-[16px] sm:w-[522px]">
      <Title>{title}</Title>
      <div class="text-[14px] text-primary font-medium leading-[20px]">
        <p>Instructions:</p>
        <ul>
          {instructions.map((instruction) => (
            <li class="list-disc list-inside">{instruction}</li>
          ))}
        </ul>
      </div>
      {children}
    </div>
  );
}
