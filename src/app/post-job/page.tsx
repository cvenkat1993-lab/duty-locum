"use client";

import PostJobClient from "@/components/PostJobClient";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";

export default function PostJobPage() {
  return (
    <GoogleMapsProvider>
      <PostJobClient />
    </GoogleMapsProvider>
  );
}
