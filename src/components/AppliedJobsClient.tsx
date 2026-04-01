"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchApplicationsByApplicant,
  getJobById,
  Application,
} from "@/lib/firebase";
import { Job } from "@/types/job";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface AppliedJobWithDetails {
  application: Application;
  job: Job;
}

export default function AppliedJobsClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJobWithDetails[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    loadAppliedJobs();
  }, [user, authLoading, router]);

  const loadAppliedJobs = async () => {
    if (!user) return;

    try {
      const applications = await fetchApplicationsByApplicant(user.uid);
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
      alert("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
        {appliedJobs.length === 0 ? (
          <div className="card text-center" style={{ padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3>No Applications Yet</h3>
            <p className="text-muted">Start applying to jobs to see them here</p>
            <button
              onClick={() => router.push("/")}
              className="btn btn-primary"
              style={{ marginTop: 16 }}
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {appliedJobs.map(({ application, job }) => (
              <div key={application.id} className="card">
                <div className="flex-between" style={{ marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0 }}>{job.title}</h3>
                    <p className="text-muted" style={{ margin: "4px 0" }}>
                      {job.hospitalName} • {job.hospitalType}
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

                {/* Status-specific messages */}
                {application.status === "accepted" ? (
                  <div className="alert alert-success" style={{ marginTop: 16 }}>
                    <strong>✓ Congratulations! Your application was accepted</strong>
                    <div style={{ marginTop: 12 }}>
                      <p><strong>💰 Payscale:</strong> {job.payscale || "Not specified"}</p>
                      <p><strong>📧 Contact:</strong> {job.contact || "See phone"}</p>
                      <p><strong>📞 Phone:</strong> {job.contactNo}</p>
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
        )}
      </div>
    </div>
  );
}
