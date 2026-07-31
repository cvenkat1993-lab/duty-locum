"use client";

import { Autocomplete } from "@react-google-maps/api";
import { useRef } from "react";
import { SearchFilters, RegionBounds } from "@/types/search";

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const areaAutoRef = useRef<google.maps.places.Autocomplete | null>(null);
  const hospAutoRef = useRef<google.maps.places.Autocomplete | null>(null);

  const areaInputRef = useRef<HTMLInputElement | null>(null);
  const hospInputRef = useRef<HTMLInputElement | null>(null);

  const geocodeText = async (text: string) => {
    return new Promise<{
      lat: number;
      lng: number;
      formattedAddress?: string;
      bounds?: RegionBounds;
    } | null>((resolve) => {
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ address: text }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const loc = results[0].geometry.location;
          const box = results[0].geometry.bounds || results[0].geometry.viewport;
          resolve({
            lat: loc.lat(),
            lng: loc.lng(),
            formattedAddress: results[0].formatted_address,
            bounds: box ? box.toJSON() : undefined,
          });
        } else {
          resolve(null);
        }
      });
    });
  };

  const handleAreaSearch = async () => {
    const place = areaAutoRef.current?.getPlace();
    const inputText = areaInputRef.current?.value?.trim();

    if (place?.geometry?.location) {
      const viewport = place.geometry.viewport;
      onSearch({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        areaText: place.formatted_address || place.name || inputText || "",
        bounds: viewport?.toJSON(),
      });
      return;
    }

    if (inputText) {
      const geo = await geocodeText(inputText);
      if (geo) {
        onSearch({
          lat: geo.lat,
          lng: geo.lng,
          areaText: geo.formattedAddress || inputText,
          bounds: geo.bounds,
        });
      }
    }
  };

  const handleHospitalSearch = async () => {
    const place = hospAutoRef.current?.getPlace();
    const inputText = hospInputRef.current?.value?.trim();

    if (place?.geometry?.location && place.name) {
      onSearch({
        hospitalName: place.name,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      return;
    }

    if (inputText) {
      const geo = await geocodeText(inputText);

      onSearch({
        hospitalName: inputText,
        ...(geo || {}),
      });
    }
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: 12,
      marginBottom: 16,
    }}>
      {/* Area / Pincode Search */}
      <Autocomplete
        options={{
          componentRestrictions: { country: "in" },
          types: ["geocode"],
        }}
        onLoad={(auto) => (areaAutoRef.current = auto)}
        onPlaceChanged={handleAreaSearch}
      >
        <input
          ref={areaInputRef}
          placeholder="Search pincode or area"
          className="pac-target-input"
        />
      </Autocomplete>

      {/* Hospital Search */}
      <Autocomplete
        options={{
          componentRestrictions: { country: "in" },
          types: ["hospital"],
        }}
        onLoad={(auto) => (hospAutoRef.current = auto)}
        onPlaceChanged={handleHospitalSearch}
      >
        <input
          ref={hospInputRef}
          placeholder="Search hospital name"
          className="pac-target-input"
        />
      </Autocomplete>
    </div>
  );
}
