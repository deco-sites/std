import { Head } from "$fresh/runtime.ts";
import type { JSX } from "preact";
import { forwardRef } from "preact/compat";
import { KEY } from "../constants.ts";

type Props =
  & Omit<JSX.IntrinsicElements["img"], "width" | "height" | "preload">
  & {
    src: string;
    /** @description Improves Web Vitals (CLS|LCP) */
    width: number;
    /** @description Improves Web Vitals (CLS|LCP) */
    height?: number;
    /** @description Web Vitals (LCP). Adds a link[rel="preload"] tag in head. Use one preload per page for better performance */
    preload?: boolean;
    /** @description Improves Web Vitals (LCP). Use high for LCP image. Auto for other images */
    fetchPriority?: "high" | "low" | "auto";
  };

const FACTORS = [1, 2];

export const getOptimizedMediaUrl = (
  { originalSrc, width, height, factor }: {
    originalSrc: string;
    width: number;
    height?: number;
    factor: number;
  },
) => {
  const params = new URLSearchParams();

  params.set("src", originalSrc);
  params.set("fit", "cover");
  params.set("width", `${Math.trunc(factor * width)}`);
  height && params.set("height", `${Math.trunc(factor * height)}`);

  return `${KEY}?${params}`;
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

  if (!props.height) {
    console.warn(
      `Missing height. This image will NOT be optimized: ${props.src}`,
    );
  }

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
