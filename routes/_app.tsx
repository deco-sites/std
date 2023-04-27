import { asset } from "$fresh/runtime.ts";
import type { AppProps } from "$fresh/server.ts";

export default function App(props: AppProps) {
  return (
    <>
      <link href={asset("/tailwind.css")} rel="stylesheet" />

      <props.Component />
    </>
  );
}
