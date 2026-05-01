import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block pages that should never be indexed
        disallow: [
          "/admin-check-vc/",
          "/profile",
          "/applied-jobs",
          "/recruiter-dashboard",
          "/post-job",
          "/post-locum",
        ],
      },
    ],
    sitemap: "https://dutylocum.in/sitemap.xml",
  };
}
