import Markdown, { Props } from "$live/std/ui/components/Markdown.tsx";
export * from "$live/std/ui/components/Markdown.tsx";

export default function MarkdownContainer(props: Props) {
  return (
    <div class="bg-white relative overflow-hidden -mt-4">
      <section class="container mx-auto px-4 pt-16 pb-40 lg:pb-40 text-primary-dark">
        <Markdown {...props}></Markdown>
      </section>
    </div>
  );
}
