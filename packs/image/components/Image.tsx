import { Head } from "$fresh/runtime.ts";
import type { JSX } from "preact";
import { forwardRef } from "preact/compat";
import { PATH } from "../constants.ts";

type Props =
  & Omit<JSX.IntrinsicElements["img"], "width" | "height" | "preload">
  & {
    width: number;
    height?: number;
    src: string;
    preload?: boolean;
    fetchPriority?: "high" | "low" | "auto";
  };

const FACTORS = [1, 1.5, 2];

export const getOptimizedMediaUrl = (
  { originalSrc, width, height, factor }: {
    originalSrc: string;
    width: number;
    height?: number;
    factor: number;
  },
) => {
  const url = new URL(PATH, "http://example.com");

  url.searchParams.set("src", originalSrc);
  url.searchParams.set("width", `${Math.trunc(factor * width)}`);
  height && url.searchParams.set("height", `${Math.trunc(factor * height)}`);
  url.searchParams.set("fit", "contain");

  return `${url.pathname}${url.search}`;
};

export const getSrcSet = (src: string, width: number, height?: number) =>
  FACTORS
    .map((factor) =>
      `${getOptimizedMediaUrl({ originalSrc: src, width, height, factor })} ${
        Math.trunc(factor * width)
      }w`
    )
    .join(", ");

const Image = forwardRef<HTMLImageElement, Props>((props, ref) => {
  const { preload, loading = "lazy" } = props;

  if (!props.height) console.warn(`Missing height on image: ${props.src}`);

  const srcSet = getSrcSet(props.src, props.width, props.height);
  const linkProps = {
    imagesrcset: srcSet,
    imagesizes: props.sizes,
    fetchpriority: props.fetchPriority,
    media: props.media,
  };

  return (
    <>
      {preload && (
        <Head>
          <link
            as="image"
            rel="preload"
            href={props.src}
            {...linkProps}
          />
        </Head>
      )}
      <img
        {...props}
        preload={undefined}
        src={props.src}
        srcSet={srcSet}
        loading={loading}
        ref={ref}
      />
    </>
  );
});

export default Image;
