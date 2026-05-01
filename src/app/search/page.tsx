"use client";

import { useState } from "react";
import { jobs } from "@/data/jobs";

export default function SearchPage() {
  const [pincode, setPincode] = useState("");
  const [hospital, setHospital] = useState("");

  const filteredJobs = jobs.filter(job =>
    (!pincode || job.pincode.includes(pincode)) &&
    (!hospital || job.hospitalName.toLowerCase().includes(hospital.toLowerCase()))
  );

  return (
    <main style={{ padding: 30 }}>
      <h1>Find Duty Locum - Doctor Jobs</h1>

      <input
        placeholder="Pincode"
        value={pincode}
        onChange={(e) => setPincode(e.target.value)}
      />

      <input
        placeholder="Hospital Name"
        value={hospital}
        onChange={(e) => setHospital(e.target.value)}
        style={{ marginLeft: 10 }}
      />

      <div style={{ marginTop: 20 }}>
        {filteredJobs.map(job => (
          <div key={job.id} style={{ border: "1px solid #ccc", padding: 15, marginBottom: 10 }}>
            <h3>{job.title}</h3>
            <p>{job.hospitalName} – {job.pincode}</p>
            <p>Dept: {job.department}</p>
            <p>Experience: {job.remarks}</p>

            <strong style={{ color: "red" }}>
              Login to view salary & contact details
            </strong>
          </div>
        ))}
      </div>
    </main>
  );
}
