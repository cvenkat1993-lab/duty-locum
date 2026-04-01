"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import { Job } from "@/types/job";

function getLatLng(
  hospGeo: any
): { lat: number; lng: number } | null {
  if (!hospGeo) return null;

  // ✅ Firestore GeoPoint
  if (
    typeof hospGeo.latitude === "number" &&
    typeof hospGeo.longitude === "number"
  ) {
    return {
      lat: hospGeo.latitude,
      lng: hospGeo.longitude,
    };
  }

  // ✅ Normalized object
  if (
    typeof hospGeo.lat === "number" &&
    typeof hospGeo.lng === "number"
  ) {
    return {
      lat: hospGeo.lat,
      lng: hospGeo.lng,
    };
  }

  return null;
}

export default function MapView({
  center,
  jobs,
  onMarkerClick,
}: {
  center: { lat: number; lng: number };
  jobs: Job[];
  onMarkerClick: (job: Job) => void;
}) {
  return (
    <GoogleMap
      zoom={6} // India default
      center={center}
      mapContainerStyle={{ width: "100%", height: "100%" }}
    >
      {jobs.map((job) => {
        const position = getLatLng(job.hospGeo);
        if (!position) return null;

        return (
          <Marker
            key={job.id}
            position={position}
            onClick={() => onMarkerClick(job)}
          />
        );
      })}
    </GoogleMap>
  );
}
