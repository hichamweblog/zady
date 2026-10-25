import type { MetadataRoute } from "next";
import { UNITS_META } from "@/lib/units-meta";

const SITE_URL = "https://zady.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...UNITS_META.map((unit) => ({
      url: `${SITE_URL}/units/${unit.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
