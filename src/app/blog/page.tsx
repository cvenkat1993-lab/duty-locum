// Server Component — no "use client"
// Exports SEO metadata; actual list + pagination rendered client-side.

import { Metadata } from "next";
import BlogIndexClient from "./BlogIndexClient";

export const metadata: Metadata = {
  title: "Blog | Duty Locum",
  description:
    "Career tips for doctors, hiring insights for hospitals, and updates from Duty Locum — India's doctor jobs platform.",
  openGraph: {
    title: "Duty Locum Blog",
    description:
      "Career tips for doctors, hiring insights for hospitals, and updates from Duty Locum.",
  },
};

export default function BlogIndexPage() {
  return <BlogIndexClient />;
}
