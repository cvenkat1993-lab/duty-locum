import { jobs } from "@/data/jobs";
import JobDetailClient from "@/components/JobDetailClient";

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params; // ✅ REQUIRED in latest Next.js

  console.log("Server PARAM ID:", id);

  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <main style={{ padding: 30 }}>
        <h2>No such job exists</h2>
        <p>Requested Job ID: {id}</p>
        <p>Available IDs: {jobs.map((j) => j.id).join(", ")}</p>
      </main>
    );
  }

  return <JobDetailClient job={job} />;
}
