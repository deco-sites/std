// Monkey patches ImageData since deno does not have a standard implementation for ImageData

class ImageDataMonkeyPatch implements ImageData {
  public readonly data: Uint8ClampedArray;
  public readonly width: number;
  public readonly height: number;
  public readonly colorSpace: PredefinedColorSpace;

  constructor(sw: number, sh: number, settings?: ImageDataSettings | undefined);
  constructor(
    data: Uint8ClampedArray,
    sw: number,
    sh?: number | undefined,
    settings?: ImageDataSettings | undefined,
  );
  constructor(
    a0: Uint8ClampedArray | number,
    a1: number,
    a2?: number | ImageDataSettings,
    a3?: ImageDataSettings,
  ) {
    if (typeof a0 === "number") {
      this.data = new Uint8ClampedArray();
      this.width = a0;
      this.height = a1;
      this.colorSpace = typeof a2 !== "number"
        ? a2?.colorSpace ?? "srgb"
        : "srgb";
    } else {
      this.data = a0;
      this.width = a1;
      this.height = typeof a2 === "number" ? a2 : 0;
      this.colorSpace = a3?.colorSpace ?? "srgb";
    }
  }
}

globalThis.ImageData = ImageDataMonkeyPatch;
