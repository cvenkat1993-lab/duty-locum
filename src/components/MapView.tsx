"use client";

import { GoogleMap, Marker } from "@react-google-maps/api";
import { Job } from "@/types/job";

function getLatLng(hospGeo: any): { lat: number; lng: number } | null {
  if (!hospGeo) return null;
  if (typeof hospGeo.latitude === "number" && typeof hospGeo.longitude === "number") {
    return { lat: hospGeo.latitude, lng: hospGeo.longitude };
  }
  if (typeof hospGeo.lat === "number" && typeof hospGeo.lng === "number") {
    return { lat: hospGeo.lat, lng: hospGeo.lng };
  }
  return null;
}

export default function MapView({
  center,
  zoom = 6,
  jobs,
  onMarkerClick,
  highlightedJobId,
}: {
  center: { lat: number; lng: number };
  zoom?: number;
  jobs: Job[];
  onMarkerClick: (job: Job) => void;
  highlightedJobId?: string | null;
}) {
  return (
    <GoogleMap
      zoom={zoom}
      center={center}
      mapContainerStyle={{ width: "100%", height: "100%" }}
      options={{
        // Smooth re-centering when center/zoom change
        gestureHandling: "greedy",
      }}
    >
      {jobs.map((job) => {
        const position = getLatLng(job.hospGeo);
        if (!position) return null;

        const isHighlighted = highlightedJobId === job.id;

        return (
          <Marker
            key={job.id}
            position={position}
            onClick={() => onMarkerClick(job)}
            // Highlighted pin: larger, red — standard Google Maps style
            icon={isHighlighted ? {
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new window.google.maps.Size(48, 48),
              anchor: new window.google.maps.Point(24, 48),
            } : undefined}
            zIndex={isHighlighted ? 999 : 1}
            animation={isHighlighted ? window.google.maps.Animation.BOUNCE : undefined}
          />
        );
      })}
    </GoogleMap>
  );
}
