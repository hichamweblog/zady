import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/icons/", "/og/"],
      },
    ],
    sitemap: "https://zady.app/sitemap.xml",
    host: "https://zady.app",
  };
}
