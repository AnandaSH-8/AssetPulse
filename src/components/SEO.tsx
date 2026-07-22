import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://assets-manager-site.lovable.app';
const DEFAULT_IMAGE = `${SITE_URL}/assetPulse.png`;

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
}

/**
 * Per-route head tags: unique title, description, canonical, and og:*.
 * Sitewide fallbacks live in index.html for social crawlers that don't run JS.
 */
export function SEO({ title, description, path, image = DEFAULT_IMAGE }: SEOProps) {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
