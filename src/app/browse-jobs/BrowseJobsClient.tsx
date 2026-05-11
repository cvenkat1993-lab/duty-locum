"use client";

import MapPinButton from "@/components/MapPinButton";
import PostedByBadge from "@/components/PostedByBadge";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, applyForJob } from "@/lib/firebase";
import { Job } from "@/types/job";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { signInWithPopup } from "firebase/auth";
import { saveUserOnLogin } from "@/lib/saveUserOnLogin";
import { auth, provider } from "@/lib/firebase";

export default function BrowseJobsClient({ initialJobs }: { initialJobs: Job[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const [allJobs, setAllJobs] = useState<Job[]>(initialJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(initialJobs);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const jobsPerPage = 15;

  // Get unique values for filters
  const [uniqueJobTitles, setUniqueJobTitles] = useState<string[]>([]);
  const [uniqueDepartments, setUniqueDepartments] = useState<string[]>([]);
  const [uniqueWorkTypes, setUniqueWorkTypes] = useState<string[]>([]);

  // Filter states - using arrays for checkboxes
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [selectedPostedBy, setSelectedPostedBy] = useState<string[]>([]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Seed filter options from server-provided jobs on mount
  useEffect(() => {
    const titles = Array.from(new Set(initialJobs.map(j => j.title).filter((t): t is string => Boolean(t)))).sort();
    const departments = Array.from(new Set(initialJobs.map(j => j.department).filter((d): d is string => Boolean(d)))).sort();
    const workTypes = Array.from(new Set(initialJobs.map(j => j.workType).filter(Boolean))).sort();
    setUniqueJobTitles(titles);
    setUniqueDepartments(departments);
    setUniqueWorkTypes(workTypes);
    setLoading(false);
  }, []);

  // Load applied jobs when user logs in
  useEffect(() => {
    if (user) {
      loadAppliedJobs(user.uid);
    }
  }, [user]);

  // Apply filters when selections change
  useEffect(() => {
    applyFilters();
  }, [selectedJobTitles, selectedDepartments, selectedWorkTypes, selectedPostedBy, allJobs]);

  const loadAppliedJobs = async (userId: string) => {
    try {
      const { fetchApplicationsByApplicant } = await import("@/lib/firebase");
      const applications = await fetchApplicationsByApplicant(userId);
      const jobIds = new Set(applications.map(app => app.jobId));
      setAppliedJobIds(jobIds);
    } catch (error) {
      console.error("Error loading applied jobs:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...allJobs];

    if (selectedJobTitles.length > 0) {
      filtered = filtered.filter(job => selectedJobTitles.includes(job.title));
    }

    if (selectedDepartments.length > 0) {
      filtered = filtered.filter(job => job.department && selectedDepartments.includes(job.department));
    }

    if (selectedWorkTypes.length > 0) {
      filtered = filtered.filter(job => selectedWorkTypes.includes(job.workType));
    }

    if (selectedPostedBy.length > 0) {
      filtered = filtered.filter(job => {
        const label = (job as any).postedByLabel || "Doctor";
        const group = label === "Doctor" ? "Doctor" : "Non-Doctor";
        return selectedPostedBy.includes(group);
      });
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const toggleJobTitle = (title: string) => {
    setSelectedJobTitles(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const toggleWorkType = (type: string) => {
    setSelectedWorkTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const togglePostedBy = (type: string) => {
    setSelectedPostedBy(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const clearAllFilters = () => {
    setSelectedJobTitles([]);
    setSelectedDepartments([]);
    setSelectedWorkTypes([]);
    setSelectedPostedBy([]);
  };

  const hasActiveFilters = selectedJobTitles.length > 0 || selectedDepartments.length > 0 || selectedWorkTypes.length > 0 || selectedPostedBy.length > 0;

  const handleApply = async (job: Job) => {
    if (!user) {
      alert("Please login to apply");
      return;
    }

    // Check userType stored in Firestore
    try {
      const { db } = await import("@/lib/firebase");
      const { getDoc: _getDoc, doc: _doc } = await import("firebase/firestore");
      const snap = await _getDoc(_doc(db, "users", user.uid));
      if (snap.exists() && snap.data().userType === "non-doctor") {
        alert("Only doctors can apply for jobs. Non-doctor accounts are for posting jobs only.");
        return;
      }
    } catch (_) {}

    if (job.recruiterId === user.uid) {
      alert("You cannot apply to your own job posting");
      return;
    }

    if (!job.recruiterId) {
      alert("This job posting is missing recruiter information");
      return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      if (confirm("Please complete your profile before applying. Go to profile now?")) {
        router.push("/profile");
      }
      return;
    }

    const profileData = userDoc.data();
    if (!profileData.name || !profileData.education || !profileData.currentJobTitle || !profileData.currentInstitution || !profileData.phoneNumber) {
      if (confirm("Please complete all required fields in your profile. Go to profile now?")) {
        router.push("/profile");
      }
      return;
    }

    const result = await applyForJob(job.id, user.uid, job.recruiterId);
    if (result.success) {
      alert("✓ Application submitted successfully!");
      setAppliedJobIds(prev => new Set([...prev, job.id]));
    } else {
      alert(result.message);
    }
  };

  const handleLoginAndApply = async () => {
    try {
      const _result = await signInWithPopup(auth, provider);
      await saveUserOnLogin(_result.user);
    } catch (error: any) {
      if (
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/popup-closed-by-user'
      ) {
        return;
      }
      if (error.code === 'auth/popup-blocked') {
        alert("Pop-up blocked! Please allow pop-ups for this site.");
        return;
      }
      alert("Login failed: " + error.message);
    }
  };

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

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
        <Header />
        <div className="flex-center" style={{ minHeight: "calc(100vh - 64px)" }}>
          <div className="spinner-large"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
        {/* Header with filter toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 28 }}>Browse Jobs</h1>
            <p className="text-muted" style={{ margin: "4px 0 0 0", fontSize: isMobile ? 13 : 14 }}>
              {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
            </p>
          </div>
          
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              🔍 Filters
              {hasActiveFilters && (
                <span style={{
                  background: "var(--primary)",
                  color: "white",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  {selectedJobTitles.length + selectedDepartments.length + selectedWorkTypes.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Main layout */}
        <div style={{ display: "flex", gap: 20, flexDirection: isMobile ? "column" : "row" }}>
          {/* Filters Sidebar */}
          {(!isMobile || showFilters) && (
            <div style={{
              width: isMobile ? "100%" : 260,
              flexShrink: 0,
              position: isMobile ? "fixed" : "sticky",
              top: isMobile ? 0 : 80,
              height: isMobile ? "100vh" : "fit-content",
              maxHeight: isMobile ? "none" : "calc(100vh - 100px)",
              left: isMobile ? 0 : "auto",
              right: isMobile ? 0 : "auto",
              bottom: isMobile ? 0 : "auto",
              background: "white",
              border: isMobile ? "none" : "1px solid var(--border)",
              borderRadius: isMobile ? 0 : 8,
              padding: isMobile ? 20 : 16,
              zIndex: isMobile ? 1000 : "auto",
              overflowY: "auto",
            }}>
              {isMobile && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ margin: 0 }}>Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 24,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Clear All */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="btn btn-secondary btn-full"
                  style={{ marginBottom: 16, fontSize: 14 }}
                >
                  Clear All Filters
                </button>
              )}

              {/* Job Title Filter */}
              <FilterSection
                title="Job Title"
                items={uniqueJobTitles}
                selectedItems={selectedJobTitles}
                onToggle={toggleJobTitle}
              />

              {/* Department Filter */}
              <FilterSection
                title="Department"
                items={uniqueDepartments}
                selectedItems={selectedDepartments}
                onToggle={toggleDepartment}
              />

              {/* Work Type Filter */}
              <FilterSection
                title="Work Type"
                items={uniqueWorkTypes}
                selectedItems={selectedWorkTypes}
                onToggle={toggleWorkType}
              />

              {/* Posted By Filter */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>Posted By</h4>
                {["Doctor", "Non-Doctor"].map(type => (
                  <label key={type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer", fontSize: 14 }}>
                    <input type="checkbox" checked={selectedPostedBy.includes(type)}
                      onChange={() => togglePostedBy(type)} style={{ width: 16, height: 16 }} />
                    {type === "Doctor" ? "🩺 Doctor" : "👤 Non-Doctor (HR / Admin / Recruiter / Agency)"}
                  </label>
                ))}
              </div>

              {isMobile && (
                <button
                  onClick={() => setShowFilters(false)}
                  className="btn btn-primary btn-full"
                  style={{ marginTop: 20 }}
                >
                  Apply Filters
                </button>
              )}
            </div>
          )}

          {/* Job Listings */}
          <div style={{ flex: 1, maxWidth: 700 }}>
            {currentJobs.length === 0 ? (
              <div className="card text-center" style={{ padding: 40 }}>
                <p className="text-muted">No jobs found matching your filters</p>
                <button onClick={clearAllFilters} className="btn btn-primary" style={{ marginTop: 16 }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Job Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 10 : 12 }}>
                  {currentJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isMobile={isMobile}
                      isApplied={appliedJobIds.has(job.id)}
                      isLoggedIn={!!user}
                      onApply={() => handleApply(job)}
                      onLogin={handleLoginAndApply}
                      onViewStatus={() => router.push("/applied-jobs")}
                      formatDate={formatDate}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    isMobile={isMobile}
                  />
                )}

                {/* Page Info */}
                <p className="text-center text-muted text-small" style={{ marginTop: 16 }}>
                  Showing {indexOfFirstJob + 1}-{Math.min(indexOfLastJob, filteredJobs.length)} of {filteredJobs.length}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Section Component
function FilterSection({
  title,
  items,
  selectedItems,
  onToggle,
}: {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggle: (item: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const displayLimit = 5;

  const displayItems = showAll ? items : items.slice(0, displayLimit);

  return (
    <div style={{
      borderBottom: "1px solid #e0e0e0",
      paddingBottom: 12,
      marginBottom: 12,
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          padding: "8px 0",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          color: "#333",
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: 12, color: "#666" }}>{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div style={{ paddingTop: 4 }}>
          {displayItems.map(item => (
            <label
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 0",
                cursor: "pointer",
                fontSize: 13,
                color: "#333",
              }}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={() => onToggle(item)}
                style={{ 
                  cursor: "pointer",
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                }}
              />
              <span style={{ lineHeight: 1.3 }}>{item}</span>
            </label>
          ))}
          
          {items.length > displayLimit && (
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                fontSize: 12,
                padding: "4px 0",
                marginTop: 2,
              }}
            >
              {showAll ? "- Show less" : `+ ${items.length - displayLimit} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Compact Job Card Component
function JobCard({
  job,
  isMobile,
  isApplied,
  isLoggedIn,
  onApply,
  onLogin,
  onViewStatus,
  formatDate,
}: {
  job: Job;
  isMobile: boolean;
  isApplied: boolean;
  isLoggedIn: boolean;
  onApply: () => void;
  onLogin: () => void;
  onViewStatus: () => void;
  formatDate: (timestamp: any) => string;
}) {
  if (isMobile) {
    // Ultra-compact mobile layout
    return (
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>
              {job.title}
            </h4>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#666", display: "flex", alignItems: "center", gap: 6 }}>
              {job.hospitalName}
              <MapPinButton job={job} />
            </p>
            <div style={{ marginTop: 4 }}>
              <PostedByBadge label={(job as any).postedByLabel || "Doctor"} />
            </div>
          </div>
          {job.workType && (
            <span
              className={`badge badge-${job.workType === 'Locum' ? 'warning' : 'info'}`}
              style={{ fontSize: 11, padding: "2px 8px", height: "fit-content" }}
            >
              {job.workType}
            </span>
          )}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 12px",
          fontSize: 12,
          color: "#666",
          marginBottom: 8,
        }}>
          <div>📍 {job.pincode}</div>
          {job.department && <div>🏥 {job.department}</div>}
          <div style={{ fontSize: 11, color: "#999" }}>
            Posted: {formatDate(job.createdAt)}
          </div>
          {job.payscale && (
            <div style={{ fontSize: 12, fontWeight: 500, color: "#333" }}>
              💰 {job.payscale}
            </div>
          )}
        </div>

        {isLoggedIn ? (
          isApplied ? (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                disabled
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  fontSize: 13,
                  padding: "8px 12px",
                  cursor: "not-allowed",
                  opacity: 0.7,
                }}
              >
                ✓ Applied
              </button>
              <button
                onClick={onViewStatus}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  fontSize: 13,
                  padding: "8px 12px",
                }}
              >
                View Status
              </button>
            </div>
          ) : (
            <button
              onClick={onApply}
              className="btn btn-primary btn-full"
              style={{ fontSize: 13, padding: "8px 12px" }}
            >
              Apply Now
            </button>
          )
        ) : (
          <button
            onClick={onLogin}
            className="btn btn-primary btn-full"
            style={{ fontSize: 13, padding: "8px 12px" }}
          >
            Login to Apply
          </button>
        )}
      </div>
    );
  }

  // Compact desktop layout
  return (
    <div className="card" style={{ padding: "12px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "start" }}>
        {/* Left: Job Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title and Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h4 style={{ 
              margin: 0, 
              fontSize: 16, 
              fontWeight: 600, 
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {job.title}
            </h4>
            {job.workType && (
              <span
                className={`badge badge-${job.workType === 'Locum' ? 'warning' : 'info'}`}
                style={{ fontSize: 11, padding: "2px 8px", flexShrink: 0 }}
              >
                {job.workType}
              </span>
            )}
          </div>
          
          {/* Hospital */}
          <p style={{ margin: "0 0 8px 0", fontSize: 14, color: "#555", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
            {job.hospitalName}
            <MapPinButton job={job} />
          </p>
          <div style={{ marginTop: 4 }}>
            <PostedByBadge label={(job as any).postedByLabel || "Doctor"} />
          </div>

          {/* Metadata in one line */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 16px",
            fontSize: 13,
            color: "#666",
            alignItems: "center",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              📍 {job.pincode}
            </span>
            {job.department && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                🏥 {job.department}
              </span>
            )}
            {job.payscale && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500, color: "#333" }}>
                💰 {job.payscale}
              </span>
            )}
          </div>

          {/* Dates */}
          <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
            Posted: {formatDate(job.createdAt)}
            {job.requiredDate && (
              <> • Required: {typeof job.requiredDate === 'string' ? job.requiredDate : formatDate(job.requiredDate)}</>
            )}
          </div>

          {/* Remarks - only if present */}
          {job.remarks && (
            <p style={{
              margin: "8px 0 0 0",
              fontSize: 12,
              color: "#666",
              lineHeight: 1.4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}>
              {job.remarks}
            </p>
          )}
        </div>

        {/* Right: Action Button */}
        <div style={{ display: "flex", alignItems: "flex-start", paddingTop: 4 }}>
          {isLoggedIn ? (
            isApplied ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 110 }}>
                <button
                  disabled
                  className="btn btn-secondary"
                  style={{
                    fontSize: 12,
                    padding: "6px 12px",
                    cursor: "not-allowed",
                    opacity: 0.7,
                    whiteSpace: "nowrap",
                  }}
                >
                  ✓ Applied
                </button>
                <button
                  onClick={onViewStatus}
                  className="btn btn-primary"
                  style={{
                    fontSize: 12,
                    padding: "6px 12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  View Status
                </button>
              </div>
            ) : (
              <button
                onClick={onApply}
                className="btn btn-primary"
                style={{
                  fontSize: 14,
                  padding: "8px 20px",
                  whiteSpace: "nowrap",
                }}
              >
                Apply Now
              </button>
            )
          ) : (
            <button
              onClick={onLogin}
              className="btn btn-primary"
              style={{
                fontSize: 13,
                padding: "8px 16px",
                whiteSpace: "nowrap",
              }}
            >
              Login to Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isMobile,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isMobile: boolean;
}) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: isMobile ? 8 : 12,
      marginTop: 24,
      flexWrap: "wrap",
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-secondary"
        style={{
          opacity: currentPage === 1 ? 0.5 : 1,
          fontSize: isMobile ? 13 : 14,
          padding: isMobile ? "6px 12px" : "8px 16px",
        }}
      >
        {isMobile ? "←" : "← Previous"}
      </button>

      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`btn ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  minWidth: isMobile ? 32 : 36,
                  fontSize: isMobile ? 13 : 14,
                  padding: isMobile ? "6px 8px" : "8px 12px",
                }}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} style={{ padding: "6px 4px", color: "#999" }}>...</span>;
          }
          return null;
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-secondary"
        style={{
          opacity: currentPage === totalPages ? 0.5 : 1,
          fontSize: isMobile ? 13 : 14,
          padding: isMobile ? "6px 12px" : "8px 16px",
        }}
      >
        {isMobile ? "→" : "Next →"}
      </button>
    </div>
  );
}
