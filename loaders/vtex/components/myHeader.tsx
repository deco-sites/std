import {
  Layout,
  Props as HeaderProps,
} from "deco-sites/std/sections/Header.tsx";

function MyHeaderLayout({ logo }: HeaderProps) {
  return <div>This is a {logo}</div>;
}

export default function MyHeader(): Layout {
  return MyHeaderLayout;
}
