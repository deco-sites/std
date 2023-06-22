export interface i18nMessage {
  /**
   * @title Language
   * @description The target user language
   * @default en-US
   */
  lang: Language;
  /**
   * @title Text
   */
  text: MessageText;
}
/**
 * @title Message key
 */
export type MessageKey = string;
/**
 * @title Language
 */
export type Language = string;

/**
 * @title Message text
 */
export type MessageText = string;
export interface Message {
  /**
   * @title Message key
   */
  key: MessageKey;
  /**
   * @title Messages
   * @description Internationalization messages
   */
  i18n: i18nMessage[];
  /**
   * @title Default Message
   */
  defaultText: MessageText;
}

export interface Props {
  messages: Message[];
}

export type Messages = Record<
  MessageKey,
  Record<Language | "default", MessageText>
>;

/**
 * @title Internationalization
 * @description Used to display messages in different languages.
 */
export default function Messages(props: Props): Messages {
  const msgs: Messages = {};
  for (const message of props?.messages ?? []) {
    msgs[message.key] = { default: message.defaultText };
    for (const { lang, text } of (message.i18n ?? [])) {
      msgs[message.key][lang] = text;
    }
  }

  return msgs;
}
