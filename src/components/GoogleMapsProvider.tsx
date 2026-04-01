"use client";

import { ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

export default function GoogleMapsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  if (!isLoaded) return <p>Loading map services...</p>;

  return <>{children}</>;
}
