"use client";

import { useEffect, useState } from "react";
import {
  fetchApplicationsByApplicant,
  getJobById,
  Application,
} from "@/lib/firebase";
import { Job } from "@/types/job";
import { useRouter } from "next/navigation";

interface AppliedJobWithDetails {
  application: Application;
  job: Job;
}

export default function JobsAppliedTab({ userId }: { userId: string }) {
  const [appliedJobs, setAppliedJobs] = useState<AppliedJobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadAppliedJobs();
  }, [userId]);

  const loadAppliedJobs = async () => {
    try {
      const applications = await fetchApplicationsByApplicant(userId);
      const jobDetails: AppliedJobWithDetails[] = [];

      for (const app of applications) {
        const job = await getJobById(app.jobId);
        if (job) {
          jobDetails.push({ application: app, job });
        }
      }

      setAppliedJobs(jobDetails);
    } catch (error) {
      console.error("Error loading applied jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ padding: 40 }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  if (appliedJobs.length === 0) {
    return (
      <div className="card text-center" style={{ padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h3>No Applications Yet</h3>
        <p className="text-muted">Browse jobs and apply to see them here</p>
        <button
          onClick={() => router.push("/")}
          className="btn btn-primary"
          style={{ marginTop: 16 }}
        >
          Browse Jobs
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: 20 }}>
        {appliedJobs.length} Application{appliedJobs.length !== 1 ? "s" : ""}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {appliedJobs.map(({ application, job }) => (
          <div key={application.id} className="card">
            <div className="flex-between" style={{ marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{job.title}</h4>
                <p className="text-muted text-small" style={{ margin: "4px 0" }}>
                  {job.hospitalName}
                </p>
              </div>
              <span className={`badge badge-${application.status}`}>
                {application.status.toUpperCase()}
              </span>
            </div>

            <div className="grid-2" style={{ fontSize: 14 }}>
              <div>
                <p className="text-muted text-small">Location</p>
                <p>📍 {job.pincode}</p>
              </div>
              {job.department && (
                <div>
                  <p className="text-muted text-small">Department</p>
                  <p>🏥 {job.department}</p>
                </div>
              )}
            </div>

            <p className="text-small text-muted" style={{ marginTop: 12 }}>
              Applied: {application.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
            </p>

            {application.status === "accepted" ? (
              <div className="alert alert-success" style={{ marginTop: 16 }}>
                <strong>✓ Congratulations! Your application was accepted</strong>
                <div style={{ marginTop: 12, fontSize: 14 }}>
                  <p style={{ margin: "4px 0" }}>
                    <strong>💰 Payscale:</strong> {job.payscale || "Not specified"}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>📧 Email:</strong> {job.contact}
                  </p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>📞 Phone:</strong> {job.contactNo}
                  </p>
                </div>
              </div>
            ) : application.status === "rejected" ? (
              <div className="alert alert-danger" style={{ marginTop: 16 }}>
                Unfortunately, this application was not selected
              </div>
            ) : (
              <div className="alert alert-warning" style={{ marginTop: 16 }}>
                ⏳ Application pending review by recruiter
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
