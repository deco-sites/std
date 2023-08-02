export const withFontServer = (fontFaceSheet: string, serverPath: string) =>
  fontFaceSheet.replaceAll("https://", `${serverPath}?src=https://`);
