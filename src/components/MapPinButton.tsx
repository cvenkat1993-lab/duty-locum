"use client";

// ============================================================
// FILE: src/components/MapPinButton.tsx
// NEW FILE — create this
//
// Small pin icon button used on job cards.
// Clicking navigates to homepage with map centered on that job.
// Only renders if the job has hospGeo coordinates.
// ============================================================

import { useRouter } from "next/navigation";

interface Props {
  job: any;
  style?: React.CSSProperties;
}

export default function MapPinButton({ job, style }: Props) {
  const router = useRouter();

  // Don't render if no coordinates stored
  if (!job.hospGeo?.lat || !job.hospGeo?.lng) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // prevent triggering parent card click
    router.push(
      `/?lat=${job.hospGeo.lat}&lng=${job.hospGeo.lng}&jobId=${job.id}`
    );
  };

  return (
    <button
      onClick={handleClick}
      title="View on map"
      aria-label="View on map"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: "50%",
        border: "1px solid #d0e7ff",
        background: "#f0f7ff",
        cursor: "pointer",
        color: "#1a73e8",
        padding: 0,
        flexShrink: 0,
        transition: "background 0.15s, border-color 0.15s",
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#d0e7ff";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#f0f7ff";
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </button>
  );
}
