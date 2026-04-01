"use client";

import GoogleMapsProvider from "@/components/GoogleMapsProvider";
import PostLocumClient from "@/components/PostLocumClient";

export default function PostLocumPage() {
  return (
    <GoogleMapsProvider>
      <PostLocumClient />
    </GoogleMapsProvider>
  );
}
