import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();

  return [
    { url: `${base}/sign-in`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/sign-up`, changeFrequency: "yearly", priority: 0.6 },
  ];
}
