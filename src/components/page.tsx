"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import HomeLoginBanner from "@/components/HomeLoginBanner";
import MapView from "@/components/MapView";
import JobListPanel from "@/components/JobListPanel";
import { getDistanceKm } from "@/lib/geo";
import { Job } from "@/types/job";
import { onAuthStateChanged } from "firebase/auth";
import { auth, fetchJobs, applyForJob, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [mapCenter, setMapCenter] = useState({ lat: 22.9734, lng: 78.6569 });
  const [user, setUser] = useState<any>(null);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [mapJobs, setMapJobs] = useState<Job[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<Job[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [showMobileView, setShowMobileView] = useState<'map' | 'list'>('map');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setAppliedJobIds(new Set());
    });
  }, []);

  useEffect(() => {
    fetchJobs().then(setAllJobs);
  }, []);

  const handleSearch = (filters: {
    lat?: number;
    lng?: number;
    hospitalName?: string;
  }) => {
    let results = allJobs;

    if (filters.lat && filters.lng) {
      setMapCenter({ lat: filters.lat, lng: filters.lng });

      results = allJobs.filter((job) => {
        if (!job.hospGeo) return false;

        const lat = "latitude" in job.hospGeo
          ? (job.hospGeo as any).latitude
          : job.hospGeo.lat;

        const lng = "longitude" in job.hospGeo
          ? (job.hospGeo as any).longitude
          : job.hospGeo.lng;

        return getDistanceKm(filters.lat!, filters.lng!, lat, lng) <= 10;
      });
    }

    if (filters.hospitalName) {
      results = results.filter((job) =>
        job.hospitalName.toLowerCase().includes(filters.hospitalName!.toLowerCase())
      );
    }

    setMapJobs(results);
    setSelectedJobs([]);
    
    // On mobile, show list after search
    if (isMobile && results.length > 0) {
      setShowMobileView('list');
    }
  };

  const handleMarkerClick = (job: Job) => {
    setSelectedJobs(mapJobs.filter((j) => j.hospitalName === job.hospitalName));
    
    // On mobile, switch to list view
    if (isMobile) {
      setShowMobileView('list');
    }
  };

  const handleApply = async (job: Job) => {
    if (!user) {
      alert("Please login to apply");
      return;
    }

    if (job.recruiterId === user.uid) {
      alert("You cannot apply to your own job posting");
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
    if (!profileData.name || !profileData.education || !profileData.currentInstitution) {
      if (confirm("Please complete all required fields in your profile. Go to profile now?")) {
        router.push("/profile");
      }
      return;
    }

    if (appliedJobIds.has(job.id)) {
      alert("You have already applied to this job");
      return;
    }

    try {
      const result = await applyForJob(job.id, user.uid, job.recruiterId || "");

      if (result.success) {
        setAppliedJobIds(new Set(appliedJobIds).add(job.id));
        alert("Interest sent to recruiter!");
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      console.error("Apply error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Sticky Header */}
      <div className="header">
        <div className="container header-content">
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <HomeLoginBanner />
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <PostJobCTA />
            <ProfileMenu />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ flex: 1, paddingTop: "20px", paddingBottom: "20px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ marginBottom: "8px" }}>Find Duty Locum - Doctor Jobs Near You</h1>
          <p className="text-muted">Search by location or hospital name</p>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Mobile Toggle Buttons */}
        {isMobile && (selectedJobs.length > 0 || mapJobs.length > 0) && (
          <div style={{
            display: "flex",
            gap: "8px",
            marginTop: "16px",
            marginBottom: "16px",
            position: "sticky",
            top: "70px",
            zIndex: 50,
            background: "white",
            padding: "8px 0",
            borderRadius: "8px",
          }}>
            <button
              onClick={() => setShowMobileView('map')}
              className={showMobileView === 'map' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ flex: 1 }}
            >
              🗺️ Map ({mapJobs.length})
            </button>
            <button
              onClick={() => setShowMobileView('list')}
              className={showMobileView === 'list' ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ flex: 1 }}
            >
              📋 Jobs ({selectedJobs.length || mapJobs.length})
            </button>
          </div>
        )}

        {/* Map and Job List */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
          gap: isMobile ? 0 : 20,
          marginTop: 20,
        }}>
          {/* Map */}
          {(!isMobile || showMobileView === 'map') && (
            <div style={{
              height: isMobile ? "60vh" : "70vh",
              minHeight: "400px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}>
              <MapView
                center={mapCenter}
                jobs={mapJobs}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          )}

          {/* Job List */}
          {(!isMobile || showMobileView === 'list') && (
            <div style={{
              height: isMobile ? "calc(100vh - 280px)" : "70vh",
              overflow: "auto",
            }}>
              <JobListPanel
                jobs={selectedJobs.length > 0 ? selectedJobs : mapJobs}
                isLoggedIn={!!user}
                onApply={handleApply}
              />
            </div>
          )}
        </div>

        {/* No Results Message */}
        {mapJobs.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            marginTop: "20px",
          }}>
            <p className="text-muted">No jobs found. Try searching by location or hospital name.</p>
          </div>
        )}
      </div>
    </div>
  );
}
