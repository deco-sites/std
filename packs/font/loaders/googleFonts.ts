import { Font } from "../types.ts";
// TODO: Find a better way to import toFontServer
import { toFontServer } from "deco-sites/std/loaders/x/font.ts";

const isValidFont = (font: Font) => font.fontFamily !== "None";
const generateHeaderFlightKey = (headers: Headers) => {
  const acceptLanguage = headers.get("Accept-Language");
  const userAgent = headers.get("User-Agent");
  return `a-l/${acceptLanguage},u-a/${userAgent}`;
};

export const singleFlightKey = (props: Props, req: Request) => {
  const validFonts = props.fonts?.filter(isValidFont).map((font) =>
    font.other || font.fontFamily
  );

  return `${validFonts?.join(",") ?? ""},${
    generateHeaderFlightKey(req.headers)
  }`;
};

export interface Props {
  fonts: Font[];
}

const loader = async (props: Props, req: Request) => {
  const { fonts } = props;
  const filteredFonts = fonts?.filter(isValidFont);

  const fontsSheet = await Promise.all(
    filteredFonts?.map(async (font) => {
      const fontFamily = font?.other || font?.fontFamily;
      const fontCss = await fetch(
        `https://fonts.googleapis.com/css?family=${fontFamily}:300,400,600,700&display=swap`,
        { headers: req.headers },
      ).then((res) => res.text()).catch(() => undefined);

      if (!fontCss) return;

      return toFontServer(fontCss);
    }) ?? [],
  );

  return {
    ...props,
    fonts: filteredFonts,
    fontsSheet: fontsSheet.filter(Boolean),
  };
};

export default loader;
