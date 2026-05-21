import type { MetadataRoute } from "next";
import { articles } from "@/lib/library";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nuu.community";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const legalUpdated = new Date("2026-05-21");

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/library`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/code-of-conduct`,
      lastModified: legalUpdated,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: legalUpdated,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...articles.map((a) => ({
      url: `${SITE_URL}/library/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
