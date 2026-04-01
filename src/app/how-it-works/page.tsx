"use client";

import Header from "@/components/Header";

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 900 }}>
        <div className="card">
          <h1 style={{ marginBottom: 24 }}>How It Works</h1>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>🩺 For Doctors</h2>
          
          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 1: Create Your Profile</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Sign up with your Google account and complete your professional profile. Add your education, 
            current position, specialty, experience, and contact details.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 2: Search for Jobs</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Browse available positions using our location-based search. Filter by department, hospital type, 
            and work type to find opportunities that match your preferences.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 3: Apply with One Click</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Express your interest in positions that appeal to you. Your complete profile will be shared 
            with the hospital recruiter automatically.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 4: Track Your Applications</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Monitor the status of your applications in your dashboard. When a hospital accepts your application, 
            you'll receive their contact details to proceed with the interview process.
          </p>

          <div style={{ height: 40 }}></div>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>🏥 For Hospitals & Recruiters</h2>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 1: Sign Up & Verify</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Create an account using your institutional email. Complete your profile with hospital details 
            and contact information.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 2: Post Job Openings</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            List your vacant positions with detailed requirements. Choose between permanent positions and 
            locum duties. Our system auto-detects your hospital location for better candidate matching.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 3: Review Applications</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Access your recruiter dashboard to view all applications. Review candidate profiles including 
            education, experience, current institution, and specialty.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 4: Accept or Decline</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Accept promising candidates to reveal their contact information and proceed with interviews. 
            Declined applications are marked appropriately for your records.
          </p>

          <div style={{ marginTop: 40, padding: 24, background: "#f0f7ff", borderRadius: 8, border: "1px solid #d0e7ff" }}>
            <h3 style={{ margin: "0 0 12px 0" }}>💡 Pro Tips</h3>
            <ul style={{ lineHeight: 1.8, color: "#333", margin: 0 }}>
              <li>Complete your profile fully to increase visibility</li>
              <li>Keep your contact information up to date</li>
              <li>Respond promptly to accepted applications</li>
              <li>Use filters to find the most relevant opportunities</li>
              <li>Check your dashboard regularly for updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
