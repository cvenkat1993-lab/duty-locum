// Server Component — static content, no interactivity needed
import { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "How It Works | Doctor Jobs — Apply for Medical Jobs in India",
  description:
    "Learn how Doctor Jobs works for doctors and hospitals. Create a profile, search for jobs by location or specialty, apply with one click, and get hired. Free for doctors.",
  openGraph: {
    title: "How Doctor Jobs Works — For Doctors and Hospitals",
    description:
      "Step-by-step guide to finding doctor jobs or posting medical vacancies in India. Simple, fast, and free to use.",
  },
};

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 900 }}>
        <div className="card">
          <h1 style={{ marginBottom: 8 }}>How It Works</h1>
          <p style={{ color: "#666", marginBottom: 32, fontSize: 16 }}>
            Doctor Jobs connects medical professionals with hospitals and clinics across India.
            Here is how the platform works for both doctors and recruiters.
          </p>

          {/* For Doctors */}
          <h2 style={{ marginTop: 32, marginBottom: 16 }}>🩺 For Doctors</h2>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 1: Create Your Profile</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Sign up with your Google account and complete your doctor profile. Add your education
            qualification (MBBS, MD, MS, DNB, etc.), current job title, current institution,
            department or specialty, years of experience, and phone number. Your profile is used
            to apply for jobs — complete it once and apply everywhere.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 2: Search for Jobs</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Use the location-based search on the home page to find doctor jobs near you, or browse
            all listings on the Browse Jobs page. Filter by job title, department or specialty, and
            work type (full-time, part-time, locum, contract, visiting). Jobs are listed from
            hospitals, clinics, nursing homes, and diagnostic centres across India.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 3: Apply with One Click</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Express your interest in a position by clicking Apply Now. Your complete profile —
            including education, experience, current institution, and specialty — is shared with
            the hospital recruiter automatically. No need to fill in forms for every application.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 4: Track Your Applications</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Monitor all your applications from the My Applications page. When a hospital accepts
            your application, their contact details — email and phone — are revealed so you can
            connect directly and proceed with the interview or joining process.
          </p>

          <div style={{ height: 40 }} />

          {/* For Hospitals */}
          <h2 style={{ marginTop: 32, marginBottom: 16 }}>🏥 For Hospitals &amp; Recruiters</h2>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 1: Sign Up</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Create an account using your Google login. Complete your profile with your name,
            hospital or institution details, and contact information. This information is used
            across all your job postings.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 2: Post a Job or Locum Duty</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            List your vacant positions using Post a Job (for permanent and contract roles) or Post
            Locum Duty (for short-term or daily duty requirements). Our system uses Google Places
            to auto-detect your hospital location and pincode, making it easier for nearby doctors
            to find your listing.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 3: Review Applications</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Access your Recruiter Dashboard to view all applications received for your job
            postings. Review each applicant's education, current job title, institution,
            department, and experience — all in one place.
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 18 }}>Step 4: Accept or Decline</h3>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Accept promising candidates to reveal their phone number and connect directly.
            Declined applications are recorded in your dashboard. There are no placement fees —
            you hire directly from the platform.
          </p>

          <div style={{ marginTop: 40, padding: 24, background: "#f0f7ff", borderRadius: 8, border: "1px solid #d0e7ff" }}>
            <h3 style={{ margin: "0 0 12px 0" }}>💡 Tips for Best Results</h3>
            <ul style={{ lineHeight: 1.8, color: "#333", margin: 0 }}>
              <li>Doctors: complete your profile fully before applying — incomplete profiles are less likely to be accepted</li>
              <li>Hospitals: add payscale and department details to attract more relevant applicants</li>
              <li>Use the location search to find jobs within 10 km of your preferred area</li>
              <li>Recruiters: respond to applications promptly — doctors are often applying to multiple positions</li>
              <li>Check your dashboard regularly for new applications and status updates</li>
            </ul>
          </div>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <a href="/browse-jobs" className="btn btn-primary" style={{ marginRight: 16 }}>
              Browse Doctor Jobs
            </a>
            <a href="/post-job" className="btn btn-secondary">
              Post a Job
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
