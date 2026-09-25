import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/sign-in", "/sign-up"],
      disallow: [
        "/api/",
        "/transactions",
        "/budgets",
        "/recurring",
        "/reports",
        "/settings",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
