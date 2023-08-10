import { getCodecs, transforms } from "./codecs.ts";

export interface Image {
  data: ArrayBuffer;
  mediaType: string;
}

export interface TransformOptions {
  width: number;
  height: number;
  fit?: "cover" | "contain";
  quality?: number;
  mediaType: string;
}

export const transform = async (
  { data, mediaType: input }: Image,
  { width, height, fit = "cover", quality = 80, mediaType: output }:
    TransformOptions,
): Promise<Image> => {
  const codecs = await getCodecs();

  if (!(input in codecs) || !(output in codecs) || !height || !width) {
    return { data, mediaType: input };
  }

  const decode = codecs[input as keyof typeof codecs]?.decode;
  const encode = codecs[output as keyof typeof codecs]?.encode;

  const pipeline = [
    (buffer: ArrayBuffer) => decode(buffer),
    (data: ImageData) =>
      transforms.resize(data, {
        width,
        height,
        fitMethod: fit === "cover" ? "contain" : "stretch",
        linearRGB: false,
        premultiply: false,
      }),
    // @ts-expect-error options will just be ignored if encoder is png
    (data: ImageData) => encode(data, { quality, speed: 100 }),
  ] as const;

  const transformed = await pipeline.reduce(
    // @ts-expect-error I have no idea how to correctly type this
    (acc, step) => acc.then((r) => step(r)),
    Promise.resolve(data),
  );

  return {
    mediaType: output,
    data: transformed,
  };
};
