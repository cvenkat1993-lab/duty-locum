"use client";

import { Autocomplete } from "@react-google-maps/api";
import { useRef } from "react";

export default function PincodeSearch() {
  const autoRef = useRef<google.maps.places.Autocomplete | null>(null);

  return (
    <Autocomplete
      onLoad={(auto) => (autoRef.current = auto)}
      onPlaceChanged={() => {
        const place = autoRef.current?.getPlace();
        console.log(place?.formatted_address);
      }}
    >
      <input
        placeholder="Search by pincode / area"
        style={{ padding: 10, width: "100%" }}
      />
    </Autocomplete>
  );
}
