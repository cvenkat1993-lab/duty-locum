"use client";

import { useEffect, useState } from "react";
import { fetchJobsByRecruiter } from "@/lib/firebase";
import { Job } from "@/types/job";
import { useRouter } from "next/navigation";

export default function JobsPostedTab({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadJobs();
  }, [userId]);

  const loadJobs = async () => {
    try {
      const fetchedJobs = await fetchJobsByRecruiter(userId);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    try {
      await deleteJob(jobId);
      alert("✓ Job deleted successfully");
      await loadJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ padding: 40 }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="card text-center" style={{ padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
        <h3>No Jobs Posted Yet</h3>
        <p className="text-muted">Post your first job to get started</p>
        <button
          onClick={() => router.push("/post-job")}
          className="btn btn-primary"
          style={{ marginTop: 16 }}
        >
          Post a Job
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <h3>{jobs.length} Job{jobs.length !== 1 ? "s" : ""} Posted</h3>
        <button onClick={() => router.push("/post-job")} className="btn btn-primary">
          + Post New Job
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {jobs.map((job) => (
          <div key={job.id} className="card">
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>{job.title}</h4>
              <button
                onClick={() => handleDelete(job.id)}
                className="btn btn-danger"
                style={{ padding: "6px 12px", fontSize: 12 }}
              >
                Delete
              </button>
            </div>

            <p className="font-bold" style={{ margin: "4px 0" }}>
              {job.hospitalName}
            </p>
            <p className="text-small text-muted">
              {job.hospitalType} • {job.pincode}
            </p>

            <div className="grid-2" style={{ marginTop: 12, fontSize: 14 }}>
              {job.department && (
                <div>
                  <p className="text-muted text-small">Department</p>
                  <p>{job.department}</p>
                </div>
              )}
              {job.workType && (
                <div>
                  <p className="text-muted text-small">Work Type</p>
                  <p>{job.workType}</p>
                </div>
              )}
              {job.payscale && (
                <div>
                  <p className="text-muted text-small">Payscale</p>
                  <p>{job.payscale}</p>
                </div>
              )}
              <div>
                <p className="text-muted text-small">Contact</p>
                <p>{job.contactNo}</p>
              </div>
            </div>

            {job.remarks && (
              <p className="text-small text-muted" style={{ marginTop: 12 }}>
                {job.remarks}
              </p>
            )}

            <p className="text-small text-muted" style={{ marginTop: 12 }}>
              Posted: {job.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
