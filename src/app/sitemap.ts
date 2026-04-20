import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.moeung.kr",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
