import { MetadataRoute } from "next";
import clientPromise from "@/lib/mongodb";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.pickmyschool.in";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/schools`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic school pages
  let schoolPages: MetadataRoute.Sitemap = [];
  try {
    const client = await clientPromise;
    const db = client.db();
    const schools = await db
      .collection("schools")
      .find({ status: "active" })
      .project({ _id: 1, updatedAt: 1 })
      .toArray();

    schoolPages = schools.map((school) => ({
      url: `${baseUrl}/schools/${school._id.toString()}`,
      lastModified: school.updatedAt ? new Date(school.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error fetching schools for sitemap:", error);
  }

  return [...staticPages, ...schoolPages];
}
