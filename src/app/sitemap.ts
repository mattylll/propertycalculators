import { MetadataRoute } from "next";
import { calculators, categories } from "@/lib/calculators/config";

const BASE_URL = "https://propertycalculators.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/calculators`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Calculator pages - only live calculators
  const calculatorPages: MetadataRoute.Sitemap = calculators
    .filter((calc) => calc.status === "live")
    .map((calc) => ({
      url: `${BASE_URL}${calc.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  // Coming soon calculators (lower priority)
  const comingSoonPages: MetadataRoute.Sitemap = calculators
    .filter((calc) => calc.status === "coming-soon")
    .map((calc) => ({
      url: `${BASE_URL}${calc.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.3,
    }));

  return [
    ...staticPages,
    ...categoryPages,
    ...calculatorPages,
    ...comingSoonPages,
  ];
}
