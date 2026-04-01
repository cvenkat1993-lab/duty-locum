import Link from "next/link";
import { Job } from "@/types/job"; // optional, if you have a Job type

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          border: "1px solid #ccc",
          padding: 15,
          marginTop: 10,
          cursor: "pointer",
        }}
      >
        <h3>{job.title}</h3>
        <p>{job.hospitalName}</p>
        <p>Pincode: {job.pincode}</p>
      </div>
    </Link>
  );
}
