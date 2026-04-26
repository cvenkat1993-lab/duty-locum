// Server Component — no "use client"
import { adminDb } from "@/lib/firebase-admin";
import { buildJobSchema } from "@/lib/schema";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import MapPinButton from "@/components/MapPinButton";
import JobDetailClient from "@/components/JobDetailClient";

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

// Required when next.config has output: 'export'.
// Fetches all job IDs at build time so each job page can be pre-rendered.
// Converts Firestore class instances (Timestamp, GeoPoint) to plain objects
// so they can be passed from Server Component → Client Component without errors.
function serialiseJob(id: string, data: any): any {
  return {
    id,
    ...data,
    createdAt: data.createdAt
      ? { _seconds: data.createdAt._seconds, _nanoseconds: data.createdAt._nanoseconds }
      : null,
    requiredDate:
      data.requiredDate && typeof data.requiredDate !== "string"
        ? { _seconds: data.requiredDate._seconds, _nanoseconds: data.requiredDate._nanoseconds }
        : data.requiredDate ?? null,
    // GeoPoint has _latitude/_longitude in firebase-admin SDK
    hospGeo: data.hospGeo
      ? {
          lat: data.hospGeo._latitude  ?? data.hospGeo.latitude  ?? data.hospGeo.lat  ?? 0,
          lng: data.hospGeo._longitude ?? data.hospGeo.longitude ?? data.hospGeo.lng ?? 0,
        }
      : null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const docSnap = await adminDb.collection("jobs").doc(id).get();

  if (!docSnap.exists) return { title: "Job Not Found | Doctor Jobs" };

  const job = docSnap.data()!;
  return {
    title: `${job.title} at ${job.hospitalName} | Doctor Jobs`,
    description: [
      `${job.workType || "Doctor"} position — ${job.title} at ${job.hospitalName}.`,
      job.department ? `Department: ${job.department}.` : "",
      job.payscale   ? `Salary: ${job.payscale}.`       : "",
      "Apply now on Doctor Jobs.",
    ].filter(Boolean).join(" "),
    openGraph: {
      title: `${job.title} — ${job.hospitalName}`,
      description:
        job.remarks || `Apply for ${job.title} at ${job.hospitalName}. ${job.workType} role in India.`,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const docSnap = await adminDb.collection("jobs").doc(id).get();

  if (!docSnap.exists) notFound();

  const job = serialiseJob(docSnap.id, docSnap.data()!);
  const schema = buildJobSchema(job);

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      {/* JSON-LD — triggers Google rich result (job card in SERP) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <Header />

      <div className="container" style={{ paddingTop: 20, paddingBottom: 40, maxWidth: 800 }}>
        {/* Static crawlable HTML */}
        <h1 style={{ marginBottom: 4 }}>{job.title}</h1>
        <h2 style={{ fontWeight: 500, fontSize: 20, color: "#555", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          {job.hospitalName}
          <MapPinButton job={job} style={{ width: 26, height: 26 }} />
        </h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", fontSize: 14, color: "#666", marginBottom: 16 }}>
          {job.hospitalType && <span>🏥 {job.hospitalType}</span>}
          {job.workType     && <span>💼 {job.workType}</span>}
          {job.department   && <span>🔬 {job.department}</span>}
          {job.pincode      && <span>📍 Pincode: {job.pincode}</span>}
          {job.payscale     && <span style={{ fontWeight: 600, color: "#333" }}>💰 {job.payscale}</span>}
        </div>

        {job.remarks && (
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#444", marginBottom: 24 }}>
            {job.remarks}
          </p>
        )}

        {/* Interactive apply button — runs on client */}
        <JobDetailClient job={job} />
      </div>
    </div>
  );
}
