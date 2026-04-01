"use client";

import { Job } from "@/types/job";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useState } from "react";

export default function JobListPanel({
  jobs,
  isLoggedIn,
  onApply,
  appliedJobIds = new Set(),
}: {
  jobs: Job[];
  isLoggedIn: boolean;
  onApply: (job: Job) => void;
  appliedJobIds?: Set<string>;
}) {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const handleLoginAndApply = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    
    try {
      await signInWithPopup(auth, provider);
      // User is now logged in, the parent component will re-render
      // and show the "Express Interest" button instead
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      
      // Silent handling for user cancellations
      if (
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/popup-closed-by-user'
      ) {
        return;
      }
      
      if (error.code === 'auth/popup-blocked') {
        alert("Pop-up blocked! Please allow pop-ups for this site, or click the profile icon to login.");
        return;
      }
      
      alert("Login failed. Please try again or use the profile menu to login.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!jobs.length) {
    return (
      <div className="card text-center" style={{ padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <p className="text-muted">No jobs found</p>
        <p className="text-small text-muted">
          Try clicking on a location marker or searching for a hospital
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <h3 style={{ marginBottom: 16 }}>
        {jobs.length} Opening{jobs.length !== 1 ? "s" : ""}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {jobs.map((job) => (
          <div key={job.id} className="card">
            <h4 style={{ margin: 0, marginBottom: 8 }}>{job.title}</h4>

            <div style={{ marginBottom: 12 }}>
              <p className="font-bold" style={{ margin: "4px 0" }}>
                {job.hospitalName}
              </p>
              <p className="text-small text-muted" style={{ margin: "4px 0" }}>
                {job.hospitalType} • {job.pincode}
              </p>
            </div>

            {job.department && (
              <p className="text-small" style={{ margin: "4px 0" }}>
                <strong>Department:</strong> {job.department}
              </p>
            )}

            {job.workType && (
              <p className="text-small" style={{ margin: "4px 0" }}>
                <strong>Work Type:</strong> {job.workType}
              </p>
            )}

            {job.payscale && (
              <p className="text-small" style={{ margin: "4px 0" }}>
                <strong>Payscale:</strong> {job.payscale}
              </p>
            )}

            {/* Dates */}
            <div style={{ 
              padding: "8px 10px", 
              background: "#f5f5f5", 
              borderRadius: 4,
              marginTop: 8,
              fontSize: 12
            }}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <span className="text-muted">Posted:</span>{" "}
                  <strong>{formatDate(job.createdAt)}</strong>
                </div>
                {job.requiredDate && (
                  <div>
                    <span className="text-muted">Required by:</span>{" "}
                    <strong>
                      {typeof job.requiredDate === 'string' 
                        ? job.requiredDate 
                        : formatDate(job.requiredDate)}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {job.remarks && (
              <p className="text-small text-muted" style={{ margin: "8px 0 0 0" }}>
                {job.remarks}
              </p>
            )}

            <div className="divider" style={{ margin: "12px 0" }}></div>

            {isLoggedIn ? (
              appliedJobIds.has(job.id) ? (
                <div>
                  <button
                    disabled
                    className="btn btn-secondary btn-full"
                    style={{ cursor: "not-allowed", opacity: 0.7 }}
                  >
                    ✓ Already Applied
                  </button>
                  <button
                    onClick={() => router.push("/applied-jobs")}
                    className="btn btn-primary btn-full"
                    style={{ marginTop: 8 }}
                  >
                    View Status
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onApply(job)}
                  className="btn btn-primary btn-full"
                >
                  Express Interest
                </button>
              )
            ) : (
              <button
                onClick={handleLoginAndApply}
                disabled={isLoggingIn}
                className="btn btn-primary btn-full"
              >
                {isLoggingIn ? (
                  <>
                    <div className="spinner"></div>
                    Signing in...
                  </>
                ) : (
                  "🔒 Login to Apply"
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
