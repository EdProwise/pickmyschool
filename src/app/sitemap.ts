import { MetadataRoute } from "next";
import connectToDatabase from "@/lib/mongodb";
import { School, Blog } from "@/lib/models";
import { INDIAN_STATES } from "@/lib/indian-states";
import { FEATURED_CITIES, cityNameToSlug } from "@/lib/featured-cities";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.pickmyschool.in";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/schools`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blogs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/for-schools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact-expert`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  // State pages — auto-generated from INDIAN_STATES
  // Add a new state to src/lib/indian-states.ts and it appears here automatically
  const statePages: MetadataRoute.Sitemap = INDIAN_STATES.map((s) => ({
    url: `${baseUrl}/schools/state/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // City pages — auto-generated from FEATURED_CITIES
  // Add a new city to src/lib/featured-cities.ts and it appears here automatically
  const cityPages: MetadataRoute.Sitemap = FEATURED_CITIES.map((city) => ({
    url: `${baseUrl}/schools/city/${cityNameToSlug(city)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  await connectToDatabase();

  // Dynamic school pages — auto-generated from DB
  let schoolPages: MetadataRoute.Sitemap = [];
  try {
    const schools = await School.find({ isPublic: true })
      .select("slug _id updatedAt")
      .lean();

    schoolPages = schools.map((school) => ({
      url: `${baseUrl}/schools/${school.slug ?? school._id.toString()}`,
      lastModified: school.updatedAt ? new Date(school.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error fetching schools for sitemap:", error);
  }

  // Dynamic blog pages — auto-generated from DB
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogs = await Blog.find({ status: "published" })
      .select("slug publishedAt updatedAt")
      .lean();

    blogPages = blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt
        ? new Date(blog.updatedAt)
        : blog.publishedAt
        ? new Date(blog.publishedAt)
        : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching blogs for sitemap:", error);
  }

  return [...staticPages, ...statePages, ...cityPages, ...schoolPages, ...blogPages];
}
