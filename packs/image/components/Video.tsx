/**
 * TODO: Implement video preload with link[rel="preload"] tags once
 * browsers support it. More info at: https://stackoverflow.com/a/68368601
 */
import { forwardRef } from "preact/compat";
import type { JSX } from "preact";

import { getOptimizedMediaUrl, getSrcSet } from "./Image.tsx";

type Props =
  & Omit<JSX.IntrinsicElements["video"], "width" | "height" | "preload">
  & {
    src: string;
    /** @description Improves Web Vitals (CLS|LCP) */
    width: number;
    /** @description Improves Web Vitals (CLS|LCP) */
    height: number;
    /** @description Force video through the optimization engine */
    forceOptimizedSrc?: boolean;
  };

const Video = forwardRef<HTMLVideoElement, Props>((props, ref) => {
  const { loading = "lazy" } = props;
  const srcSet = getSrcSet(props.src, props.width, props.height);

  const src = props.forceOptimizedSrc
    ? getOptimizedMediaUrl({
      originalSrc: props.src,
      width: props.width,
      height: props.height,
      factor: 1,
    })
    : props.src;

  return (
    <video
      {...props}
      preload={undefined}
      src={src}
      srcSet={srcSet}
      loading={loading}
      ref={ref}
    />
  );
});

export default Video;
