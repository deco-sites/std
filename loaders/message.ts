import {
  Language,
  MessageKey,
  Messages,
  MessageText,
} from "deco-sites/std/loaders/messages.ts";
import { Context } from "deco-sites/std/packs/vtex/accounts/vtex.ts";

export interface Props {
  messages: Messages;
  lang?: Language;
  key: MessageKey;
}

/**
 * @title Get a message from messages
 */
export default function GetMessage(
  props: Props,
  _req: Request,
  ctx: Context,
): MessageText {
  const culture = ctx.configVTEX?.defaultLocale ?? "default";
  return props?.messages?.[props.key]?.[culture];
}
