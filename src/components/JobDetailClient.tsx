"use client"; // Client component needed for Firebase auth

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, fetchJobs } from "@/lib/firebase";
import { Job } from "@/types/job";
import GoogleLoginButton from "./GoogleLoginButton";

interface JobDetailClientProps {
  job: Job;
}

export default function JobDetailClient({ job }: JobDetailClientProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setLoggedIn(true);
        setUser(firebaseUser);
      } else {
        setLoggedIn(false);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <main style={{ padding: 30, maxWidth: 800 }}>
      {/* Public info */}
      <h1>{job.title}</h1>
      <p><strong>Hospital:</strong> {job.hospitalName}</p>
      <p><strong>Pincode:</strong> {job.pincode}</p>

      <hr />

      {/* Login-gated info */}
      {loggedIn ? (
  <>
    <h3>Job Details</h3>

    <p><strong>Department:</strong> {job.department || "Not specified"}</p>
    <p><strong>Pay Scale:</strong> {job.payscale || "As per discussion"}</p>
    <p><strong>Contact:</strong> {job.contact || "Available after apply"}</p>

    <p style={{ color: "green" }}>
      Logged in as {user?.email}
    </p>

    <GoogleLoginButton loggedIn={true} />
  </>
) : (
  <div
    style={{
      border: "1px dashed #ccc",
      padding: 16,
      borderRadius: 8,
      marginTop: 20,
    }}
  >
    <p style={{ color: "red" }}>
      🔒 Login to view pay scale & contact details
    </p>

    <GoogleLoginButton loggedIn={false} />
  </div>
)}

    </main>
  );
}
