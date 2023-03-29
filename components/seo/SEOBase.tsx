import { Head } from "$fresh/runtime.ts";

export interface Props {
  title?: string;
  description?: string;
  /**
   * @title Canonical URL
   * @default https://example.com
   */
  canonical?: string;
  imageUrl?: string;
  themeColor?: string;
}

function SEOBase({
  title,
  description,
  imageUrl,
  themeColor,
  canonical,
}: Props) {
  return (
    <Head>
      {title && <title>{title}</title>}
      {themeColor && <meta name="theme-color" content={themeColor} />}
      {description && <meta name="description" content={description} />}

      {/* OpenGraph tags */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {canonical && <meta property="og:url" content={canonical} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta property="og:type" content="website" />

      {/* Link tags */}
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  );
}

export default SEOBase;
