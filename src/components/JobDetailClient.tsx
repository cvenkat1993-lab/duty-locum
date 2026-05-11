"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, applyForJob } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Job } from "@/types/job";
import { useRouter } from "next/navigation";

interface JobDetailClientProps {
  job: Job;
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if already applied
        const { getDoc: gd, doc: d } = await import("firebase/firestore");
        const appSnap = await gd(d(db, "jobApplications", `${(job as any).id}_${firebaseUser.uid}`));
        if (appSnap.exists()) setApplied(true);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [job]);

  const handleApply = async () => {
    if (!user) { router.push("/login"); return; }

    // Check profile complete + not non-doctor
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) {
      if (confirm("Please complete your profile before applying. Go to profile now?")) {
        router.push("/profile");
      }
      return;
    }
    const data = snap.data();
    if (data.userType === "non-doctor") {
      alert("Only doctors can apply for jobs. Non-doctor accounts are for posting jobs only.");
      return;
    }
    if (!data.name || !data.phoneNumber) {
      if (confirm("Please complete your profile before applying. Go to profile now?")) {
        router.push("/profile");
      }
      return;
    }

    setApplying(true);
    try {
      await applyForJob((job as any).id, user.uid, (job as any).recruiterId || "");
      setApplied(true);
      alert("✓ Application submitted successfully!");
    } catch (e: any) {
      alert(e.message || "Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <div style={{ marginTop: 24, padding: 20, border: "1px dashed #ccc", borderRadius: 10, background: "#fafafa" }}>
        <p style={{ color: "#555", marginBottom: 16 }}>🔒 Login to apply for this position</p>
        <button onClick={() => router.push("/login")} className="btn btn-primary">
          Sign in with Google
        </button>
      </div>
    );
  }

  if (applied) {
    return (
      <div style={{ marginTop: 24, padding: 16, background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 10 }}>
        <p style={{ color: "#2e7d32", fontWeight: 600, margin: 0 }}>✓ You have applied for this position</p>
      </div>
    );
  }

  if ((job as any).recruiterId === user.uid) {
    return (
      <div style={{ marginTop: 24, padding: 16, background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10 }}>
        <p style={{ color: "#7a5300", margin: 0 }}>This is your own job posting.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={handleApply}
        disabled={applying}
        className="btn btn-primary"
        style={{ minWidth: 180 }}
      >
        {applying ? "Submitting..." : "Apply Now"}
      </button>
    </div>
  );
}
