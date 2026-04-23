// Server Component — no "use client"
// Runs on the server so Google/AI crawlers see real job data as HTML

import { adminDb } from "@/lib/firebase-admin";
import { Metadata } from "next";
import BrowseJobsClient from "./BrowseJobsClient";

export const metadata: Metadata = {
  title: "Browse Doctor Jobs in India | Doctor Jobs",
  description:
    "Find full-time, part-time, locum, and contract doctor jobs at hospitals and clinics across India. Filter by specialty, department, and work type. Apply directly.",
  openGraph: {
    title: "Browse Doctor Jobs in India",
    description:
      "Search hundreds of doctor job openings across Indian hospitals and clinics. Filter by specialty, location, and work type.",
  },
};

// Converts a Firestore document's special class instances to plain objects
// so they can be safely passed from Server Component to Client Component.
function serialiseJob(id: string, data: any) {
  return {
    id,
    ...data,
    // Timestamp → plain object
    createdAt: data.createdAt
      ? { _seconds: data.createdAt._seconds, _nanoseconds: data.createdAt._nanoseconds }
      : null,
    // requiredDate can be a Timestamp or a string
    requiredDate:
      data.requiredDate && typeof data.requiredDate !== "string"
        ? { _seconds: data.requiredDate._seconds, _nanoseconds: data.requiredDate._nanoseconds }
        : data.requiredDate ?? null,
    // GeoPoint → plain { lat, lng }
    hospGeo: data.hospGeo
      ? {
          lat: data.hospGeo._latitude  ?? data.hospGeo.latitude  ?? data.hospGeo.lat  ?? 0,
          lng: data.hospGeo._longitude ?? data.hospGeo.longitude ?? data.hospGeo.lng ?? 0,
        }
      : null,
  };
}

export default async function BrowseJobsPage() {
  const snapshot = await adminDb
    .collection("jobs")
    .orderBy("createdAt", "desc")
    .get();

  const jobs = snapshot.docs.map((doc) => serialiseJob(doc.id, doc.data()));

  return (
    <>
      {/* Static crawlable content — seen by search engines, hidden from users */}
      <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }} aria-hidden="true">
        <h1>Browse Doctor Jobs in India</h1>
        <p>{jobs.length} doctor job openings available across hospitals and clinics in India.</p>
        <ul>
          {jobs.slice(0, 100).map((job: any) => (
            <li key={job.id}>
              <a href={`/jobs/${job.id}`}>
                {job.title} at {job.hospitalName}
                {job.department ? ` — ${job.department}` : ""}
                {job.workType ? ` | ${job.workType}` : ""}
                {job.pincode ? ` | Pincode: ${job.pincode}` : ""}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Full interactive UI — hydrates on top of above */}
      <BrowseJobsClient initialJobs={jobs as any} />
    </>
  );
}
