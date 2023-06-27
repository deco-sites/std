import { Head } from "$fresh/runtime.ts";
import { forwardRef } from "preact/compat";
import ImageKit from "https://esm.sh/imagekit-javascript@1.5.4";
import type { JSX } from "preact";

type Props =
  & Omit<JSX.IntrinsicElements["img"], "width" | "height" | "preload">
  & {
    width: number;
    height?: number;
    src: string;
    preload?: boolean;
    fetchPriority?: "high" | "low" | "auto";
  };

const imageKit = new ImageKit({
  urlEndpoint: "https://ik.imagekit.io/decocx",
});

const FACTORS = [1, 1.5, 2];

export const getOptimizedMediaUrl = (
  { originalSrc, width, height, factor }: {
    originalSrc: string;
    width: number;
    height?: number;
    factor: number;
  },
) => {
  const w = `${Math.trunc(factor * width)}`;
  const h = height ? `${Math.trunc(factor * height)}` : undefined;

  if (
    originalSrc.includes(".vteximg.com.br/arquivos/ids") ||
    originalSrc.includes(".vtexassets.com/arquivos/ids")
  ) {
    const url = new URL(originalSrc);

    const [slash, arquivos, ids, id, ...rest] = url.pathname.split("/");
    const [realId] = id.split("-");
    url.pathname = [slash, arquivos, ids, `${realId}-${w}-${h ?? w}`, ...rest]
      .join("/");

    return url.href;
  }

  return imageKit.url({
    path: originalSrc,
    transformation: [{ width: w, height: h }],
  });
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
