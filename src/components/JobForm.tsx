"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db, fetchJobs } from "@/lib/firebase";

export default function JobForm() {
  const [title, setTitle] = useState("");
  const [hospital, setHospital] = useState("");
  const [pincode, setPincode] = useState("");

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, "jobs"), {
      title,
      hospitalName: hospital,
      pincode,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });

    alert("Job posted successfully!");
    setTitle("");
    setHospital("");
    setPincode("");
  };

  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 400 }}>
      <input placeholder="Job Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input placeholder="Hospital Name" value={hospital} onChange={e => setHospital(e.target.value)} />
      <input placeholder="Pincode" value={pincode} onChange={e => setPincode(e.target.value)} />

      <button onClick={handleSubmit}>Post Job</button>
    </div>
  );
}
