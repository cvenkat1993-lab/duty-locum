"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import * as XLSX from "xlsx";

interface Stats {
  totalJobs: number;
  totalApplications: number;
  totalUsers: number;
  pendingApplications: number;
  acceptedApplications: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    totalApplications: 0,
    totalUsers: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
  });
  const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "users" | "applications">("overview");
  const [jobs, setJobs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    // Check if admin is authenticated
    const isAdmin = sessionStorage.getItem("adminAuth");
    if (!isAdmin) {
      router.push("/admin-check-vc");
      return;
    }

    loadAllData();
  }, [router]);

  const loadAllData = async () => {
    try {
      // Load Jobs
      const jobsSnapshot = await getDocs(collection(db, "jobs"));
      const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsData);

      // Load Users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);

      // Load Applications
      const applicationsSnapshot = await getDocs(collection(db, "jobApplications"));
      const applicationsData = applicationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(applicationsData);

      // Calculate stats
      setStats({
        totalJobs: jobsData.length,
        totalApplications: applicationsData.length,
        totalUsers: usersData.length,
        pendingApplications: applicationsData.filter(app => app.status === "pending").length,
        acceptedApplications: applicationsData.filter(app => app.status === "accepted").length,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    sessionStorage.removeItem("adminUsername");
    router.push("/admin-check-vc");
  };

  const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportJobs = () => {
    const exportData = jobs.map(job => ({
      "Job ID": job.id,
      "Title": job.title,
      "Hospital": job.hospitalName,
      "Hospital Type": job.hospitalType,
      "Department": job.department || "N/A",
      "Work Type": job.workType || "N/A",
      "Payscale": job.payscale || "N/A",
      "Pincode": job.pincode,
      "Contact Email": job.contact,
      "Contact Phone": job.contactNo,
      "Recruiter Email": job.recruiterEmail,
      "Created At": job.createdAt?.toDate?.()?.toLocaleString() || "N/A",
    }));
    exportToExcel(exportData, "jobs");
  };

  const exportUsers = () => {
    const exportData = users.map(user => ({
      "User ID": user.id,
      "Name": user.name || "N/A",
      "Email": user.email || "N/A",
      "Phone": user.phoneNumber || "N/A",
      "Job Title": user.currentJobTitle || "N/A",
      "Institution": user.currentInstitution || "N/A",
      "Department": user.department || "N/A",
      "Experience": user.experience || "N/A",
      "Updated At": user.updatedAt?.toDate?.()?.toLocaleString() || "N/A",
    }));
    exportToExcel(exportData, "users");
  };

  const exportApplications = () => {
    const exportData = applications.map(app => ({
      "Application ID": app.id,
      "Job ID": app.jobId,
      "Status": app.status,
      "Applicant Name": app.applicantName || "N/A",
      "Applicant Email": app.applicantEmail || "N/A",
      "Applicant Phone": app.applicantPhone || "N/A",
      "Job Title": app.applicantJobTitle || "N/A",
      "Institution": app.applicantInstitution || "N/A",
      "Department": app.applicantDepartment || "N/A",
      "Experience": app.applicantExperience || "N/A",
      "Applied At": app.createdAt?.toDate?.()?.toLocaleString() || "N/A",
    }));
    exportToExcel(exportData, "applications");
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      {/* Header */}
      <div className="header">
        <div className="container">
          <div className="flex-between">
            <div>
              <h2 style={{ margin: 0 }}>🔐 Admin Dashboard</h2>
              <p className="text-small text-muted">
                Welcome, {sessionStorage.getItem("adminUsername")}
              </p>
            </div>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
        {/* Tabs */}
        <div className="tabs">
          <div
            className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview
          </div>
          <div
            className={`tab ${activeTab === "jobs" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            💼 Jobs ({stats.totalJobs})
          </div>
          <div
            className={`tab ${activeTab === "users" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            👥 Users ({stats.totalUsers})
          </div>
          <div
            className={`tab ${activeTab === "applications" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            📨 Applications ({stats.totalApplications})
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <h3 style={{ marginBottom: 20 }}>Platform Statistics</h3>
            
            <div className="grid-2" style={{ marginBottom: 30 }}>
              <div className="card" style={{ textAlign: "center", padding: 30 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>💼</div>
                <h2 style={{ margin: 0, color: "var(--primary)" }}>{stats.totalJobs}</h2>
                <p className="text-muted">Total Jobs Posted</p>
              </div>

              <div className="card" style={{ textAlign: "center", padding: 30 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>👥</div>
                <h2 style={{ margin: 0, color: "var(--success)" }}>{stats.totalUsers}</h2>
                <p className="text-muted">Registered Users</p>
              </div>

              <div className="card" style={{ textAlign: "center", padding: 30 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>📨</div>
                <h2 style={{ margin: 0, color: "var(--warning)" }}>{stats.totalApplications}</h2>
                <p className="text-muted">Total Applications</p>
              </div>

              <div className="card" style={{ textAlign: "center", padding: 30 }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>⏳</div>
                <h2 style={{ margin: 0, color: "#ff9800" }}>{stats.pendingApplications}</h2>
                <p className="text-muted">Pending Applications</p>
              </div>
            </div>

            <div className="card">
              <h3>Quick Actions</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                <button onClick={exportJobs} className="btn btn-primary">
                  📥 Download All Jobs
                </button>
                <button onClick={exportUsers} className="btn btn-primary">
                  📥 Download All Users
                </button>
                <button onClick={exportApplications} className="btn btn-primary">
                  📥 Download All Applications
                </button>
                <button onClick={loadAllData} className="btn btn-secondary">
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div>
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <h3>All Jobs ({jobs.length})</h3>
              <button onClick={exportJobs} className="btn btn-primary">
                📥 Export to Excel
              </button>
            </div>

            <div className="card" style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    <th style={{ padding: 12, textAlign: "left" }}>Title</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Hospital</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Department</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Location</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Contact</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 12 }}>{job.title}</td>
                      <td style={{ padding: 12 }}>{job.hospitalName}</td>
                      <td style={{ padding: 12 }}>{job.department || "N/A"}</td>
                      <td style={{ padding: 12 }}>{job.pincode}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>
                        {job.contact}<br/>
                        {job.contactNo}
                      </td>
                      <td style={{ padding: 12, fontSize: 13 }}>
                        {job.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <h3>All Users ({users.length})</h3>
              <button onClick={exportUsers} className="btn btn-primary">
                📥 Export to Excel
              </button>
            </div>

            <div className="card" style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    <th style={{ padding: 12, textAlign: "left" }}>Name</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Email</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Phone</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Job Title</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Institution</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 12 }}>{user.name || "N/A"}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>{user.email || "N/A"}</td>
                      <td style={{ padding: 12 }}>{user.phoneNumber || "N/A"}</td>
                      <td style={{ padding: 12 }}>{user.currentJobTitle || "N/A"}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>{user.currentInstitution || "N/A"}</td>
                      <td style={{ padding: 12 }}>{user.department || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div>
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <h3>All Applications ({applications.length})</h3>
              <button onClick={exportApplications} className="btn btn-primary">
                📥 Export to Excel
              </button>
            </div>

            <div className="card" style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    <th style={{ padding: 12, textAlign: "left" }}>Status</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Applicant</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Contact</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Job Title</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Institution</th>
                    <th style={{ padding: 12, textAlign: "left" }}>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 12 }}>
                        <span className={`badge badge-${app.status}`}>
                          {app.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>{app.applicantName || "N/A"}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>
                        {app.applicantEmail}<br/>
                        {app.applicantPhone}
                      </td>
                      <td style={{ padding: 12 }}>{app.applicantJobTitle || "N/A"}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>{app.applicantInstitution || "N/A"}</td>
                      <td style={{ padding: 12, fontSize: 13 }}>
                        {app.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
