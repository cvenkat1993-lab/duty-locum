"use client";

import { useEffect, useRef } from "react";

export default function LocationSearch({ onSelect }: any) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode"],
        componentRestrictions: { country: "in" },
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      let pincode = "";
      place.address_components?.forEach((component) => {
        if (component.types.includes("postal_code")) {
          pincode = component.long_name;
        }
      });

      onSelect({
        address: place.formatted_address,
        pincode,
      });
    });
  }, []);

  return (
    <input
      ref={inputRef}
      placeholder="Search location or pincode"
      style={{ padding: 10, width: "300px" }}
    />
  );
}
