import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

const defaults = {
  title: "MothershipX — Social Market Intelligence Platform & Hackathon Arena",
  tagline: "Where real-world problems become validated products",
  description: "MothershipX is a social market intelligence platform and hackathon arena empowering builders to ship useful products and win prizes every day.",
  image: "/og-image.png",
  type: "website" as const,
};

export function SEO({
  title,
  description = defaults.description,
  image = defaults.image,
  url,
  type = defaults.type,
}: SEOProps) {
  const fullTitle = title ? `${title} | MothershipX` : defaults.title;
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="MothershipX" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
}
