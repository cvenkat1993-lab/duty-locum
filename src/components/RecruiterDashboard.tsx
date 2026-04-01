"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchJobsByRecruiter,
  fetchApplicationsByJob,
  updateApplicationStatus,
  Application,
} from "@/lib/firebase";
import { Job } from "@/types/job";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface JobWithApplications {
  job: Job;
  applications: Application[];
}

export default function RecruiterDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobsWithApps, setJobsWithApps] = useState<JobWithApplications[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push("/login");
      return;
    }

    loadRecruiterData();
  }, [user, authLoading, router]);

  const loadRecruiterData = async () => {
    if (!user) return;

    try {
      const jobs = await fetchJobsByRecruiter(user.uid);

      const jobsWithApplications: JobWithApplications[] = [];

      for (const job of jobs) {
        const applications = await fetchApplicationsByJob(job.id);
        jobsWithApplications.push({ job, applications });
      }

      setJobsWithApps(jobsWithApplications);
    } catch (error) {
      console.error("Error loading recruiter data:", error);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: "accepted" | "rejected"
  ) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      await loadRecruiterData();
      alert(`✓ Application ${newStatus}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  const selectedJob = selectedJobId
    ? jobsWithApps.find(j => j.job.id === selectedJobId)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
        
        {jobsWithApps.length === 0 ? (
          <div className="card text-center" style={{ padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3>No Jobs Posted Yet</h3>
            <p className="text-muted">Start by posting your first job opening</p>
            <button
              onClick={() => router.push("/post-job")}
              className="btn btn-primary"
              style={{ marginTop: 16 }}
            >
              Post a Job
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr",
            gap: 20,
          }}>
            {/* Jobs List - Mobile: Dropdown, Desktop: Cards */}
            {isMobile ? (
              <div className="form-group">
                <label className="form-label">Select Job to View Applications</label>
                <select
                  value={selectedJobId || ""}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                >
                  <option value="">Choose a job...</option>
                  {jobsWithApps.map(({ job, applications }) => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({applications.length} apps)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <h3>Your Posted Jobs ({jobsWithApps.length})</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {jobsWithApps.map(({ job, applications }) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className="card"
                      style={{
                        cursor: "pointer",
                        borderColor: selectedJobId === job.id ? "var(--primary)" : "var(--border)",
                        background: selectedJobId === job.id ? "#f0f8ff" : "white",
                      }}
                    >
                      <h4 style={{ margin: 0, fontSize: 16 }}>{job.title}</h4>
                      <p className="text-muted text-small" style={{ margin: "4px 0" }}>
                        {job.hospitalName}
                      </p>
                      <p className="font-bold text-small">
                        {applications.length} application{applications.length !== 1 ? "s" : ""}
                      </p>
                      <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 12 }}>
                        <span className="badge badge-pending">
                          {applications.filter(a => a.status === "pending").length} Pending
                        </span>
                        <span className="badge badge-accepted">
                          {applications.filter(a => a.status === "accepted").length} Accepted
                        </span>
                        <span className="badge badge-rejected">
                          {applications.filter(a => a.status === "rejected").length} Rejected
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications Panel */}
            <div>
              {selectedJob ? (
                <>
                  <h3>Applications for: {selectedJob.job.title}</h3>
                  
                  <div className="card" style={{ marginBottom: 20 }}>
                    <div className="grid-2">
                      <div>
                        <p className="text-small text-muted">Hospital</p>
                        <p className="font-bold">{selectedJob.job.hospitalName}</p>
                      </div>
                      <div>
                        <p className="text-small text-muted">Department</p>
                        <p className="font-bold">{selectedJob.job.department || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-small text-muted">Work Type</p>
                        <p className="font-bold">{selectedJob.job.workType}</p>
                      </div>
                      <div>
                        <p className="text-small text-muted">Payscale</p>
                        <p className="font-bold">{selectedJob.job.payscale || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  {selectedJob.applications.length === 0 ? (
                    <div className="card text-center" style={{ padding: 40 }}>
                      <p className="text-muted">No applications yet</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {selectedJob.applications.map((app) => (
                        <div key={app.id} className="card">
                          <div className="flex-between" style={{ marginBottom: 12 }}>
                            <div>
                              <h4 style={{ margin: 0 }}>{app.applicantName}</h4>
                              <p className="text-small text-muted">{app.applicantEmail}</p>
                            </div>
                            <span className={`badge badge-${app.status}`}>
                              {app.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid-2" style={{ fontSize: 14, marginBottom: 12 }}>
                            <div>
                              <p className="text-muted text-small">Education</p>
                              <p style={{ fontWeight: 500 }}>{app.applicantEducation || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-muted text-small">Current Job Title</p>
                              <p style={{ fontWeight: 500 }}>{app.applicantTitle || app.applicantTitle || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-muted text-small">Current Institution</p>
                              <p style={{ fontWeight: 500 }}>{app.applicantInstitution || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-muted text-small">Department/Specialty</p>
                              <p style={{ fontWeight: 500 }}>{app.applicantDepartment || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-muted text-small">Experience</p>
                              <p style={{ fontWeight: 500 }}>{app.applicantExperience || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-muted text-small">Email</p>
                              <p style={{ fontWeight: 500, fontSize: 13 }}>{app.applicantEmail || "N/A"}</p>
                            </div>
                          </div>

                          {/* Phone Number - Only shown after acceptance */}
                          {app.status === "accepted" ? (
                            <div className="alert alert-success" style={{ marginTop: 12 }}>
                              <strong>📞 Contact Phone:</strong> {app.applicantPhone || "Not provided"}
                            </div>
                          ) : (
                            <div className="alert alert-info" style={{ marginTop: 12 }}>
                              <strong>ℹ️ Phone number will be revealed after you accept this application</strong>
                            </div>
                          )}

                          <p className="text-small text-muted" style={{ marginTop: 12 }}>
                            Applied: {app.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                          </p>

                          {app.status === "pending" && (
                            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                              <button
                                onClick={() => handleStatusUpdate(app.id, "accepted")}
                                className="btn btn-success"
                                style={{ flex: 1 }}
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(app.id, "rejected")}
                                className="btn btn-danger"
                                style={{ flex: 1 }}
                              >
                                ✗ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="card text-center" style={{ padding: 60 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
                  <p className="text-muted">
                    {isMobile ? "Select a job from the dropdown above" : "Select a job to view applications"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
