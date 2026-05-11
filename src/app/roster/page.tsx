// Server Component — SEO metadata for the roster page
import { Metadata } from "next";
import RosterClient from "./RosterClient";

export const metadata: Metadata = {
  title: "Doctor Roster Scheduler — Free Medical Shift Planner | Duty Locum",
  description:
    "Free online doctor roster and shift scheduling tool for hospitals and clinics in India. Auto-generate monthly duty rosters, manage leaves, drag-and-drop shift swaps, and export to Excel. No sign-up required to use.",
  keywords: [
    "doctor roster maker",
    "medical shift scheduler",
    "hospital duty roster India",
    "doctor duty chart",
    "auto roster generator",
    "medical staff scheduling",
    "duty roster hospital",
    "doctor schedule maker",
    "shift roster Excel",
    "hospital roster free",
  ],
  openGraph: {
    title: "Free Doctor Roster Scheduler — Auto-Generate Medical Shift Rosters",
    description:
      "Create monthly doctor duty rosters instantly. Add doctors, configure shifts, manage leaves, handle swaps, and export to Excel. Free for all hospitals and clinics in India.",
  },
};

export default function RosterPage() {
  return <RosterClient />;
}
