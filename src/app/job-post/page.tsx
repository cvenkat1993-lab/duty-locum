"use client";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db, fetchJobs } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JobForm from "@/components/JobForm";

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  if (loading) return <p>Checking login…</p>;

  return (
    <main style={{ padding: 30 }}>
      <h1>Post a Job Opening</h1>
      <JobForm />
    </main>
  );
}
