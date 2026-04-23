"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import UserProfileTab from "@/components/profile/UserProfileTab";
import JobsPostedTab from "@/components/JobsPostedTab";
import JobsAppliedTab from "@/components/JobsAppliedTab";
import Header from "@/components/Header";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "posted" | "applied">("profile");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <GoogleMapsProvider>
      <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
        {/* Header */}
        <Header />

      {/* Main Content */}
      <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
        {/* Tabs */}
        <div className="tabs">
          <div
            className={`tab ${tab === "profile" ? "tab-active" : ""}`}
            onClick={() => setTab("profile")}
          >
            👤 User Profile
          </div>
          {/* <div
            className={`tab ${tab === "posted" ? "tab-active" : ""}`}
            onClick={() => setTab("posted")}
          >
            💼 Jobs Posted
          </div>
          <div
            className={`tab ${tab === "applied" ? "tab-active" : ""}`}
            onClick={() => setTab("applied")}
          >
            📋 Jobs Applied
          </div> */}
        </div>

        {/* Tab Content */}
        <div style={{ marginTop: 20 }}>
          {tab === "profile" && <UserProfileTab user={user} />}
          {tab === "posted" && <JobsPostedTab userId={user.uid} />}
          {tab === "applied" && <JobsAppliedTab userId={user.uid} />}
        </div>
      </div>
      </div>
    </GoogleMapsProvider>
  );
}
