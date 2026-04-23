import { adminDb } from "@/lib/firebase-admin";
import { MetadataRoute } from "next";

const CITY_SLUGS = [
  "chennai", "mumbai", "bangalore", "hyderabad", "delhi",
  "pune", "kolkata", "ahmedabad", "coimbatore", "kochi",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await adminDb.collection("jobs").get();

  const jobUrls: MetadataRoute.Sitemap = snapshot.docs.map((doc) => ({
    url: `https://doctorjobs.in/jobs/${doc.id}`,
    lastModified: doc.data().createdAt?.toDate?.() || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const cityUrls: MetadataRoute.Sitemap = CITY_SLUGS.map((city) => ({
    url: `https://doctorjobs.in/doctor-jobs-in/${city}`,
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  return [
    { url: "https://doctorjobs.in", changeFrequency: "daily", priority: 1.0 },
    { url: "https://doctorjobs.in/browse-jobs", changeFrequency: "daily", priority: 0.9 },
    ...cityUrls,
    { url: "https://doctorjobs.in/about", changeFrequency: "monthly", priority: 0.6 },
    { url: "https://doctorjobs.in/how-it-works", changeFrequency: "monthly", priority: 0.6 },
    ...jobUrls,
  ];
}
