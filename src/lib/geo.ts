// Geographic utilities for distance calculation and geocoding

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in kilometers
 */
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Geocode text address to coordinates using Google Maps API
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!window.google) {
      console.error("Google Maps not loaded");
      resolve(null);
      return;
    }

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const loc = results[0].geometry.location;
        resolve({
          lat: loc.lat(),
          lng: loc.lng(),
        });
      } else {
        console.error("Geocoding failed:", status);
        resolve(null);
      }
    });
  });
}